"use server";
import { useMutation } from "@/lib/safe-action";
import { z } from "zod";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/drizzle";
import { user, company, subscription, billingPlan } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Schéma pour créer une session de checkout
const createCheckoutSessionSchema = z.object({
    priceId: z.string().min(1, "Price ID requis"),
    billingPlanId: z.string().min(1, "Plan de facturation requis"),
});

// Schéma pour créer un portail de facturation
const createBillingPortalSchema = z.object({
    customerId: z.string().min(1, "Customer ID requis"),
});

// Schéma pour passer au plan gratuit
const switchToFreePlanSchema = z.object({
    companyId: z.string().min(1, "Company ID requis"),
});

// Schéma pour gérer les webhooks Stripe
const stripeWebhookSchema = z.object({
    type: z.string(),
    data: z.object({
        object: z.any(),
    }),
});

// Action pour créer une session de checkout Stripe
export const createCheckoutSessionAction = useMutation(
    createCheckoutSessionSchema,
    async (input, { userId }) => {
        try {
            // Vérifier que l'utilisateur est connecté
            const session = await auth.api.getSession({
                headers: await headers()
            });

            if (!session?.user || session.user.id !== userId) {
                throw new Error("Non autorisé");
            }

            // Récupérer les informations de l'utilisateur et de l'entreprise
            const userData = await db
                .select({
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                    },
                    company: {
                        id: company.id,
                        name: company.name,
                        email: company.email,
                    }
                })
                .from(user)
                .leftJoin(company, eq(user.companyId, company.id))
                .where(eq(user.id, userId))
                .limit(1);

            if (!userData.length || !userData[0].company) {
                throw new Error("Utilisateur ou entreprise non trouvé");
            }

            const { user: currentUser, company: currentCompany } = userData[0];

            // Vérifier que l'utilisateur est propriétaire
            if (currentUser.role !== 'owner') {
                throw new Error("Seul le propriétaire peut gérer l'abonnement");
            }

            // Vérifier que le plan de facturation existe
            const plan = await db
                .select()
                .from(billingPlan)
                .where(eq(billingPlan.id, input.billingPlanId))
                .limit(1);

            if (!plan.length) {
                throw new Error("Plan de facturation non trouvé");
            }

            // Vérifier s'il y a un abonnement existant à annuler
            const existingSubscription = await db
                .select()
                .from(subscription)
                .where(eq(subscription.companyId, currentCompany.id))
                .limit(1);

            if (existingSubscription.length > 0 && existingSubscription[0].stripeSubscriptionId) {
                // Annuler l'abonnement existant immédiatement
                try {
                    await stripe.subscriptions.cancel(existingSubscription[0].stripeSubscriptionId);
                    console.log(`Abonnement existant ${existingSubscription[0].stripeSubscriptionId} annulé`);
                } catch (error) {
                    console.error("Erreur lors de l'annulation de l'abonnement existant:", error);
                    // Continue quand même avec le nouveau checkout
                }
            }

            // Créer ou récupérer le customer Stripe
            let stripeCustomerId: string;

            // Chercher un customer existant
            const existingCustomers = await stripe.customers.list({
                email: currentCompany.email,
                limit: 1,
            });

            if (existingCustomers.data.length > 0) {
                stripeCustomerId = existingCustomers.data[0].id;
            } else {
                // Créer un nouveau customer
                const customer = await stripe.customers.create({
                    email: currentCompany.email,
                    name: currentCompany.name,
                    metadata: {
                        companyId: currentCompany.id,
                        userId: currentUser.id,
                    },
                });
                stripeCustomerId = customer.id;
            }

            // Créer la session de checkout
            const checkoutSession = await stripe.checkout.sessions.create({
                customer: stripeCustomerId,
                mode: 'subscription',
                line_items: [
                    {
                        price: input.priceId,
                        quantity: 1,
                    },
                ],
                success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing?success=true`,
                cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing?canceled=true`,
                metadata: {
                    companyId: currentCompany.id,
                    billingPlanId: input.billingPlanId,
                },
            });

            return {
                success: true,
                checkoutUrl: checkoutSession.url,
                message: "Session de checkout créée avec succès",
            };

        } catch (error) {
            console.error("Erreur lors de la création de la session de checkout:", error);
            throw new Error(error instanceof Error ? error.message : "Erreur lors de la création de la session de checkout");
        }
    }
);

// Action pour passer au plan gratuit
export const switchToFreePlanAction = useMutation(
    switchToFreePlanSchema,
    async (input, { userId }) => {
        try {
            // Vérifier que l'utilisateur est connecté
            const session = await auth.api.getSession({
                headers: await headers()
            });

            if (!session?.user || session.user.id !== userId) {
                throw new Error("Non autorisé");
            }

            // Vérifier que l'utilisateur est propriétaire
            const userData = await db
                .select({
                    role: user.role,
                })
                .from(user)
                .where(eq(user.id, userId))
                .limit(1);

            if (!userData.length || userData[0].role !== 'owner') {
                throw new Error("Seul le propriétaire peut gérer l'abonnement");
            }

            // Récupérer l'abonnement actuel
            const currentSubscription = await db
                .select()
                .from(subscription)
                .where(eq(subscription.companyId, input.companyId))
                .limit(1);

            if (!currentSubscription.length || !currentSubscription[0].stripeSubscriptionId) {
                throw new Error("Aucun abonnement actif trouvé");
            }

            // Marquer l'abonnement Stripe pour annulation à la fin de la période
            const updatedStripeSubscription = await stripe.subscriptions.update(currentSubscription[0].stripeSubscriptionId, {
                cancel_at_period_end: true,
            });

            // Récupérer les données complètes de l'abonnement pour avoir les dates à jour
            const fullStripeSubscription = await stripe.subscriptions.retrieve(currentSubscription[0].stripeSubscriptionId);

            // Convertir les timestamps Stripe en dates JavaScript
            const stripeData = fullStripeSubscription as any;
            const currentPeriodStart = stripeData.current_period_start
                ? new Date(stripeData.current_period_start * 1000)
                : new Date();

            const currentPeriodEnd = stripeData.current_period_end
                ? new Date(stripeData.current_period_end * 1000)
                : new Date();

            // Mettre à jour la base de données avec les dates correctes
            await db
                .update(subscription)
                .set({
                    cancelAtPeriodEnd: true,
                    currentPeriodStart,
                    currentPeriodEnd,
                    updatedAt: new Date(),
                })
                .where(eq(subscription.companyId, input.companyId));

            return {
                success: true,
                message: "Votre abonnement sera annulé à la fin de la période de facturation actuelle",
            };

        } catch (error) {
            console.error("Erreur lors du passage au plan gratuit:", error);
            throw new Error(error instanceof Error ? error.message : "Erreur lors du passage au plan gratuit");
        }
    }
);

// Action pour créer un portail de facturation
export const createBillingPortalAction = useMutation(
    createBillingPortalSchema,
    async (input, { userId }) => {
        try {
            // Vérifier que l'utilisateur est connecté
            const session = await auth.api.getSession({
                headers: await headers()
            });

            if (!session?.user || session.user.id !== userId) {
                throw new Error("Non autorisé");
            }

            // Vérifier que l'utilisateur est propriétaire
            const userData = await db
                .select({
                    role: user.role,
                })
                .from(user)
                .where(eq(user.id, userId))
                .limit(1);

            if (!userData.length || userData[0].role !== 'owner') {
                throw new Error("Seul le propriétaire peut gérer l'abonnement");
            }

            // Créer la session du portail de facturation
            const portalSession = await stripe.billingPortal.sessions.create({
                customer: input.customerId,
                return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing`,
            });

            return {
                success: true,
                portalUrl: portalSession.url,
                message: "Portail de facturation créé avec succès",
            };

        } catch (error) {
            console.error("Erreur lors de la création du portail de facturation:", error);
            throw new Error(error instanceof Error ? error.message : "Erreur lors de la création du portail de facturation");
        }
    }
);

// Action pour récupérer les informations d'abonnement
export const getSubscriptionInfoAction = useMutation(
    z.object({}),
    async (input, { userId }) => {
        try {
            // Vérifier que l'utilisateur est connecté
            const session = await auth.api.getSession({
                headers: await headers()
            });

            if (!session?.user || session.user.id !== userId) {
                throw new Error("Non autorisé");
            }

            // Récupérer les informations de l'abonnement
            const subscriptionData = await db
                .select({
                    subscription: {
                        id: subscription.id,
                        status: subscription.status,
                        stripeCustomerId: subscription.stripeCustomerId,
                        stripeSubscriptionId: subscription.stripeSubscriptionId,
                        currentPeriodStart: subscription.currentPeriodStart,
                        currentPeriodEnd: subscription.currentPeriodEnd,
                        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
                    },
                    plan: {
                        id: billingPlan.id,
                        name: billingPlan.name,
                        description: billingPlan.description,
                        price: billingPlan.price,
                        currency: billingPlan.currency,
                        interval: billingPlan.interval,
                        maxUsers: billingPlan.maxUsers,
                        maxClients: billingPlan.maxClients,
                        maxInvoices: billingPlan.maxInvoices,
                        features: billingPlan.features,
                    },
                    company: {
                        id: company.id,
                        name: company.name,
                    }
                })
                .from(user)
                .leftJoin(company, eq(user.companyId, company.id))
                .leftJoin(subscription, eq(subscription.companyId, company.id))
                .leftJoin(billingPlan, eq(subscription.billingPlanId, billingPlan.id))
                .where(eq(user.id, userId))
                .limit(1);

            if (!subscriptionData.length || !subscriptionData[0].company) {
                throw new Error("Utilisateur ou entreprise non trouvé");
            }

            const data = subscriptionData[0];

            // Si l'abonnement existe dans Stripe, récupérer les informations à jour
            let stripeSubscription = null;
            if (data.subscription?.stripeSubscriptionId) {
                try {
                    stripeSubscription = await stripe.subscriptions.retrieve(data.subscription.stripeSubscriptionId);
                } catch (error) {
                    console.error("Erreur lors de la récupération de l'abonnement Stripe:", error);
                }
            }

            return {
                success: true,
                data: {
                    subscription: data.subscription,
                    plan: data.plan,
                    company: data.company,
                    stripeSubscription,
                },
            };

        } catch (error) {
            console.error("Erreur lors de la récupération des informations d'abonnement:", error);
            throw new Error(error instanceof Error ? error.message : "Erreur lors de la récupération des informations d'abonnement");
        }
    }
); 
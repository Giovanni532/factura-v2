import { db } from "@/lib/drizzle";
import { billingPlan, subscription, user, company } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { stripe } from "@/lib/stripe";

// Récupérer tous les plans de facturation actifs
export async function getBillingPlans() {
    const plans = await db
        .select({
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
            isActive: billingPlan.isActive,
        })
        .from(billingPlan)
        .where(eq(billingPlan.isActive, true))
        .orderBy(billingPlan.price);

    return plans.map(plan => ({
        ...plan,
        features: plan.features ? JSON.parse(plan.features) : [],
    }));
}

// Récupérer les informations d'abonnement d'une entreprise
export async function getCompanySubscription(companyId: string) {
    const result = await db
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
                isActive: billingPlan.isActive,
            },
            company: {
                id: company.id,
                name: company.name,
                email: company.email,
            }
        })
        .from(subscription)
        .leftJoin(billingPlan, eq(subscription.billingPlanId, billingPlan.id))
        .leftJoin(company, eq(subscription.companyId, company.id))
        .where(eq(subscription.companyId, companyId))
        .limit(1);

    if (!result.length) {
        // Retourner le plan gratuit par défaut si aucun abonnement
        const freePlan = await db
            .select()
            .from(billingPlan)
            .where(eq(billingPlan.id, 'free-plan'))
            .limit(1);

        const companyData = await db
            .select({
                id: company.id,
                name: company.name,
                email: company.email,
            })
            .from(company)
            .where(eq(company.id, companyId))
            .limit(1);

        return {
            subscription: null,
            plan: freePlan[0] ? {
                ...freePlan[0],
                features: freePlan[0].features ? JSON.parse(freePlan[0].features) : [],
            } : null,
            company: companyData[0] || null,
        };
    }

    const data = result[0];
    return {
        subscription: data.subscription,
        plan: data.plan ? {
            ...data.plan,
            features: data.plan.features ? JSON.parse(data.plan.features) : [],
        } : null,
        company: data.company,
    };
}

// Récupérer les informations d'abonnement complets avec Stripe
export async function getCompanySubscriptionWithStripe(companyId: string) {
    const subscriptionData = await getCompanySubscription(companyId);

    if (!subscriptionData.subscription?.stripeSubscriptionId) {
        return subscriptionData;
    }

    try {
        // Récupérer les informations à jour depuis Stripe
        const stripeSubscription = await stripe.subscriptions.retrieve(
            subscriptionData.subscription.stripeSubscriptionId,
            {
                expand: ['items.data.price.product']
            }
        );

        // Extraire seulement les propriétés nécessaires (sérialisables)
        const stripeData = stripeSubscription as any;
        const serializedStripeSubscription = {
            id: stripeData.id,
            status: stripeData.status,
            current_period_start: stripeData.current_period_start,
            current_period_end: stripeData.current_period_end,
            cancel_at_period_end: stripeData.cancel_at_period_end,
            canceled_at: stripeData.canceled_at,
            created: stripeData.created,
            customer: stripeData.customer,
            items: {
                data: stripeData.items.data.map((item: any) => ({
                    id: item.id,
                    price: {
                        id: item.price.id,
                        unit_amount: item.price.unit_amount,
                        currency: item.price.currency,
                        recurring: item.price.recurring,
                        product: typeof item.price.product === 'string' ? item.price.product : {
                            id: item.price.product?.id,
                            name: item.price.product?.name,
                            description: item.price.product?.description,
                        }
                    },
                    quantity: item.quantity,
                }))
            }
        };

        return {
            ...subscriptionData,
            stripeSubscription: serializedStripeSubscription,
        };
    } catch (error) {
        console.error("Erreur lors de la récupération de l'abonnement Stripe:", error);
        return subscriptionData;
    }
}

// Types pour les plans de facturation
export interface BillingPlan {
    id: string;
    name: string;
    description: string | null;
    price: number;
    currency: string;
    interval: string;
    maxUsers: number;
    maxClients: number;
    maxInvoices: number;
    features: string[];
    isActive: boolean;
}

export interface CompanySubscription {
    subscription: {
        id: string;
        status: string;
        stripeCustomerId: string | null;
        stripeSubscriptionId: string | null;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        cancelAtPeriodEnd: boolean;
    } | null;
    plan: BillingPlan | null;
    company: {
        id: string;
        name: string;
        email: string;
    } | null;
    stripeSubscription?: {
        id: string;
        status: string;
        current_period_start: number;
        current_period_end: number;
        cancel_at_period_end: boolean;
        canceled_at: number | null;
        created: number;
        customer: string;
        items: {
            data: Array<{
                id: string;
                price: {
                    id: string;
                    unit_amount: number;
                    currency: string;
                    recurring: any;
                    product: string | {
                        id: string;
                        name: string;
                        description: string;
                    };
                };
                quantity: number;
            }>;
        };
    };
} 
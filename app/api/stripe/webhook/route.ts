import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/drizzle";
import { subscription, company, billingPlan } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import Stripe from "stripe";
import { revalidatePath } from "next/cache";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature || !endpointSecret) {
        console.error("❌ Signature Stripe manquante ou secret webhook non configuré");
        return NextResponse.json(
            { error: "Signature manquante ou configuration invalide" },
            { status: 400 }
        );
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
        console.error("❌ Erreur de validation du webhook Stripe:", err);
        return NextResponse.json(
            { error: "Signature invalide" },
            { status: 400 }
        );
    }

    try {
        switch (event.type) {
            case "checkout.session.completed":
                await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
                break;

            case "customer.subscription.created":
                await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
                break;

            case "customer.subscription.updated":
                await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
                break;

            case "customer.subscription.deleted":
                await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
                break;

            case "invoice.payment_succeeded":
                await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
                break;

            case "invoice.payment_failed":
                await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
                break;

            default:
        }

        // Revalider la page de facturation
        revalidatePath('/dashboard/settings/billing');

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("❌ Erreur lors du traitement du webhook Stripe:", error);
        return NextResponse.json(
            { error: "Erreur interne du serveur" },
            { status: 500 }
        );
    }
}

// Gérer la complétion d'une session de checkout
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const companyId = session.metadata?.companyId;
    const billingPlanId = session.metadata?.billingPlanId;

    if (!companyId || !billingPlanId) {
        return;
    }

    // Vérification de sécurité : l'entreprise doit exister
    const companyExists = await db
        .select({ id: company.id })
        .from(company)
        .where(eq(company.id, companyId))
        .limit(1);

    if (!companyExists.length) {
        return;
    }

    // Vérification de sécurité : le plan de facturation doit exister et être actif
    const planExists = await db
        .select({ id: billingPlan.id })
        .from(billingPlan)
        .where(
            and(
                eq(billingPlan.id, billingPlanId),
                eq(billingPlan.isActive, true)
            )
        )
        .limit(1);

    if (!planExists.length) {
        return;
    }

    try {
        // Récupérer l'abonnement Stripe si c'est un abonnement
        if (session.subscription) {
            if (session.subscription) {
                const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription as string);

                // 🔧 Mise à jour des métadonnées dans l'abonnement Stripe
                await stripe.subscriptions.update(stripeSubscription.id, {
                    metadata: {
                        companyId,
                        billingPlanId,
                    },
                });

                await createOrUpdateSubscription(companyId, billingPlanId, stripeSubscription, session.customer as string);
            }
        }
    } catch (error) {
    }
}

// Gérer la création d'un abonnement
async function handleSubscriptionCreated(stripeSubscription: Stripe.Subscription) {
    const companyId = stripeSubscription.metadata?.companyId;
    const billingPlanId = stripeSubscription.metadata?.billingPlanId;

    if (!companyId || !billingPlanId) {
        return;
    }

    await createOrUpdateSubscription(companyId, billingPlanId, stripeSubscription, stripeSubscription.customer as string);
}

// Gérer la mise à jour d'un abonnement
async function handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription) {
    const companyId = stripeSubscription.metadata?.companyId;
    const billingPlanId = stripeSubscription.metadata?.billingPlanId;

    if (!companyId || !billingPlanId) {
        return;
    }

    await createOrUpdateSubscription(companyId, billingPlanId, stripeSubscription, stripeSubscription.customer as string);
}

// Gérer la suppression d'un abonnement
async function handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription) {
    try {
        await db
            .update(subscription)
            .set({
                status: 'cancelled',
                cancelAtPeriodEnd: true,
                updatedAt: new Date()
            })
            .where(eq(subscription.stripeSubscriptionId, stripeSubscription.id));

    } catch (error) {
    }
}

// Gérer le paiement réussi
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    if (invoice.lines?.data[0]?.subscription) {
        const subscriptionId = typeof invoice.lines.data[0].subscription === 'string'
            ? invoice.lines.data[0].subscription
            : invoice.lines.data[0].subscription.id;
        try {
            const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
            await updateSubscriptionFromStripe(stripeSubscription);
        } catch (error) {
        }
    }
}

// Gérer le paiement échoué
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    if (invoice.lines?.data[0]?.subscription) {
        const subscriptionId = typeof invoice.lines.data[0].subscription === 'string'
            ? invoice.lines.data[0].subscription
            : invoice.lines.data[0].subscription.id;
        try {
            const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
            await updateSubscriptionFromStripe(stripeSubscription);
        } catch (error) {
        }
    }
}

// Créer ou mettre à jour un abonnement
async function createOrUpdateSubscription(
    companyId: string,
    billingPlanId: string,
    stripeSubscription: Stripe.Subscription,
    customerId: string
) {
    // Convertir le statut Stripe en statut de notre base de données
    let status: 'active' | 'cancelled' | 'past_due' | 'unpaid';
    switch (stripeSubscription.status) {
        case 'active':
            status = 'active';
            break;
        case 'canceled':
            status = 'cancelled';
            break;
        case 'past_due':
            status = 'past_due';
            break;
        case 'unpaid':
            status = 'unpaid';
            break;
        default:
            status = 'cancelled';
    }

    // Récupérer les périodes depuis l'abonnement Stripe
    const stripeData = stripeSubscription as any;
    const currentPeriodStart = stripeData.current_period_start
        ? new Date(stripeData.current_period_start * 1000)
        : new Date();

    const currentPeriodEnd = stripeData.current_period_end
        ? new Date(stripeData.current_period_end * 1000)
        : new Date();

    const subscriptionData = {
        status,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd: stripeData.cancel_at_period_end || false,
        stripeCustomerId: customerId,
        stripeSubscriptionId: stripeSubscription.id,
        billingPlanId,
        updatedAt: new Date()
    };

    try {
        // Vérifier si l'abonnement existe déjà
        const existingSubscription = await db
            .select()
            .from(subscription)
            .where(eq(subscription.companyId, companyId))
            .limit(1);

        if (existingSubscription.length > 0) {
            // Mettre à jour l'abonnement existant
            await db
                .update(subscription)
                .set(subscriptionData)
                .where(eq(subscription.companyId, companyId));
        } else {
            // Créer un nouvel abonnement
            await db
                .insert(subscription)
                .values({
                    id: crypto.randomUUID(),
                    ...subscriptionData,
                    companyId
                });
        }
    } catch (error) {
        console.error("❌ Erreur lors de la création/mise à jour de l'abonnement:", error);
        throw error;
    }
}

// Mettre à jour un abonnement existant depuis Stripe
async function updateSubscriptionFromStripe(stripeSubscription: Stripe.Subscription) {
    try {
        // Convertir le statut Stripe en statut de notre base de données
        let status: 'active' | 'cancelled' | 'past_due' | 'unpaid';
        switch (stripeSubscription.status) {
            case 'active':
                status = 'active';
                break;
            case 'canceled':
                status = 'cancelled';
                break;
            case 'past_due':
                status = 'past_due';
                break;
            case 'unpaid':
                status = 'unpaid';
                break;
            default:
                status = 'cancelled';
        }

        // Récupérer les périodes depuis l'abonnement Stripe
        const stripeData = stripeSubscription as any;
        const currentPeriodStart = stripeData.current_period_start
            ? new Date(stripeData.current_period_start * 1000)
            : new Date();

        const currentPeriodEnd = stripeData.current_period_end
            ? new Date(stripeData.current_period_end * 1000)
            : new Date();

        // Mettre à jour l'abonnement
        await db
            .update(subscription)
            .set({
                status,
                currentPeriodStart,
                currentPeriodEnd,
                cancelAtPeriodEnd: stripeData.cancel_at_period_end || false,
                updatedAt: new Date()
            })
            .where(eq(subscription.stripeSubscriptionId, stripeSubscription.id));
    } catch (error) {
        console.error("❌ Erreur lors de la mise à jour depuis Stripe:", error);
        throw error;
    }
} 
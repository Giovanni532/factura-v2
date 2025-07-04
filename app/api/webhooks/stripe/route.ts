import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/drizzle";
import { subscription, company, billingPlan } from "@/db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature || !endpointSecret) {
        console.error("Signature Stripe manquante ou secret webhook non configuré");
        return NextResponse.json(
            { error: "Signature manquante ou configuration invalide" },
            { status: 400 }
        );
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
        console.error("Erreur de validation du webhook Stripe:", err);
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
                console.log("Abonnement créé:", event.data.object);
                break;

            case "customer.subscription.updated":
                console.log("Abonnement mis à jour:", event.data.object);
                break;

            case "customer.subscription.deleted":
                console.log("Abonnement supprimé:", event.data.object);
                break;

            case "invoice.payment_succeeded":
                console.log("Paiement réussi:", event.data.object);
                break;

            case "invoice.payment_failed":
                console.log("Paiement échoué:", event.data.object);
                break;

            default:
                console.log(`Événement Stripe non géré: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Erreur lors du traitement du webhook Stripe:", error);
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
        console.error("Métadonnées manquantes dans la session de checkout");
        return;
    }

    try {
        // Récupérer l'abonnement Stripe si c'est un abonnement
        if (session.subscription) {
            const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription as string);

            // Créer ou mettre à jour l'abonnement dans la base de données
            await createOrUpdateSubscription(companyId, billingPlanId, stripeSubscription, session.customer as string);

            console.log(`Abonnement créé pour l'entreprise ${companyId}`);
        }
    } catch (error) {
        console.error("Erreur lors de la création de l'abonnement:", error);
    }
}

// Créer ou mettre à jour un abonnement
async function createOrUpdateSubscription(
    companyId: string,
    billingPlanId: string,
    stripeSubscription: Stripe.Subscription,
    customerId: string
) {
    // Vérifier que les timestamps existent avant de les convertir
    const stripeData = stripeSubscription as any;
    const currentPeriodStart = stripeData.current_period_start
        ? new Date(stripeData.current_period_start * 1000)
        : new Date();

    const currentPeriodEnd = stripeData.current_period_end
        ? new Date(stripeData.current_period_end * 1000)
        : new Date();

    const subscriptionData = {
        status: stripeSubscription.status as any,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd: stripeData.cancel_at_period_end || false,
        stripeCustomerId: customerId,
        stripeSubscriptionId: stripeSubscription.id,
        companyId,
        billingPlanId,
    };

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
            });
    }
} 
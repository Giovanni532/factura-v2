import Stripe from "stripe";
import { loadStripe, type Stripe as StripeJS } from "@stripe/stripe-js";

if (!process.env.STRIPE_PRIVATE_KEY) {
    throw new Error("STRIPE_PRIVATE_KEY est requis");
}

if (!process.env.STRIPE_PUBLIC_KEY) {
    throw new Error("STRIPE_PUBLIC_KEY est requis");
}

// Configuration Stripe côté serveur
export const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY, {
    apiVersion: "2025-06-30.basil",
    typescript: true,
});

// Configuration Stripe côté client
let stripePromise: Promise<StripeJS | null>;

export const getStripe = () => {
    if (!stripePromise) {
        stripePromise = loadStripe(process.env.STRIPE_PUBLIC_KEY!);
    }
    return stripePromise;
};

// Types pour les prix Stripe
export interface StripePrice {
    id: string;
    object: string;
    active: boolean;
    currency: string;
    unit_amount: number;
    recurring: {
        interval: string;
        interval_count: number;
    } | null;
    product: string;
}

// Types pour les abonnements
export interface StripeSubscription {
    id: string;
    object: string;
    status: string;
    current_period_start: number;
    current_period_end: number;
    cancel_at_period_end: boolean;
    customer: string;
    items: {
        data: Array<{
            id: string;
            price: StripePrice;
        }>;
    };
} 
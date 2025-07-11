import { db } from "@/lib/drizzle";
import { user, client, invoice, quote, subscription, billingPlan } from "@/db/schema";
import { eq, count } from "drizzle-orm";

export interface SubscriptionLimits {
    maxUsers: number;
    maxClients: number;
    maxInvoices: number;
    currentUsers: number;
    currentClients: number;
    currentInvoices: number;
    currentQuotes: number;
    currentDocuments: number; // devis + factures combinés
    planName: string;
}

/**
 * Récupère les limites d'abonnement et les compteurs actuels pour une entreprise
 */
export async function getSubscriptionLimits(companyId: string): Promise<SubscriptionLimits> {
    // Récupérer les informations d'abonnement
    const subscriptionData = await db
        .select({
            maxUsers: billingPlan.maxUsers,
            maxClients: billingPlan.maxClients,
            maxInvoices: billingPlan.maxInvoices,
            planName: billingPlan.name,
        })
        .from(subscription)
        .leftJoin(billingPlan, eq(subscription.billingPlanId, billingPlan.id))
        .where(eq(subscription.companyId, companyId))
        .limit(1);

    // Si pas d'abonnement, utiliser le plan gratuit par défaut
    let maxUsers = 1;
    let maxClients = 10;
    let maxInvoices = 20;
    let planName = "Gratuit";

    if (subscriptionData.length === 0) {
        // Récupérer le plan gratuit par défaut
        const freePlan = await db
            .select({
                maxUsers: billingPlan.maxUsers,
                maxClients: billingPlan.maxClients,
                maxInvoices: billingPlan.maxInvoices,
                name: billingPlan.name,
            })
            .from(billingPlan)
            .where(eq(billingPlan.id, 'free-plan'))
            .limit(1);

        if (freePlan.length > 0) {
            maxUsers = freePlan[0].maxUsers;
            maxClients = freePlan[0].maxClients;
            maxInvoices = freePlan[0].maxInvoices;
            planName = freePlan[0].name;
        }
    } else {
        const sub = subscriptionData[0];
        maxUsers = sub.maxUsers || 1;
        maxClients = sub.maxClients || 10;
        maxInvoices = sub.maxInvoices || 20;
        planName = sub.planName || "Gratuit";
    }

    // Compter les éléments actuels
    const [currentUsers] = await db
        .select({ count: count() })
        .from(user)
        .where(eq(user.companyId, companyId));

    const [currentClients] = await db
        .select({ count: count() })
        .from(client)
        .where(eq(client.companyId, companyId));

    const [currentInvoices] = await db
        .select({ count: count() })
        .from(invoice)
        .where(eq(invoice.companyId, companyId));

    const [currentQuotes] = await db
        .select({ count: count() })
        .from(quote)
        .where(eq(quote.companyId, companyId));

    const currentDocuments = currentInvoices.count + currentQuotes.count;

    return {
        maxUsers,
        maxClients,
        maxInvoices,
        currentUsers: currentUsers.count,
        currentClients: currentClients.count,
        currentInvoices: currentInvoices.count,
        currentQuotes: currentQuotes.count,
        currentDocuments,
        planName,
    };
}

/**
 * Vérifie si une entreprise peut ajouter un nouveau client
 */
export async function canAddClient(companyId: string): Promise<{ canAdd: boolean; reason?: string }> {
    const limits = await getSubscriptionLimits(companyId);

    // Si maxClients est -1, c'est illimité
    if (limits.maxClients === -1) {
        return { canAdd: true };
    }

    if (limits.currentClients >= limits.maxClients) {
        return {
            canAdd: false,
            reason: `Limite de clients atteinte pour le plan ${limits.planName} (${limits.maxClients} maximum)`
        };
    }

    return { canAdd: true };
}

/**
 * Vérifie si une entreprise peut ajouter une nouvelle facture
 * Note: Les devis et factures partagent la même limite
 */
export async function canAddInvoice(companyId: string): Promise<{ canAdd: boolean; reason?: string }> {
    const limits = await getSubscriptionLimits(companyId);

    // Si maxInvoices est -1, c'est illimité
    if (limits.maxInvoices === -1) {
        return { canAdd: true };
    }

    if (limits.currentDocuments >= limits.maxInvoices) {
        return {
            canAdd: false,
            reason: `Limite de documents atteinte pour le plan ${limits.planName} (${limits.maxInvoices} maximum pour devis + factures)`
        };
    }

    return { canAdd: true };
}

/**
 * Vérifie si une entreprise peut ajouter un nouveau devis
 * Note: Les devis et factures partagent la même limite
 */
export async function canAddQuote(companyId: string): Promise<{ canAdd: boolean; reason?: string }> {
    const limits = await getSubscriptionLimits(companyId);

    // Si maxInvoices est -1, c'est illimité
    if (limits.maxInvoices === -1) {
        return { canAdd: true };
    }

    if (limits.currentDocuments >= limits.maxInvoices) {
        return {
            canAdd: false,
            reason: `Limite de documents atteinte pour le plan ${limits.planName} (${limits.maxInvoices} maximum pour devis + factures)`
        };
    }

    return { canAdd: true };
}

/**
 * Vérifie si une entreprise peut ajouter un nouvel utilisateur
 */
export async function canAddUser(companyId: string): Promise<{ canAdd: boolean; reason?: string }> {
    const limits = await getSubscriptionLimits(companyId);

    // Si maxUsers est -1, c'est illimité
    if (limits.maxUsers === -1) {
        return { canAdd: true };
    }

    if (limits.currentUsers >= limits.maxUsers) {
        return {
            canAdd: false,
            reason: `Limite d'utilisateurs atteinte pour le plan ${limits.planName} (${limits.maxUsers} maximum)`
        };
    }

    return { canAdd: true };
}

/**
 * Vérifie si une entreprise a un abonnement actif et si l'utilisateur peut effectuer des actions
 * selon son rôle (owner peut toujours agir, autres utilisateurs seulement si abonnement actif)
 */
export async function canUserPerformAction(companyId: string, userRole: string): Promise<{ canPerform: boolean; reason?: string }> {
    // L'owner peut toujours effectuer des actions
    if (userRole === 'owner') {
        return { canPerform: true };
    }

    // Vérifier si l'entreprise a un abonnement actif
    const subscriptionData = await db
        .select({
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd,
            planName: billingPlan.name,
        })
        .from(subscription)
        .leftJoin(billingPlan, eq(subscription.billingPlanId, billingPlan.id))
        .where(eq(subscription.companyId, companyId))
        .limit(1);

    // Si pas d'abonnement ou abonnement expiré
    if (subscriptionData.length === 0) {
        return {
            canPerform: false,
            reason: "Aucun abonnement actif. Seul le propriétaire peut effectuer des actions."
        };
    }

    const sub = subscriptionData[0];

    // Vérifier si l'abonnement est actif
    if (sub.status !== 'active') {
        return {
            canPerform: false,
            reason: `Abonnement ${sub.planName} non actif. Seul le propriétaire peut effectuer des actions.`
        };
    }

    // Vérifier si l'abonnement n'est pas expiré
    if (sub.currentPeriodEnd && new Date() > new Date(sub.currentPeriodEnd)) {
        return {
            canPerform: false,
            reason: `Abonnement ${sub.planName} expiré. Seul le propriétaire peut effectuer des actions.`
        };
    }

    return { canPerform: true };
} 
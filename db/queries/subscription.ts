import { db } from "@/lib/drizzle";
import { user, client, invoice, subscription, billingPlan } from "@/db/schema";
import { eq, count } from "drizzle-orm";

export interface SubscriptionLimits {
    maxUsers: number;
    maxClients: number;
    maxInvoices: number;
    currentUsers: number;
    currentClients: number;
    currentInvoices: number;
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

    return {
        maxUsers,
        maxClients,
        maxInvoices,
        currentUsers: currentUsers.count,
        currentClients: currentClients.count,
        currentInvoices: currentInvoices.count,
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
 */
export async function canAddInvoice(companyId: string): Promise<{ canAdd: boolean; reason?: string }> {
    const limits = await getSubscriptionLimits(companyId);

    // Si maxInvoices est -1, c'est illimité
    if (limits.maxInvoices === -1) {
        return { canAdd: true };
    }

    if (limits.currentInvoices >= limits.maxInvoices) {
        return {
            canAdd: false,
            reason: `Limite de factures atteinte pour le plan ${limits.planName} (${limits.maxInvoices} maximum)`
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
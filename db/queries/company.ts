import { db } from "@/lib/drizzle";
import { user, company, subscription, billingPlan } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUserWithCompany(userId: string) {
    const result = await db
        .select({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                companyId: user.companyId,
                role: user.role,
            },
            company: {
                id: company.id,
                name: company.name,
                email: company.email,
                phone: company.phone,
                address: company.address,
                city: company.city,
                postalCode: company.postalCode,
                country: company.country,
                siret: company.siret,
                vatNumber: company.vatNumber,
                logo: company.logo,
            }
        })
        .from(user)
        .leftJoin(company, eq(user.companyId, company.id))
        .where(eq(user.id, userId))
        .limit(1);

    return result[0] || null;
}

export async function getCompanyWithMembers(companyId: string) {
    // Récupérer les informations de l'entreprise
    const companyData = await db
        .select({
            id: company.id,
            name: company.name,
            email: company.email,
            phone: company.phone,
            address: company.address,
            city: company.city,
            postalCode: company.postalCode,
            country: company.country,
            siret: company.siret,
            vatNumber: company.vatNumber,
            logo: company.logo,
            createdAt: company.createdAt,
            updatedAt: company.updatedAt,
        })
        .from(company)
        .where(eq(company.id, companyId))
        .limit(1);

    if (!companyData.length) {
        return null;
    }

    // Récupérer tous les membres de l'entreprise
    const members = await db
        .select({
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
            createdAt: user.createdAt,
        })
        .from(user)
        .where(eq(user.companyId, companyId))
        .orderBy(user.role, user.name); // Owner en premier, puis par nom

    // Récupérer les informations d'abonnement
    const subscriptionData = await db
        .select({
            subscription: {
                id: subscription.id,
                status: subscription.status,
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
            }
        })
        .from(subscription)
        .leftJoin(billingPlan, eq(subscription.billingPlanId, billingPlan.id))
        .where(eq(subscription.companyId, companyId))
        .limit(1);

    // Si pas d'abonnement, utiliser le plan gratuit par défaut
    let subscriptionInfo;
    if (subscriptionData.length === 0) {
        // Récupérer le plan gratuit par défaut
        const freePlan = await db
            .select()
            .from(billingPlan)
            .where(eq(billingPlan.id, 'free-plan'))
            .limit(1);

        subscriptionInfo = {
            plan: freePlan[0]?.name || "Gratuit",
            maxUsers: freePlan[0]?.maxUsers || 1,
            currentUsers: members.length,
            status: 'active' as const,
            features: freePlan[0]?.features ? JSON.parse(freePlan[0].features) : [],
        };
    } else {
        const { subscription: sub, plan } = subscriptionData[0];
        subscriptionInfo = {
            plan: plan?.name || "Gratuit",
            maxUsers: plan?.maxUsers || 1,
            currentUsers: members.length,
            status: sub?.status || 'active' as const,
            features: plan?.features ? JSON.parse(plan.features) : [],
        };
    }

    return {
        ...companyData[0],
        subscription: subscriptionInfo,
        members,
    };
}

export async function getTeamMembers(companyId: string) {
    // Récupérer tous les membres de l'entreprise
    const members = await db
        .select({
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
            createdAt: user.createdAt,
        })
        .from(user)
        .where(eq(user.companyId, companyId))
        .orderBy(user.createdAt);

    // Récupérer les informations d'abonnement
    const subscriptionData = await db
        .select({
            plan: billingPlan.name,
            maxUsers: billingPlan.maxUsers,
            status: subscription.status,
            features: billingPlan.features,
        })
        .from(subscription)
        .leftJoin(billingPlan, eq(subscription.billingPlanId, billingPlan.id))
        .where(eq(subscription.companyId, companyId))
        .limit(1);

    // Si pas d'abonnement, utiliser les limites du plan gratuit
    let subscriptionInfo: {
        plan: string;
        maxUsers: number;
        currentUsers: number;
        status: "active" | "cancelled" | "past_due" | "unpaid";
        features: string[];
    } = {
        plan: "Gratuit",
        maxUsers: 1,
        currentUsers: members.length,
        status: "active",
        features: [],
    };

    if (subscriptionData.length > 0) {
        subscriptionInfo = {
            plan: subscriptionData[0].plan || "Gratuit",
            maxUsers: subscriptionData[0].maxUsers || 1,
            currentUsers: members.length,
            status: subscriptionData[0].status || "active",
            features: Array.isArray(subscriptionData[0].features) ? subscriptionData[0].features : [],
        };
    } else {
        // Récupérer le plan gratuit par défaut
        const freePlan = await db
            .select({ maxUsers: billingPlan.maxUsers, features: billingPlan.features })
            .from(billingPlan)
            .where(eq(billingPlan.id, 'free-plan'))
            .limit(1);

        if (freePlan.length > 0) {
            subscriptionInfo.maxUsers = freePlan[0].maxUsers || 1;
            subscriptionInfo.features = Array.isArray(freePlan[0].features) ? freePlan[0].features : [];
        }
    }

    return {
        members,
        subscription: subscriptionInfo,
    };
} 
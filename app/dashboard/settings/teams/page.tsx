import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/drizzle";
import { user, company, subscription, billingPlan } from "@/db/schema";
import { eq } from "drizzle-orm";
import DatagridUser from "@/components/datagrid/datagrid-user";
import { headers } from "next/headers";

export default async function TeamsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        redirect("/login");
    }

    // Récupérer l'utilisateur avec son entreprise
    const currentUser = await db
        .select({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            companyId: user.companyId,
        })
        .from(user)
        .where(eq(user.id, session.user.id))
        .limit(1);

    if (!currentUser[0]?.companyId) {
        redirect("/dashboard");
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
        .where(eq(user.companyId, currentUser[0].companyId))
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
        .where(eq(subscription.companyId, currentUser[0].companyId))
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

    return (
        <div className="container mx-auto py-6">
            <DatagridUser
                members={members}
                userRole={currentUser[0].role as 'owner' | 'admin' | 'user'}
                currentUserId={currentUser[0].id}
                subscription={subscriptionInfo}
            />
        </div>
    );
} 
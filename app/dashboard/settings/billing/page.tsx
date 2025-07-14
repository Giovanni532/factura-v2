import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getUserWithCompanyCached, getBillingPlansCached, getCompanySubscriptionWithStripeCached } from "@/lib/cache";
import { BillingSettingsClient } from "@/components/billing/billing-settings-client";

export default async function BillingPage() {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        redirect("/login");
    }

    // Récupérer les informations de l'utilisateur et de l'entreprise avec cache
    const userData = await getUserWithCompanyCached(session.user.id);

    if (!userData?.company) {
        redirect("/dashboard");
    }

    const currentUser = userData;
    const currentCompany = userData.company;

    // Récupérer les données de facturation avec cache en parallèle
    const [plansData, subscriptionData] = await Promise.all([
        getBillingPlansCached(),
        getCompanySubscriptionWithStripeCached(currentCompany.id)
    ]);

    const plans = plansData;
    const currentSubscription = subscriptionData;

    return (
        <BillingSettingsClient
            plans={plans}
            currentSubscription={currentSubscription}
            userRole={currentUser.role}
        />
    );
} 
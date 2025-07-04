import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getBillingPlans, getCompanySubscriptionWithStripe } from "@/db/queries/billing";
import { getUserWithCompany } from "@/db/queries/company";
import { BillingSettingsClient } from "@/components/billing/billing-settings-client";

export default async function BillingPage() {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        redirect("/login");
    }

    // Récupérer les informations de l'utilisateur et de l'entreprise
    const userData = await getUserWithCompany(session.user.id);

    if (!userData?.user || !userData?.company) {
        redirect("/dashboard");
    }

    const { user: currentUser, company: currentCompany } = userData;

    // Récupérer tous les plans de facturation disponibles
    const plans = await getBillingPlans();

    // Récupérer l'abonnement actuel de l'entreprise
    const currentSubscription = await getCompanySubscriptionWithStripe(currentCompany.id);

    return (
        <BillingSettingsClient
            plans={plans}
            currentSubscription={currentSubscription}
            userRole={currentUser.role}
        />
    );
} 
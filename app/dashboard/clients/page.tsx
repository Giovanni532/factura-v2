'use server'

import { redirect } from "next/navigation";
import { getSession } from "@/lib/get-session";
import { getUserWithCompanyCached, getClientsWithStatsCached, getSubscriptionLimitsCached } from "@/lib/cache";
import { ClientsPageClient } from "@/components/clients/clients-page-client";
import { paths } from "@/paths";
import { PageHeader } from "@/components/ledger"

interface InvoicesPageProps {
    searchParams: Promise<{ [key: string]: string }>
}

export default async function ClientsPage({ searchParams }: InvoicesPageProps) {
    const searchParamsResult = await searchParams;
    const session = await getSession();

    if (!session?.user) {
        redirect(paths.login);
    }

    // Récupérer les données avec cache en parallèle
    const userWithCompany = await getUserWithCompanyCached(session.user.id);
    const companyId = userWithCompany?.company?.id;

    if (!companyId) {
        redirect(paths.dashboard);
    }

    const [clients, subscriptionLimits] = await Promise.all([
        getClientsWithStatsCached(companyId),
        getSubscriptionLimitsCached(companyId)
    ]);

    return (
        <div className="space-y-6">
            <PageHeader title="Clients" description="Votre carnet de clients et le chiffre d'affaires de chacun" />
            <ClientsPageClient
                initialClients={clients}
                newClient={searchParamsResult.new === "true" ? true : false}
                subscriptionLimits={subscriptionLimits}
                searchParams={searchParamsResult}
            />
        </div>
    );
} 
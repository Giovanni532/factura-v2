'use server'

import { redirect } from "next/navigation";
import { getSession } from "@/lib/get-session";
import { getUserWithCompanyCached, getClientsWithStatsCached, getSubscriptionLimitsCached } from "@/lib/cache";
import { ClientsPageClient } from "@/components/clients/clients-page-client";
import { paths } from "@/paths";

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
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Clients</h2>
            </div>
            <ClientsPageClient
                initialClients={clients}
                newClient={searchParamsResult.new === "true" ? true : false}
                subscriptionLimits={subscriptionLimits}
                searchParams={searchParamsResult}
            />
        </div>
    );
} 
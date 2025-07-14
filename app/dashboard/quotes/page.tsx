"use server"

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserWithCompanyCached, getQuotesByCompanyCached, getQuoteStatsCached, getSubscriptionLimitsCached, getFormDataCached } from "@/lib/cache";
import { QuotesPageClient } from "@/components/quotes/quotes-page-client";
import { headers } from "next/headers";
import { paths } from "@/paths";

interface QuotesPageProps {
    searchParams: Promise<{ [key: string]: string }>
}

export default async function QuotesPage({ searchParams }: QuotesPageProps) {
    const searchParamsResult = await searchParams;
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.id) {
        redirect(paths.login);
    }

    // Récupérer les données de l'utilisateur et de son entreprise avec cache
    const userWithCompany = await getUserWithCompanyCached(session.user.id);

    if (!userWithCompany?.company) {
        redirect(paths.dashboard);
    }

    const companyId = userWithCompany.company.id;

    // Récupérer les données avec cache en parallèle
    const [quotes, stats, subscriptionLimits, formData] = await Promise.all([
        getQuotesByCompanyCached(companyId, {
            search: searchParamsResult.search,
            status: searchParamsResult.status,
            clientId: searchParamsResult.client,
        }),
        getQuoteStatsCached(companyId, searchParamsResult.client),
        getSubscriptionLimitsCached(companyId),
        getFormDataCached('quotes', await headers())
    ]);

    return (
        <QuotesPageClient
            quotes={quotes}
            stats={stats}
            formData={formData}
            subscriptionLimits={subscriptionLimits}
            filters={{
                search: searchParamsResult.search || "",
                status: searchParamsResult.status || "all",
                clientId: searchParamsResult.client || "",
                new: searchParamsResult.new === "true" ? true : false || searchParamsResult.create === "true" ? true : false,
                id: searchParamsResult.id || "",
            }}
        />
    );
} 
"use server"

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserWithCompanyCached, getInvoicesByCompanyCached, getInvoiceStatsCached, getSubscriptionLimitsCached, getFormDataCached } from "@/lib/cache";
import { InvoicesPageClient } from "@/components/invoices/invoices-page-client";
import { headers } from "next/headers";
import { paths } from "@/paths";

interface InvoicesPageProps {
    searchParams: Promise<{ [key: string]: string }>
}

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
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
    const [invoices, stats, subscriptionLimits, formData] = await Promise.all([
        getInvoicesByCompanyCached(companyId, {
            search: searchParamsResult.search,
            status: searchParamsResult.status,
            clientId: searchParamsResult.client,
        }),
        getInvoiceStatsCached(companyId, searchParamsResult.client),
        getSubscriptionLimitsCached(companyId),
        getFormDataCached('invoices', await headers())
    ]);

    return (
        <InvoicesPageClient
            invoices={invoices}
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

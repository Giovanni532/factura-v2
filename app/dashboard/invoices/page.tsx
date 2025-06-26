"use server"

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/drizzle";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getInvoicesByCompany, getInvoiceStats } from "@/db/queries/invoice";
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

    // Récupérer les données de l'utilisateur et de son entreprise
    const userData = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);

    if (!userData.length || !userData[0].companyId) {
        redirect(paths.dashboard);
    }

    const companyId = userData[0].companyId;

    // Récupérer les factures avec filtres
    const invoices = await getInvoicesByCompany(companyId, {
        search: searchParamsResult.search,
        status: searchParamsResult.status,
        clientId: searchParamsResult.client,
    });

    // Récupérer les statistiques
    const stats = await getInvoiceStats(companyId, searchParamsResult.client);

    return (
        <InvoicesPageClient
            invoices={invoices}
            stats={stats}
            filters={{
                search: searchParamsResult.search || "",
                status: searchParamsResult.status || "all",
                clientId: searchParamsResult.client || "",
            }}
        />
    );
} 

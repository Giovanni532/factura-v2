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

    // Récupérer les données du formulaire
    let formData = null;
    try {
        const headersList = await headers();
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/invoices/form-data`, {
            headers: {
                'Cookie': headersList.get('cookie') || '',
            },
        });

        if (response.ok) {
            formData = await response.json();
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des données du formulaire:", error);
    }

    return (
        <InvoicesPageClient
            invoices={invoices}
            stats={stats}
            formData={formData}
            filters={{
                search: searchParamsResult.search || "",
                status: searchParamsResult.status || "all",
                clientId: searchParamsResult.client || "",
            }}
        />
    );
} 

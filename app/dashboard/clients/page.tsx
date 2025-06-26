'use server'

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getClientsWithStats } from "@/db/queries/client";
import { ClientsPageClient } from "@/components/clients/clients-page-client";
import { headers } from "next/headers";
import { getUserWithCompany } from "@/db/queries/company";
import { paths } from "@/paths";

export default async function ClientsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        redirect(paths.login);
    }

    // Récupérer les clients avec leurs statistiques
    const user = await getUserWithCompany(session.user.id);
    const clients = await getClientsWithStats(user.company?.id ?? "");

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Clients</h2>
            </div>
            <ClientsPageClient initialClients={clients} />
        </div>
    );
} 
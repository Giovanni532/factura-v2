'use server'
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getServicesWithStats, getServiceCategoriesWithStats } from "@/db/queries/service";
import { ServicesPageClient } from "@/components/services/services-page-client";
import { headers } from "next/headers";
import { getUserWithCompany } from "@/db/queries/company";
import { ServiceWithStats } from "@/validation/service-schema";
import { paths } from "@/paths";

export default async function ServicesPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        redirect(paths.login);
    }

    // Récupérer l'utilisateur avec son entreprise
    const user = await getUserWithCompany(session.user.id);
    const companyId = user.company?.id ?? "";

    // Récupérer les services et catégories avec leurs statistiques
    const [services, categories] = await Promise.all([
        getServicesWithStats(companyId),
        getServiceCategoriesWithStats(companyId)
    ]);

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Prestations</h2>
            </div>
            <ServicesPageClient
                initialServices={services as ServiceWithStats[]}
                initialCategories={categories}
            />
        </div>
    );
} 
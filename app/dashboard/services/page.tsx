'use server'

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserWithCompanyCached, getServicesByCompanyCached, getServiceCategoriesCached } from "@/lib/cache";
import { ServicesPageClient } from "@/components/services/services-page-client";
import { headers } from "next/headers";
import { ServiceWithStats } from "@/validation/service-schema";
import { paths } from "@/paths";


interface ServicesPageProps {
    searchParams: Promise<{ [key: string]: string }>
}


export default async function ServicesPage({ searchParams }: ServicesPageProps) {
    const searchParamsResult = await searchParams;
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        redirect(paths.login);
    }

    // Récupérer l'utilisateur avec son entreprise avec cache
    const userWithCompany = await getUserWithCompanyCached(session.user.id);
    const companyId = userWithCompany?.company?.id;

    if (!companyId) {
        redirect(paths.dashboard);
    }

    // Récupérer les paramètres de recherche
    const initialType = searchParamsResult.type || 'services';
    const initialSearch = searchParamsResult.search || '';

    // Récupérer les services et catégories avec cache
    const [services, categories] = await Promise.all([
        getServicesByCompanyCached(companyId),
        getServiceCategoriesCached(companyId)
    ]);

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Prestations</h2>
            </div>
            <ServicesPageClient
                initialServices={services as ServiceWithStats[]}
                initialCategories={categories}
                initialType={initialType}
                initialSearch={initialSearch}
            />
        </div>
    );
} 
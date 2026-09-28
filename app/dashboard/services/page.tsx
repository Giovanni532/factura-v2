'use server'

import { redirect } from "next/navigation";
import { getSession } from "@/lib/get-session";
import { getUserWithCompanyCached, getServicesByCompanyCached, getServiceCategoriesCached } from "@/lib/cache";
import { ServicesPageClient } from "@/components/services/services-page-client";
import { ServiceWithStats } from "@/validation/service-schema";
import { paths } from "@/paths";
import { PageHeader } from "@/components/ledger"


interface ServicesPageProps {
    searchParams: Promise<{ [key: string]: string }>
}


export default async function ServicesPage({ searchParams }: ServicesPageProps) {
    const searchParamsResult = await searchParams;
    const session = await getSession();

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
        <div className="space-y-6">
            <PageHeader title="Prestations" description="Votre catalogue de services, avec leurs tarifs et catégories" />
            <ServicesPageClient
                initialServices={services as ServiceWithStats[]}
                initialCategories={categories}
                initialType={initialType}
                initialSearch={initialSearch}
            />
        </div>
    );
} 
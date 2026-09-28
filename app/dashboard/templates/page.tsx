"use server"



import { getSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { getUserWithCompanyCached, getTemplatesByCompanyCached } from "@/lib/cache";
import { TemplatesPageClient } from "@/components/templates/templates-page-client";
import { paths } from "@/paths";
import { PageHeader } from "@/components/ledger"

export default async function TemplatesPage() {
    // Récupérer la session utilisateur
    const session = await getSession();

    if (!session?.user) {
        redirect(paths.login);
    }

    // Récupérer les informations de l'utilisateur avec cache
    const userWithCompany = await getUserWithCompanyCached(session.user.id);

    if (!userWithCompany?.company) {
        redirect(paths.dashboard);
    }

    const userId = session.user.id;
    const companyId = userWithCompany.company.id;

    // Récupérer les templates avec cache
    const { predefinedTemplates, companyTemplates } = await getTemplatesByCompanyCached(userId, companyId);

    // Séparer les templates par type
    const predefinedInvoices = predefinedTemplates.filter(t => t.type === 'invoice');
    const predefinedQuotes = predefinedTemplates.filter(t => t.type === 'quote');
    const companyInvoices = companyTemplates.filter(t => t.type === 'invoice');
    const companyQuotes = companyTemplates.filter(t => t.type === 'quote');

    // Récupérer les favoris
    const favoriteTemplates = [...predefinedTemplates, ...companyTemplates].filter(t => t.isFavorite);

    return (
        <div className="space-y-6">
            <PageHeader title="Templates" description="Modèles prédéfinis ou personnalisés pour vos factures et devis" />

            <TemplatesPageClient
                predefinedInvoices={predefinedInvoices}
                predefinedQuotes={predefinedQuotes}
                companyInvoices={companyInvoices}
                companyQuotes={companyQuotes}
                favoriteTemplates={favoriteTemplates}
                allTemplates={[...predefinedTemplates, ...companyTemplates]}
            />
        </div>
    );
}
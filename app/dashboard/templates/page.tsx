"use server"

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAllTemplatesWithFavorites } from "@/db/queries/template";
import { user } from "@/db/schema";
import { db } from "@/lib/drizzle";
import { eq } from "drizzle-orm";
import { TemplatesPageClient } from "@/components/templates/templates-page-client";
import { paths } from "@/paths";

export default async function TemplatesPage() {
    // Récupérer la session utilisateur
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        redirect(paths.login);
    }

    // Récupérer les informations de l'utilisateur avec companyId
    const currentUser = await db.select()
        .from(user)
        .where(eq(user.id, session.user.id))
        .limit(1);

    if (currentUser.length === 0 || !currentUser[0].companyId) {
        redirect(paths.dashboard);
    }

    const userId = session.user.id;
    const companyId = currentUser[0].companyId;

    // Récupérer tous les templates avec les informations de favoris
    const { predefinedTemplates, companyTemplates } = await getAllTemplatesWithFavorites(
        userId,
        companyId
    );

    // Séparer les templates par type
    const predefinedInvoices = predefinedTemplates.filter(t => t.type === 'invoice');
    const predefinedQuotes = predefinedTemplates.filter(t => t.type === 'quote');
    const companyInvoices = companyTemplates.filter(t => t.type === 'invoice');
    const companyQuotes = companyTemplates.filter(t => t.type === 'quote');

    // Récupérer les favoris
    const favoriteTemplates = [...predefinedTemplates, ...companyTemplates].filter(t => t.isFavorite);

    return (
        <div className="container mx-auto py-6 space-y-8">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
                <p className="text-muted-foreground">
                    Choisissez parmi nos templates prédéfinis ou créez vos propres templates personnalisés pour vos factures et devis.
                </p>
            </div>

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
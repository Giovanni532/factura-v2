"use server"

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAllTemplatesWithFavorites } from "@/db/queries/template";
import { user } from "@/db/schema";
import { db } from "@/lib/drizzle";
import { eq } from "drizzle-orm";
import { TemplatesPageClient } from "@/components/templates/templates-page-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateTemplateButton } from "@/components/templates/create-template-button";

export default async function TemplatesPage() {
    // Récupérer la session utilisateur
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        redirect("/login");
    }

    // Récupérer les informations de l'utilisateur avec companyId
    const currentUser = await db.select()
        .from(user)
        .where(eq(user.id, session.user.id))
        .limit(1);

    if (currentUser.length === 0 || !currentUser[0].companyId) {
        redirect("/dashboard");
    }

    const userId = session.user.id;
    const companyId = currentUser[0].companyId;

    // Récupérer tous les templates avec les informations de favoris
    const { predefinedTemplates, companyTemplates } = await getAllTemplatesWithFavorites(
        userId,
        companyId
    );

    return (
        <div className="container mx-auto py-6 space-y-8">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Templates de facture</h1>
                <p className="text-muted-foreground">
                    Choisissez parmi nos templates prédéfinis ou créez vos propres templates personnalisés.
                </p>
            </div>

            {/* Section Templates Factura */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight">Templates Factura</h2>
                        <p className="text-sm text-muted-foreground">
                            Templates professionnels créés par notre équipe
                        </p>
                    </div>
                </div>

                {predefinedTemplates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <TemplatesPageClient
                            templates={predefinedTemplates}
                            type="predefined"
                        />
                    </div>
                ) : (
                    <Card>
                        <CardContent className="flex items-center justify-center py-8">
                            <p className="text-muted-foreground">Aucun template prédéfini disponible</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Section Templates créés */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight">Templates créés</h2>
                        <p className="text-sm text-muted-foreground">
                            Vos templates personnalisés pour votre entreprise
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <CreateTemplateButton />
                    </div>
                </div>

                {companyTemplates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <TemplatesPageClient
                            templates={companyTemplates}
                            type="company"
                        />
                    </div>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Aucun template personnalisé</CardTitle>
                            <CardDescription>
                                Commencez par créer votre premier template personnalisé pour votre entreprise.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CreateTemplateButton />
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
"use client";

import { useState } from "react";
import { TemplateCard } from "./template-card";
import { TemplateWithFavorite } from "@/validation/template-schema";
import { TemplatesProvider } from "./templates-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CreateTemplateButton } from "./create-template-button";
import { IconReceipt, IconFileInvoice, IconHeart } from "@tabler/icons-react";

interface TemplatesPageClientProps {
    predefinedInvoices: TemplateWithFavorite[];
    predefinedQuotes: TemplateWithFavorite[];
    companyInvoices: TemplateWithFavorite[];
    companyQuotes: TemplateWithFavorite[];
    favoriteTemplates: TemplateWithFavorite[];
    allTemplates: TemplateWithFavorite[];
}

export function TemplatesPageClient({
    predefinedInvoices,
    predefinedQuotes,
    companyInvoices,
    companyQuotes,
    favoriteTemplates,
    allTemplates
}: TemplatesPageClientProps) {
    const [activeTab, setActiveTab] = useState("invoices");

    // Trouver le template par défaut actuel
    const currentDefault = allTemplates.find(t =>
        t.isPredefined ? !!t.isCompanyDefault : t.isDefault
    );

    const renderTemplateGrid = (templates: TemplateWithFavorite[], type: "predefined" | "company") => {
        if (templates.length === 0) {
            return (
                <Card>
                    <CardContent className="flex items-center justify-center py-8">
                        <p className="text-muted-foreground">
                            Aucun template {type === "predefined" ? "prédéfini" : "personnalisé"} disponible
                        </p>
                    </CardContent>
                </Card>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                    <TemplateCard
                        key={template.id}
                        template={template}
                        type={type}
                    />
                ))}
            </div>
        );
    };

    const renderFavoritesSection = () => {
        if (favoriteTemplates.length === 0) {
            return (
                <Card>
                    <CardContent className="flex items-center justify-center py-8">
                        <p className="text-muted-foreground">
                            Aucun template en favori. Cliquez sur le cœur pour ajouter des templates à vos favoris.
                        </p>
                    </CardContent>
                </Card>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteTemplates.map((template) => (
                    <TemplateCard
                        key={template.id}
                        template={template}
                        type={template.isPredefined ? "predefined" : "company"}
                    />
                ))}
            </div>
        );
    };

    return (
        <TemplatesProvider initialDefaultTemplateId={currentDefault?.id || null}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <div className="flex items-center justify-between">
                    <TabsList className="grid w-full max-w-md grid-cols-3">
                        <TabsTrigger value="invoices" className="flex items-center gap-2">
                            <IconReceipt className="h-4 w-4" />
                            Factures
                        </TabsTrigger>
                        <TabsTrigger value="quotes" className="flex items-center gap-2">
                            <IconFileInvoice className="h-4 w-4" />
                            Devis
                        </TabsTrigger>
                        <TabsTrigger value="favorites" className="flex items-center gap-2">
                            <IconHeart className="h-4 w-4" />
                            Favoris
                            {favoriteTemplates.length > 0 && (
                                <Badge variant="secondary" className="ml-1">
                                    {favoriteTemplates.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <CreateTemplateButton />
                </div>

                <TabsContent value="invoices" className="space-y-8">
                    {/* Section Templates Factura - Factures */}
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-2xl font-semibold tracking-tight">Templates Factura - Factures</h2>
                            <p className="text-sm text-muted-foreground">
                                Templates professionnels créés par notre équipe
                            </p>
                        </div>
                        {renderTemplateGrid(predefinedInvoices, "predefined")}
                    </div>

                    {/* Section Templates créés - Factures */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight">Templates créés - Factures</h2>
                                <p className="text-sm text-muted-foreground">
                                    Vos templates personnalisés pour vos factures
                                </p>
                            </div>
                        </div>
                        {renderTemplateGrid(companyInvoices, "company")}
                    </div>
                </TabsContent>

                <TabsContent value="quotes" className="space-y-8">
                    {/* Section Templates Factura - Devis */}
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-2xl font-semibold tracking-tight">Templates Factura - Devis</h2>
                            <p className="text-sm text-muted-foreground">
                                Templates professionnels créés par notre équipe
                            </p>
                        </div>
                        {renderTemplateGrid(predefinedQuotes, "predefined")}
                    </div>

                    {/* Section Templates créés - Devis */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight">Templates créés - Devis</h2>
                                <p className="text-sm text-muted-foreground">
                                    Vos templates personnalisés pour vos devis
                                </p>
                            </div>
                        </div>
                        {renderTemplateGrid(companyQuotes, "company")}
                    </div>
                </TabsContent>

                <TabsContent value="favorites" className="space-y-8">
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-2xl font-semibold tracking-tight">Mes Favoris</h2>
                            <p className="text-sm text-muted-foreground">
                                Vos templates préférés pour un accès rapide
                            </p>
                        </div>
                        {renderFavoritesSection()}
                    </div>
                </TabsContent>
            </Tabs>
        </TemplatesProvider>
    );
}
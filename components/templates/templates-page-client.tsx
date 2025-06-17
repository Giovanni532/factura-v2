"use client";

import { TemplateCard } from "./template-card";
import { TemplateWithFavorite } from "@/validation/template-schema";
import { TemplatesProvider } from "./templates-context";

interface TemplatesPageClientProps {
    templates: TemplateWithFavorite[];
    type: "predefined" | "company";
    allTemplates: TemplateWithFavorite[]; // Tous les templates pour identifier le défaut actuel
}

export function TemplatesPageClient({ templates, type, allTemplates }: TemplatesPageClientProps) {
    // Trouver le template par défaut actuel
    const currentDefault = allTemplates.find(t =>
        t.isPredefined ? !!t.isCompanyDefault : t.isDefault
    );

    return (
        <TemplatesProvider initialDefaultTemplateId={currentDefault?.id || null}>
            {templates.map((template) => (
                <TemplateCard
                    key={template.id}
                    template={template}
                    type={type}
                />
            ))}
        </TemplatesProvider>
    );
}
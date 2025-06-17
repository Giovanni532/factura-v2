"use client";

import { TemplateCard } from "./template-card";
import { TemplateWithFavorite } from "@/validation/template-schema";

interface TemplatesPageClientProps {
    templates: TemplateWithFavorite[];
    type: "predefined" | "company";
}

export function TemplatesPageClient({ templates, type }: TemplatesPageClientProps) {
    return (
        <>
            {templates.map((template) => (
                <TemplateCard
                    key={template.id}
                    template={template}
                    type={type}
                />
            ))}
        </>
    );
}
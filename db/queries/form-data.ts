import { db } from "@/lib/drizzle";
import { service, companyDefaultTemplate, template, userFavoriteTemplate } from "@/db/schema";
import { eq, and, or } from "drizzle-orm";
import { getClientsForInvoice } from "./invoice";
import { getNextInvoiceNumber } from "./invoice";
import { getClientsForQuote, getNextQuoteNumber } from "./quote";

/**
 * Récupère les données nécessaires au formulaire de création de facture
 * directement depuis la DB (sans passer par HTTP).
 */
export async function getInvoiceFormData(companyId: string, userId: string) {
    const [clients, nextInvoiceNumber, services, defaultTemplateResult, templates, favoriteTemplates] =
        await Promise.all([
            getClientsForInvoice(companyId),
            getNextInvoiceNumber(companyId),
            db.select({
                id: service.id,
                name: service.name,
                description: service.description,
                unitPrice: service.unitPrice,
                currency: service.currency,
                unit: service.unit,
                taxRate: service.taxRate,
            })
                .from(service)
                .where(eq(service.companyId, companyId))
                .orderBy(service.name),
            db.select({ templateId: companyDefaultTemplate.templateId })
                .from(companyDefaultTemplate)
                .where(eq(companyDefaultTemplate.companyId, companyId))
                .limit(1),
            db.select({
                id: template.id,
                name: template.name,
                type: template.type,
                isPredefined: template.isPredefined,
                companyId: template.companyId,
            })
                .from(template)
                .where(
                    and(
                        eq(template.type, "invoice"),
                        or(eq(template.companyId, companyId), eq(template.isPredefined, true))
                    )
                )
                .orderBy(template.name),
            db.select({ templateId: userFavoriteTemplate.templateId })
                .from(userFavoriteTemplate)
                .where(eq(userFavoriteTemplate.userId, userId)),
        ]);

    const favoriteIds = new Set(favoriteTemplates.map((f) => f.templateId));
    const organizedTemplates = templates
        .map((t) => ({ ...t, isFavorite: favoriteIds.has(t.id) }))
        .sort((a, b) => {
            if (a.isFavorite && !b.isFavorite) return -1;
            if (!a.isFavorite && b.isFavorite) return 1;
            return a.name.localeCompare(b.name);
        });

    return {
        clients,
        templates: organizedTemplates,
        nextInvoiceNumber,
        services,
        defaultTemplateId: defaultTemplateResult[0]?.templateId ?? null,
    };
}

/**
 * Récupère les données nécessaires au formulaire de création de devis
 * directement depuis la DB (sans passer par HTTP).
 */
export async function getQuoteFormData(companyId: string, userId: string) {
    const [clients, nextQuoteNumber, services, defaultTemplateResult, templates, favoriteTemplates] =
        await Promise.all([
            getClientsForQuote(companyId),
            getNextQuoteNumber(companyId),
            db.select({
                id: service.id,
                name: service.name,
                description: service.description,
                unitPrice: service.unitPrice,
                currency: service.currency,
                unit: service.unit,
                taxRate: service.taxRate,
            })
                .from(service)
                .where(eq(service.companyId, companyId))
                .orderBy(service.name),
            db.select({ templateId: companyDefaultTemplate.templateId })
                .from(companyDefaultTemplate)
                .where(eq(companyDefaultTemplate.companyId, companyId))
                .limit(1),
            db.select({
                id: template.id,
                name: template.name,
                type: template.type,
                isPredefined: template.isPredefined,
                companyId: template.companyId,
            })
                .from(template)
                .where(
                    and(
                        eq(template.type, "quote"),
                        or(eq(template.companyId, companyId), eq(template.isPredefined, true))
                    )
                )
                .orderBy(template.name),
            db.select({ templateId: userFavoriteTemplate.templateId })
                .from(userFavoriteTemplate)
                .where(eq(userFavoriteTemplate.userId, userId)),
        ]);

    const favoriteIds = new Set(favoriteTemplates.map((f) => f.templateId));
    const organizedTemplates = templates
        .map((t) => ({ ...t, isFavorite: favoriteIds.has(t.id) }))
        .sort((a, b) => {
            if (a.isFavorite && !b.isFavorite) return -1;
            if (!a.isFavorite && b.isFavorite) return 1;
            return a.name.localeCompare(b.name);
        });

    return {
        clients,
        templates: organizedTemplates,
        nextQuoteNumber,
        services,
        defaultTemplateId: defaultTemplateResult[0]?.templateId ?? null,
    };
}

import { db } from "@/lib/drizzle";
import { template, userFavoriteTemplate, companyDefaultTemplate, user } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

// Récupérer tous les templates prédéfinis (Factura templates)
export async function getPredefinedTemplates() {
    return await db.select({
        id: template.id,
        name: template.name,
        description: template.description,
        html: template.html,
        css: template.css,
        preview: template.preview,
        type: template.type,
        isDefault: template.isDefault,
        isPredefined: template.isPredefined,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
    })
        .from(template)
        .where(eq(template.isPredefined, true))
        .orderBy(template.createdAt);
}

// Récupérer les templates créés par une entreprise
export async function getCompanyTemplates(companyId: string) {
    return await db.select({
        id: template.id,
        name: template.name,
        description: template.description,
        html: template.html,
        css: template.css,
        preview: template.preview,
        type: template.type,
        isDefault: template.isDefault,
        isPredefined: template.isPredefined,
        companyId: template.companyId,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
    })
        .from(template)
        .where(and(
            eq(template.companyId, companyId),
            eq(template.isPredefined, false)
        ))
        .orderBy(template.createdAt);
}

// Récupérer les templates favoris d'un utilisateur
export async function getUserFavoriteTemplates(userId: string) {
    return await db.select({
        id: template.id,
        name: template.name,
        description: template.description,
        html: template.html,
        css: template.css,
        preview: template.preview,
        type: template.type,
        isDefault: template.isDefault,
        isPredefined: template.isPredefined,
        companyId: template.companyId,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
        isFavorite: userFavoriteTemplate.id,
    })
        .from(template)
        .innerJoin(userFavoriteTemplate, eq(template.id, userFavoriteTemplate.templateId))
        .where(eq(userFavoriteTemplate.userId, userId))
        .orderBy(userFavoriteTemplate.createdAt);
}

// Récupérer tous les templates avec indication de favoris pour un utilisateur
export async function getAllTemplatesWithFavorites(userId: string, companyId: string) {
    // Templates prédéfinis avec indication si c'est le défaut de l'entreprise
    const predefinedTemplates = await db.select({
        id: template.id,
        name: template.name,
        description: template.description,
        html: template.html,
        css: template.css,
        preview: template.preview,
        type: template.type,
        isDefault: template.isDefault,
        isPredefined: template.isPredefined,
        companyId: template.companyId,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
        isFavorite: userFavoriteTemplate.id,
        isCompanyDefault: companyDefaultTemplate.id,
    })
        .from(template)
        .leftJoin(userFavoriteTemplate, and(
            eq(template.id, userFavoriteTemplate.templateId),
            eq(userFavoriteTemplate.userId, userId)
        ))
        .leftJoin(companyDefaultTemplate, and(
            eq(template.id, companyDefaultTemplate.templateId),
            eq(companyDefaultTemplate.companyId, companyId)
        ))
        .where(eq(template.isPredefined, true))
        .orderBy(template.createdAt);

    // Templates de l'entreprise
    const companyTemplates = await db.select({
        id: template.id,
        name: template.name,
        description: template.description,
        html: template.html,
        css: template.css,
        preview: template.preview,
        type: template.type,
        isDefault: template.isDefault,
        isPredefined: template.isPredefined,
        companyId: template.companyId,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
        isFavorite: userFavoriteTemplate.id,
        isCompanyDefault: companyDefaultTemplate.id,
    })
        .from(template)
        .leftJoin(userFavoriteTemplate, and(
            eq(template.id, userFavoriteTemplate.templateId),
            eq(userFavoriteTemplate.userId, userId)
        ))
        .leftJoin(companyDefaultTemplate, and(
            eq(template.id, companyDefaultTemplate.templateId),
            eq(companyDefaultTemplate.companyId, companyId)
        ))
        .where(and(
            eq(template.companyId, companyId),
            eq(template.isPredefined, false)
        ))
        .orderBy(template.createdAt);

    return {
        predefinedTemplates,
        companyTemplates,
    };
}

// Vérifier si un template est en favori pour un utilisateur
export async function isTemplateFavorite(userId: string, templateId: string) {
    const favorite = await db.select()
        .from(userFavoriteTemplate)
        .where(and(
            eq(userFavoriteTemplate.userId, userId),
            eq(userFavoriteTemplate.templateId, templateId)
        ))
        .limit(1);

    return favorite.length > 0;
}

// Récupérer un template par ID
export async function getTemplateById(templateId: string) {
    const templates = await db.select()
        .from(template)
        .where(eq(template.id, templateId))
        .limit(1);

    return templates[0] || null;
}

// Récupérer un template par ID avec vérification des permissions pour un utilisateur
export async function getTemplateByIdForUser(templateId: string, userId: string, companyId: string) {
    const templates = await db.select({
        id: template.id,
        name: template.name,
        description: template.description,
        html: template.html,
        css: template.css,
        preview: template.preview,
        type: template.type,
        isDefault: template.isDefault,
        isPredefined: template.isPredefined,
        companyId: template.companyId,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
        isFavorite: userFavoriteTemplate.id,
    })
        .from(template)
        .leftJoin(userFavoriteTemplate, and(
            eq(template.id, userFavoriteTemplate.templateId),
            eq(userFavoriteTemplate.userId, userId)
        ))
        .where(and(
            eq(template.id, templateId),
            // L'utilisateur peut accéder aux templates prédéfinis ou aux templates de son entreprise
            template.isPredefined ? eq(template.isPredefined, true) : eq(template.companyId, companyId)
        ))
        .limit(1);

    return templates[0] || null;
}
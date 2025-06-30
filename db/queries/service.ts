import { db } from "@/lib/drizzle";
import { service, serviceCategory, invoiceItem, quoteItem } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

// Récupérer tous les services d'une entreprise avec leurs statistiques
export async function getServicesWithStats(companyId: string) {
    const services = await db.select({
        id: service.id,
        name: service.name,
        description: service.description,
        unitPrice: service.unitPrice,
        currency: service.currency,
        unit: service.unit,
        taxRate: service.taxRate,
        isActive: service.isActive,
        category: service.category,
        companyId: service.companyId,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
    })
        .from(service)
        .where(eq(service.companyId, companyId))
        .orderBy(desc(service.createdAt));

    // Pour chaque service, calculer les statistiques
    const servicesWithStats = await Promise.all(
        services.map(async (serviceData) => {
            // Compter l'utilisation dans les factures
            const invoiceUsage = await db.select({
                totalUsage: sql<number>`sum(${invoiceItem.quantity})`,
                totalRevenue: sql<number>`sum(${invoiceItem.total})`,
                lastUsed: sql<Date>`max(${invoiceItem.createdAt})`,
            })
                .from(invoiceItem)
                .where(eq(invoiceItem.description, serviceData.name));

            // Compter l'utilisation dans les devis
            const quoteUsage = await db.select({
                totalUsage: sql<number>`sum(${quoteItem.quantity})`,
                totalRevenue: sql<number>`sum(${quoteItem.total})`,
                lastUsed: sql<Date>`max(${quoteItem.createdAt})`,
            })
                .from(quoteItem)
                .where(eq(quoteItem.description, serviceData.name));

            const totalUsage = (invoiceUsage[0]?.totalUsage || 0) + (quoteUsage[0]?.totalUsage || 0);
            const totalRevenue = (invoiceUsage[0]?.totalRevenue || 0) + (quoteUsage[0]?.totalRevenue || 0);

            // Dernière utilisation
            const lastInvoiceUsed = invoiceUsage[0]?.lastUsed;
            const lastQuoteUsed = quoteUsage[0]?.lastUsed;
            const lastUsed = lastInvoiceUsed && lastQuoteUsed
                ? new Date(Math.max(new Date(lastInvoiceUsed).getTime(), new Date(lastQuoteUsed).getTime()))
                : lastInvoiceUsed || lastQuoteUsed || null;

            return {
                ...serviceData,
                totalUsage,
                totalRevenue,
                lastUsed,
            };
        })
    );

    return servicesWithStats;
}

// Récupérer un service par ID avec ses statistiques
export async function getServiceById(serviceId: string, companyId: string) {
    const serviceData = await db.select()
        .from(service)
        .where(and(
            eq(service.id, serviceId),
            eq(service.companyId, companyId)
        ))
        .limit(1);

    if (serviceData.length === 0) {
        return null;
    }

    const serviceInfo = serviceData[0];

    // Calculer les statistiques
    const invoiceUsage = await db.select({
        totalUsage: sql<number>`sum(${invoiceItem.quantity})`,
        totalRevenue: sql<number>`sum(${invoiceItem.total})`,
        lastUsed: sql<Date>`max(${invoiceItem.createdAt})`,
    })
        .from(invoiceItem)
        .where(eq(invoiceItem.description, serviceInfo.name));

    const quoteUsage = await db.select({
        totalUsage: sql<number>`sum(${quoteItem.quantity})`,
        totalRevenue: sql<number>`sum(${quoteItem.total})`,
        lastUsed: sql<Date>`max(${quoteItem.createdAt})`,
    })
        .from(quoteItem)
        .where(eq(quoteItem.description, serviceInfo.name));

    const totalUsage = (invoiceUsage[0]?.totalUsage || 0) + (quoteUsage[0]?.totalUsage || 0);
    const totalRevenue = (invoiceUsage[0]?.totalRevenue || 0) + (quoteUsage[0]?.totalRevenue || 0);

    const lastInvoiceUsed = invoiceUsage[0]?.lastUsed;
    const lastQuoteUsed = quoteUsage[0]?.lastUsed;
    const lastUsed = lastInvoiceUsed && lastQuoteUsed
        ? new Date(Math.max(new Date(lastInvoiceUsed).getTime(), new Date(lastQuoteUsed).getTime()))
        : lastInvoiceUsed || lastQuoteUsed || null;

    return {
        ...serviceInfo,
        totalUsage,
        totalRevenue,
        lastUsed,
    };
}

// Récupérer toutes les catégories d'une entreprise avec le nombre de services
export async function getServiceCategoriesWithStats(companyId: string) {
    const categories = await db.select({
        id: serviceCategory.id,
        name: serviceCategory.name,
        description: serviceCategory.description,
        color: serviceCategory.color,
        companyId: serviceCategory.companyId,
        createdAt: serviceCategory.createdAt,
        updatedAt: serviceCategory.updatedAt,
    })
        .from(serviceCategory)
        .where(eq(serviceCategory.companyId, companyId))
        .orderBy(desc(serviceCategory.createdAt));

    // Pour chaque catégorie, compter le nombre de services
    const categoriesWithStats = await Promise.all(
        categories.map(async (category) => {
            const serviceCount = await db.select({
                count: sql<number>`count(*)`,
            })
                .from(service)
                .where(and(
                    eq(service.companyId, companyId),
                    eq(service.category, category.name)
                ));

            return {
                ...category,
                serviceCount: serviceCount[0]?.count || 0,
            };
        })
    );

    return categoriesWithStats;
}

// Récupérer une catégorie par ID
export async function getServiceCategoryById(categoryId: string, companyId: string) {
    const category = await db.select()
        .from(serviceCategory)
        .where(and(
            eq(serviceCategory.id, categoryId),
            eq(serviceCategory.companyId, companyId)
        ))
        .limit(1);

    if (category.length === 0) {
        return null;
    }

    const categoryInfo = category[0];

    // Compter le nombre de services dans cette catégorie
    const serviceCount = await db.select({
        count: sql<number>`count(*)`,
    })
        .from(service)
        .where(and(
            eq(service.companyId, companyId),
            eq(service.category, categoryInfo.name)
        ));

    return {
        ...categoryInfo,
        serviceCount: serviceCount[0]?.count || 0,
    };
}

// Vérifier si un nom de service existe déjà pour une entreprise
export async function checkServiceNameExists(name: string, companyId: string, excludeServiceId?: string) {
    const query = excludeServiceId
        ? and(
            eq(service.name, name),
            eq(service.companyId, companyId),
            sql`${service.id} != ${excludeServiceId}`
        )
        : and(
            eq(service.name, name),
            eq(service.companyId, companyId)
        );

    const existingService = await db.select()
        .from(service)
        .where(query)
        .limit(1);

    return existingService.length > 0;
}

// Vérifier si un nom de catégorie existe déjà pour une entreprise
export async function checkCategoryNameExists(name: string, companyId: string, excludeCategoryId?: string) {
    const query = excludeCategoryId
        ? and(
            eq(serviceCategory.name, name),
            eq(serviceCategory.companyId, companyId),
            sql`${serviceCategory.id} != ${excludeCategoryId}`
        )
        : and(
            eq(serviceCategory.name, name),
            eq(serviceCategory.companyId, companyId)
        );

    const existingCategory = await db.select()
        .from(serviceCategory)
        .where(query)
        .limit(1);

    return existingCategory.length > 0;
} 
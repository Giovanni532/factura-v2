import { db } from "@/lib/drizzle";
import { quote, quoteItem, client, template } from "@/db/schema";
import { eq, desc, and, like, sql } from "drizzle-orm";
import { QuoteWithDetails, QuoteStats } from "@/validation/quote-schema";

// Récupérer tous les devis d'une entreprise avec détails
export async function getQuotesByCompany(companyId: string, filters?: {
    search?: string;
    status?: string;
    clientId?: string;
}) {
    let whereConditions = [eq(quote.companyId, companyId)];

    if (filters?.search) {
        whereConditions.push(
            like(quote.number, `%${filters.search}%`)
        );
    }

    if (filters?.status && filters.status !== 'all') {
        whereConditions.push(eq(quote.status, filters.status as any));
    }

    if (filters?.clientId) {
        whereConditions.push(eq(quote.clientId, filters.clientId));
    }

    const quotes = await db
        .select({
            id: quote.id,
            quoteNumber: quote.number,
            issueDate: quote.issueDate,
            validUntil: quote.validUntil,
            status: quote.status,
            subtotal: quote.subtotal,
            vatAmount: quote.taxAmount,
            total: quote.total,
            notes: quote.notes,
            terms: sql<string>`''`,
            companyId: quote.companyId,
            clientId: quote.clientId,
            templateId: quote.templateId,
            createdAt: quote.createdAt,
            updatedAt: quote.updatedAt,
            client: {
                id: client.id,
                name: client.name,
                email: client.email,
                address: client.address,
                city: client.city,
                postalCode: client.postalCode,
                country: client.country,
                siret: client.siret,
                vatNumber: client.vatNumber,
            },
            template: {
                id: template.id,
                name: template.name,
                type: template.type,
            },
        })
        .from(quote)
        .leftJoin(client, eq(quote.clientId, client.id))
        .leftJoin(template, eq(quote.templateId, template.id))
        .where(and(...whereConditions))
        .orderBy(desc(quote.createdAt));

    // Récupérer les articles pour chaque devis
    const quotesWithItems: QuoteWithDetails[] = await Promise.all(
        quotes.map(async (q) => {
            const items = await db
                .select({
                    id: quoteItem.id,
                    description: quoteItem.description,
                    quantity: quoteItem.quantity,
                    unitPrice: quoteItem.unitPrice,
                    unit: sql<string>`'unité'`,
                    vatRate: sql<number>`20`,
                    total: quoteItem.total,
                })
                .from(quoteItem)
                .where(eq(quoteItem.quoteId, q.id));

            return {
                ...q,
                status: (["draft", "sent", "accepted", "rejected", "expired"].includes(q.status)
                    ? q.status
                    : "draft") as "draft" | "sent" | "accepted" | "rejected" | "expired",
                items,
                client: q.client || { id: '', name: '', email: '', address: null, city: null, postalCode: null, country: null, siret: null, vatNumber: null },
                template: q.template ? { ...q.template, type: "quote" as const } : { id: '', name: '', type: 'quote' as const },
            };
        })
    );

    return quotesWithItems;
}

// Récupérer un devis par ID avec détails
export async function getQuoteById(quoteId: string, companyId: string): Promise<QuoteWithDetails | null> {
    const quoteData = await db
        .select({
            id: quote.id,
            quoteNumber: quote.number,
            issueDate: quote.issueDate,
            status: quote.status,
            subtotal: quote.subtotal,
            vatAmount: quote.taxAmount,
            validUntil: quote.validUntil,
            total: quote.total,
            notes: quote.notes,
            terms: sql<string>`''`,
            companyId: quote.companyId,
            clientId: quote.clientId,
            templateId: quote.templateId,
            createdAt: quote.createdAt,
            updatedAt: quote.updatedAt,
            client: {
                id: client.id,
                name: client.name,
                email: client.email,
                address: client.address,
                city: client.city,
                postalCode: client.postalCode,
                country: client.country,
                siret: client.siret,
                vatNumber: client.vatNumber,
            },
            template: {
                id: template.id,
                name: template.name,
                type: template.type,
            },
        })
        .from(quote)
        .leftJoin(client, eq(quote.clientId, client.id))
        .leftJoin(template, eq(quote.templateId, template.id))
        .where(and(eq(quote.id, quoteId), eq(quote.companyId, companyId)))
        .limit(1);

    if (!quoteData.length) return null;

    const items = await db
        .select({
            id: quoteItem.id,
            description: quoteItem.description,
            quantity: quoteItem.quantity,
            unitPrice: quoteItem.unitPrice,
            unit: sql<string>`'unité'`,
            vatRate: sql<number>`20`,
            total: quoteItem.total,
        })
        .from(quoteItem)
        .where(eq(quoteItem.quoteId, quoteId));

    return {
        ...quoteData[0],
        status: (["draft", "sent", "accepted", "rejected", "expired"].includes(quoteData[0].status)
            ? quoteData[0].status
            : "draft") as "draft" | "sent" | "accepted" | "rejected" | "expired",
        items,
        client: quoteData[0].client || {
            id: '',
            name: '',
            email: '',
            address: null,
            city: null,
            postalCode: null,
            country: null,
            siret: null,
            vatNumber: null
        },
        template: quoteData[0].template
            ? { ...quoteData[0].template, type: "quote" as const }
            : { id: '', name: '', type: 'quote' as const },
    };
}

// Récupérer les statistiques des devis
export async function getQuoteStats(companyId: string, clientId?: string): Promise<QuoteStats> {
    let whereConditions = [eq(quote.companyId, companyId)];

    if (clientId) {
        whereConditions.push(eq(quote.clientId, clientId));
    }

    const stats = await db
        .select({
            totalQuotes: sql<number>`count(*)`,
            totalAccepted: sql<number>`count(case when ${quote.status} = 'accepted' then 1 end)`,
            totalRejected: sql<number>`count(case when ${quote.status} = 'rejected' then 1 end)`,
            totalPending: sql<number>`count(case when ${quote.status} = 'pending' then 1 end)`,
            totalRevenue: sql<number>`sum(case when ${quote.status} = 'accepted' then ${quote.total} else 0 end)`,
            averageQuoteValue: sql<number>`avg(${quote.total})`,
        })
        .from(quote)
        .where(and(...whereConditions));

    return {
        totalQuotes: Number(stats[0].totalQuotes) || 0,
        totalAccepted: Number(stats[0].totalAccepted) || 0,
        totalRejected: Number(stats[0].totalRejected) || 0,
        totalPending: Number(stats[0].totalPending) || 0,
        totalRevenue: Number(stats[0].totalRevenue) || 0,
        averageQuoteValue: Number(stats[0].averageQuoteValue) || 0,
    };
}

// Générer le prochain numéro de devis
export async function getNextQuoteNumber(companyId: string): Promise<string> {
    const lastQuote = await db
        .select({ number: quote.number })
        .from(quote)
        .where(eq(quote.companyId, companyId))
        .orderBy(desc(quote.number))
        .limit(1);

    if (!lastQuote.length) {
        return "DEV-001";
    }

    const lastNumber = lastQuote[0].number;
    const match = lastNumber.match(/DEV-(\d+)/);

    if (!match) {
        return "DEV-001";
    }

    const nextNumber = parseInt(match[1]) + 1;
    return `DEV-${nextNumber.toString().padStart(3, '0')}`;
}

// Récupérer les clients pour le formulaire de devis
export async function getClientsForQuote(companyId: string) {
    return await db
        .select({
            id: client.id,
            name: client.name,
            email: client.email,
        })
        .from(client)
        .where(eq(client.companyId, companyId))
        .orderBy(client.name);
}

// Récupérer les templates pour le formulaire de devis
export async function getQuoteTemplates(companyId: string) {
    return await db
        .select({
            id: template.id,
            name: template.name,
            type: template.type,
        })
        .from(template)
        .where(and(eq(template.companyId, companyId), eq(template.type, 'quote')))
        .orderBy(template.name);
} 
import { db } from "@/lib/drizzle";
import { client, invoice, quote, company } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

// Récupérer tous les clients d'une entreprise avec leurs statistiques
export async function getClientsWithStats(companyId: string) {
    const clients = await db.select({
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        city: client.city,
        postalCode: client.postalCode,
        country: client.country,
        siret: client.siret,
        vatNumber: client.vatNumber,
        companyId: client.companyId,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
    })
        .from(client)
        .where(eq(client.companyId, companyId))
        .orderBy(desc(client.createdAt));

    // Pour chaque client, récupérer les statistiques
    const clientsWithStats = await Promise.all(
        clients.map(async (clientData) => {
            // Statistiques des factures
            const invoiceStats = await db.select({
                totalInvoices: sql<number>`count(*)`,
                totalRevenue: sql<number>`sum(${invoice.total})`,
                lastInvoiceDate: sql<Date>`max(${invoice.createdAt})`,
            })
                .from(invoice)
                .where(eq(invoice.clientId, clientData.id));

            // Statistiques des devis
            const quoteStats = await db.select({
                totalQuotes: sql<number>`count(*)`,
                lastQuoteDate: sql<Date>`max(${quote.createdAt})`,
            })
                .from(quote)
                .where(eq(quote.clientId, clientData.id));

            return {
                ...clientData,
                totalInvoices: invoiceStats[0]?.totalInvoices || 0,
                totalQuotes: quoteStats[0]?.totalQuotes || 0,
                totalRevenue: invoiceStats[0]?.totalRevenue || 0,
                lastInvoiceDate: invoiceStats[0]?.lastInvoiceDate || null,
                lastQuoteDate: quoteStats[0]?.lastQuoteDate || null,
            };
        })
    );

    return clientsWithStats;
}

// Récupérer un client par ID avec ses statistiques
export async function getClientById(clientId: string, companyId: string) {
    const clientData = await db.select()
        .from(client)
        .where(and(
            eq(client.id, clientId),
            eq(client.companyId, companyId)
        ))
        .limit(1);

    if (clientData.length === 0) {
        return null;
    }

    const clientInfo = clientData[0];

    // Statistiques des factures
    const invoiceStats = await db.select({
        totalInvoices: sql<number>`count(*)`,
        totalRevenue: sql<number>`sum(${invoice.total})`,
        lastInvoiceDate: sql<Date>`max(${invoice.createdAt})`,
    })
        .from(invoice)
        .where(eq(invoice.clientId, clientId));

    // Statistiques des devis
    const quoteStats = await db.select({
        totalQuotes: sql<number>`count(*)`,
        lastQuoteDate: sql<Date>`max(${quote.createdAt})`,
    })
        .from(quote)
        .where(eq(quote.clientId, clientId));

    return {
        ...clientInfo,
        totalInvoices: invoiceStats[0]?.totalInvoices || 0,
        totalQuotes: quoteStats[0]?.totalQuotes || 0,
        totalRevenue: invoiceStats[0]?.totalRevenue || 0,
        lastInvoiceDate: invoiceStats[0]?.lastInvoiceDate || null,
        lastQuoteDate: quoteStats[0]?.lastQuoteDate || null,
    };
}

// Vérifier si un email existe déjà pour une entreprise
export async function checkClientEmailExists(email: string, companyId: string, excludeClientId?: string) {
    const query = excludeClientId
        ? and(
            eq(client.email, email),
            eq(client.companyId, companyId),
            sql`${client.id} != ${excludeClientId}`
        )
        : and(
            eq(client.email, email),
            eq(client.companyId, companyId)
        );

    const existingClient = await db.select()
        .from(client)
        .where(query)
        .limit(1);

    return existingClient.length > 0;
} 
import { db } from "@/lib/drizzle";
import { invoice, invoiceItem, client, template } from "@/db/schema";
import { eq, desc, and, like, sql } from "drizzle-orm";
import { InvoiceWithDetails, InvoiceStats } from "@/validation/invoice-schema";

// Récupérer toutes les factures d'une entreprise avec détails
export async function getInvoicesByCompany(companyId: string, filters?: {
    search?: string;
    status?: string;
    clientId?: string;
}) {
    let whereConditions = [eq(invoice.companyId, companyId)];

    if (filters?.search) {
        whereConditions.push(
            like(invoice.number, `%${filters.search}%`)
        );
    }

    if (filters?.status && filters.status !== 'all') {
        whereConditions.push(eq(invoice.status, filters.status as any));
    }

    if (filters?.clientId) {
        whereConditions.push(eq(invoice.clientId, filters.clientId));
    }

    const invoices = await db
        .select({
            id: invoice.id,
            invoiceNumber: invoice.number,
            issueDate: invoice.issueDate,
            dueDate: invoice.dueDate,
            status: invoice.status,
            subtotal: invoice.subtotal,
            vatAmount: invoice.taxAmount,
            total: invoice.total,
            notes: invoice.notes,
            terms: sql<string>`''`,
            companyId: invoice.companyId,
            clientId: invoice.clientId,
            templateId: invoice.templateId,
            createdAt: invoice.createdAt,
            updatedAt: invoice.updatedAt,
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
        .from(invoice)
        .leftJoin(client, eq(invoice.clientId, client.id))
        .leftJoin(template, eq(invoice.templateId, template.id))
        .where(and(...whereConditions))
        .orderBy(desc(invoice.createdAt));

    // Récupérer les articles pour chaque facture
    const invoicesWithItems: InvoiceWithDetails[] = await Promise.all(
        invoices.map(async (inv) => {
            const items = await db
                .select({
                    id: invoiceItem.id,
                    description: invoiceItem.description,
                    quantity: invoiceItem.quantity,
                    unitPrice: invoiceItem.unitPrice,
                    unit: sql<string>`'unité'`,
                    vatRate: sql<number>`20`,
                    total: invoiceItem.total,
                })
                .from(invoiceItem)
                .where(eq(invoiceItem.invoiceId, inv.id));

            return {
                ...inv,
                items,
                client: inv.client || { id: '', name: '', email: '', address: null, city: null, postalCode: null, country: null, siret: null, vatNumber: null },
                template: inv.template || { id: '', name: '', type: 'invoice' as const },
            };
        })
    );

    return invoicesWithItems;
}

// Récupérer une facture par ID avec détails
export async function getInvoiceById(invoiceId: string, companyId: string): Promise<InvoiceWithDetails | null> {
    const invoiceData = await db
        .select({
            id: invoice.id,
            invoiceNumber: invoice.number,
            issueDate: invoice.issueDate,
            dueDate: invoice.dueDate,
            status: invoice.status,
            subtotal: invoice.subtotal,
            vatAmount: invoice.taxAmount,
            total: invoice.total,
            notes: invoice.notes,
            terms: sql<string>`''`,
            companyId: invoice.companyId,
            clientId: invoice.clientId,
            templateId: invoice.templateId,
            createdAt: invoice.createdAt,
            updatedAt: invoice.updatedAt,
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
        .from(invoice)
        .leftJoin(client, eq(invoice.clientId, client.id))
        .leftJoin(template, eq(invoice.templateId, template.id))
        .where(and(eq(invoice.id, invoiceId), eq(invoice.companyId, companyId)))
        .limit(1);

    if (!invoiceData.length) return null;

    const items = await db
        .select({
            id: invoiceItem.id,
            description: invoiceItem.description,
            quantity: invoiceItem.quantity,
            unitPrice: invoiceItem.unitPrice,
            unit: sql<string>`'unité'`,
            vatRate: sql<number>`20`,
            total: invoiceItem.total,
        })
        .from(invoiceItem)
        .where(eq(invoiceItem.invoiceId, invoiceId));

    return {
        ...invoiceData[0],
        items,
        client: invoiceData[0].client || {
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
        template: invoiceData[0].template || { id: '', name: '', type: 'invoice' as const },
    };
}

// Récupérer les statistiques des factures
export async function getInvoiceStats(companyId: string, clientId?: string): Promise<InvoiceStats> {
    let whereConditions = [eq(invoice.companyId, companyId)];

    if (clientId) {
        whereConditions.push(eq(invoice.clientId, clientId));
    }

    const stats = await db
        .select({
            totalInvoices: sql<number>`count(*)`,
            totalPaid: sql<number>`count(case when ${invoice.status} = 'paid' then 1 end)`,
            totalOverdue: sql<number>`count(case when ${invoice.status} = 'overdue' then 1 end)`,
            totalDraft: sql<number>`count(case when ${invoice.status} = 'draft' then 1 end)`,
            totalRevenue: sql<number>`sum(case when ${invoice.status} = 'paid' then ${invoice.total} else 0 end)`,
            averageInvoiceValue: sql<number>`avg(${invoice.total})`,
        })
        .from(invoice)
        .where(and(...whereConditions));

    return {
        totalInvoices: Number(stats[0].totalInvoices) || 0,
        totalPaid: Number(stats[0].totalPaid) || 0,
        totalOverdue: Number(stats[0].totalOverdue) || 0,
        totalDraft: Number(stats[0].totalDraft) || 0,
        totalRevenue: Number(stats[0].totalRevenue) || 0,
        averageInvoiceValue: Number(stats[0].averageInvoiceValue) || 0,
    };
}

// Générer le prochain numéro de facture
export async function getNextInvoiceNumber(companyId: string): Promise<string> {
    const lastInvoice = await db
        .select({ invoiceNumber: invoice.number })
        .from(invoice)
        .where(eq(invoice.companyId, companyId))
        .orderBy(desc(invoice.number))
        .limit(1);

    if (!lastInvoice.length) {
        return "FACT-001";
    }

    const lastNumber = lastInvoice[0].invoiceNumber;
    const match = lastNumber.match(/FACT-(\d+)/);

    if (match) {
        const nextNumber = parseInt(match[1]) + 1;
        return `FACT-${nextNumber.toString().padStart(3, '0')}`;
    }

    return "FACT-001";
}

// Récupérer les clients pour le formulaire de facture
export async function getClientsForInvoice(companyId: string) {
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

// Récupérer les templates de facture
export async function getInvoiceTemplates(companyId: string) {
    return await db
        .select({
            id: template.id,
            name: template.name,
            type: template.type,
        })
        .from(template)
        .where(and(
            eq(template.companyId, companyId),
            eq(template.type, 'invoice')
        ))
        .orderBy(template.name);
} 
import { db } from "@/lib/drizzle"
import {
    payment,
    supplier,
    expenseCategory,
    invoice,
    client,
    company
} from "@/db/schema"
import { eq, and, desc, like, or } from "drizzle-orm"

// Requêtes pour les fournisseurs
export async function getSuppliers(companyId: string) {
    return await db
        .select({
            id: supplier.id,
            name: supplier.name,
            email: supplier.email,
            phone: supplier.phone,
            address: supplier.address,
            city: supplier.city,
            postalCode: supplier.postalCode,
            country: supplier.country,
            siret: supplier.siret,
            vatNumber: supplier.vatNumber,
            notes: supplier.notes,
            isActive: supplier.isActive,
            createdAt: supplier.createdAt,
            updatedAt: supplier.updatedAt,
        })
        .from(supplier)
        .where(eq(supplier.companyId, companyId))
        .orderBy(supplier.name)
}

export async function getSupplierById(supplierId: string, companyId: string) {
    const result = await db
        .select()
        .from(supplier)
        .where(and(eq(supplier.id, supplierId), eq(supplier.companyId, companyId)))
        .limit(1)

    return result[0] || null
}

// Requêtes pour les catégories de dépenses
export async function getExpenseCategories(companyId: string) {
    return await db
        .select({
            id: expenseCategory.id,
            name: expenseCategory.name,
            description: expenseCategory.description,
            color: expenseCategory.color,
            isActive: expenseCategory.isActive,
            createdAt: expenseCategory.createdAt,
            updatedAt: expenseCategory.updatedAt,
        })
        .from(expenseCategory)
        .where(eq(expenseCategory.companyId, companyId))
        .orderBy(expenseCategory.name)
}

export async function getExpenseCategoryById(categoryId: string, companyId: string) {
    const result = await db
        .select()
        .from(expenseCategory)
        .where(and(eq(expenseCategory.id, categoryId), eq(expenseCategory.companyId, companyId)))
        .limit(1)

    return result[0] || null
}

// Requêtes pour les paiements étendus (encaissements et décaissements)
export interface ExtendedPaymentWithDetails {
    id: string
    type: 'incoming' | 'outgoing'
    amount: number
    paymentDate: Date
    method: 'bank_transfer' | 'check' | 'cash' | 'card' | 'other'
    reference?: string | null
    description: string
    notes?: string | null

    // Références optionnelles selon le type
    invoiceId?: string | null
    supplierId?: string | null
    expenseCategoryId?: string | null

    // Données jointes
    invoice?: {
        number: string
        client: {
            name: string
        }
    } | null
    supplier?: {
        name: string
    } | null
    expenseCategory?: {
        name: string
        color?: string | null
    } | null
}

export async function getExtendedPayments(
    companyId: string,
    filters: { type?: 'incoming' | 'outgoing'; limit?: number; offset?: number; search?: string } = {}
): Promise<ExtendedPaymentWithDetails[]> {
    const { type, limit = 50, offset = 0, search } = filters

    let whereConditions = [eq(payment.companyId, companyId)]

    if (type) {
        whereConditions.push(eq(payment.type, type))
    }

    if (search) {
        whereConditions.push(
            or(
                like(payment.description, `%${search}%`),
                like(payment.reference, `%${search}%`),
                like(payment.notes, `%${search}%`)
            )!
        )
    }

    const payments = await db
        .select({
            id: payment.id,
            type: payment.type,
            amount: payment.amount,
            paymentDate: payment.paymentDate,
            method: payment.method,
            reference: payment.reference,
            description: payment.description,
            notes: payment.notes,
            invoiceId: payment.invoiceId,
            supplierId: payment.supplierId,
            expenseCategoryId: payment.expenseCategoryId,

            // Données jointes
            invoiceNumber: invoice.number,
            clientName: client.name,
            supplierName: supplier.name,
            expenseCategoryName: expenseCategory.name,
            expenseCategoryColor: expenseCategory.color,
        })
        .from(payment)
        .leftJoin(invoice, eq(payment.invoiceId, invoice.id))
        .leftJoin(client, eq(invoice.clientId, client.id))
        .leftJoin(supplier, eq(payment.supplierId, supplier.id))
        .leftJoin(expenseCategory, eq(payment.expenseCategoryId, expenseCategory.id))
        .where(and(...whereConditions))
        .orderBy(desc(payment.paymentDate))
        .limit(limit)
        .offset(offset)

    return payments.map(p => ({
        id: p.id,
        type: p.type as 'incoming' | 'outgoing',
        amount: p.amount,
        paymentDate: p.paymentDate,
        method: p.method as 'bank_transfer' | 'check' | 'cash' | 'card' | 'other',
        reference: p.reference,
        description: p.description,
        notes: p.notes,
        invoiceId: p.invoiceId,
        supplierId: p.supplierId,
        expenseCategoryId: p.expenseCategoryId,

        // Données jointes conditionnelles
        invoice: p.invoiceNumber ? {
            number: p.invoiceNumber,
            client: {
                name: p.clientName || 'Client inconnu'
            }
        } : null,

        supplier: p.supplierName ? {
            name: p.supplierName
        } : null,

        expenseCategory: p.expenseCategoryName ? {
            name: p.expenseCategoryName,
            color: p.expenseCategoryColor
        } : null,
    }))
}

// Récupérer les factures pour les paiements entrants
export async function getInvoicesForPayments(companyId: string) {
    return await db
        .select({
            id: invoice.id,
            number: invoice.number,
            total: invoice.total,
            status: invoice.status,
            client: {
                name: client.name,
            }
        })
        .from(invoice)
        .leftJoin(client, eq(invoice.clientId, client.id))
        .where(and(
            eq(invoice.companyId, companyId),
            eq(invoice.status, 'sent') // Seulement les factures envoyées
        ))
        .orderBy(desc(invoice.createdAt))
} 
"use server"
import { useMutation } from "@/lib/safe-action"
import { db } from "@/lib/drizzle"
import {
    createPaymentSchema,
    updatePaymentSchema,
    createSupplierSchema,
    updateSupplierSchema,
    createExpenseCategorySchema,
    updateExpenseCategorySchema
} from "@/validation/accounting-schema"
import {
    payment,
    supplier,
    expenseCategory,
    invoice,
    user,
    company
} from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { z } from "zod"

// Schéma pour la suppression
const deleteSchema = z.object({
    id: z.string().min(1, "L'ID est requis")
})

// Actions pour les paiements étendus
export const createExtendedPaymentAction = useMutation(
    createPaymentSchema,
    async (input, { userId }) => {
        const userResult = await db.select().from(user).where(eq(user.id, userId)).limit(1)
        const currentUser = userResult[0]

        if (!currentUser?.companyId) {
            throw new Error("Utilisateur non associé à une entreprise")
        }

        // Vérifier que la facture appartient à l'entreprise (pour les paiements entrants)
        if (input.type === 'incoming' && input.invoiceId) {
            const invoiceResult = await db.select().from(invoice).where(eq(invoice.id, input.invoiceId)).limit(1)
            const targetInvoice = invoiceResult[0]

            if (!targetInvoice || targetInvoice.companyId !== currentUser.companyId) {
                throw new Error("Facture non trouvée ou non autorisée")
            }
        }

        // Vérifier que le fournisseur appartient à l'entreprise (pour les paiements sortants)
        if (input.type === 'outgoing' && input.supplierId) {
            const supplierResult = await db.select().from(supplier).where(eq(supplier.id, input.supplierId)).limit(1)
            const targetSupplier = supplierResult[0]

            if (!targetSupplier || targetSupplier.companyId !== currentUser.companyId) {
                throw new Error("Fournisseur non trouvé ou non autorisé")
            }
        }

        const newPayment = await db.insert(payment).values({
            type: input.type,
            amount: input.amount,
            paymentDate: new Date(input.date),
            method: input.method,
            reference: input.reference || null,
            description: input.description,
            notes: input.notes || null,
            invoiceId: input.invoiceId || null,
            supplierId: input.supplierId || null,
            expenseCategoryId: input.expenseCategoryId || null,
            companyId: currentUser.companyId,
        }).returning()

        return { success: true, payment: newPayment[0] }
    }
)

export const updateExtendedPaymentAction = useMutation(
    updatePaymentSchema,
    async (input, { userId }) => {
        const userResult = await db.select().from(user).where(eq(user.id, userId)).limit(1)
        const currentUser = userResult[0]

        if (!currentUser?.companyId) {
            throw new Error("Utilisateur non associé à une entreprise")
        }

        const updateData: any = {}
        if (input.type) updateData.type = input.type
        if (input.amount) updateData.amount = input.amount
        if (input.date) updateData.paymentDate = new Date(input.date)
        if (input.method) updateData.method = input.method
        if (input.reference !== undefined) updateData.reference = input.reference
        if (input.description) updateData.description = input.description
        if (input.notes !== undefined) updateData.notes = input.notes
        if (input.invoiceId !== undefined) updateData.invoiceId = input.invoiceId
        if (input.supplierId !== undefined) updateData.supplierId = input.supplierId
        if (input.expenseCategoryId !== undefined) updateData.expenseCategoryId = input.expenseCategoryId
        updateData.updatedAt = new Date()

        const updatedPayment = await db.update(payment)
            .set(updateData)
            .where(
                and(
                    eq(payment.id, input.id),
                    eq(payment.companyId, currentUser.companyId)
                )
            )
            .returning()

        if (!updatedPayment[0]) {
            throw new Error("Paiement non trouvé")
        }

        return { success: true, payment: updatedPayment[0] }
    }
)

export const deleteExtendedPaymentAction = useMutation(
    deleteSchema,
    async (input, { userId }) => {
        const userResult = await db.select().from(user).where(eq(user.id, userId)).limit(1)
        const currentUser = userResult[0]

        if (!currentUser?.companyId) {
            throw new Error("Utilisateur non associé à une entreprise")
        }

        await db.delete(payment)
            .where(
                and(
                    eq(payment.id, input.id),
                    eq(payment.companyId, currentUser.companyId)
                )
            )

        return { success: true, id: input.id }
    }
)

// Actions pour les fournisseurs
export const createSupplierAction = useMutation(
    createSupplierSchema,
    async (input, { userId }) => {
        const userResult = await db.select().from(user).where(eq(user.id, userId)).limit(1)
        const currentUser = userResult[0]

        if (!currentUser?.companyId) {
            throw new Error("Utilisateur non associé à une entreprise")
        }

        const newSupplier = await db.insert(supplier).values({
            name: input.name,
            email: input.email || null,
            phone: input.phone || null,
            address: input.address || null,
            city: input.city || null,
            postalCode: input.postalCode || null,
            country: input.country,
            siret: input.siret || null,
            vatNumber: input.vatNumber || null,
            notes: input.notes || null,
            isActive: input.isActive ?? true,
            companyId: currentUser.companyId,
        }).returning()

        return { success: true, supplier: newSupplier[0] }
    }
)

export const updateSupplierAction = useMutation(
    updateSupplierSchema,
    async (input, { userId }) => {
        const userResult = await db.select().from(user).where(eq(user.id, userId)).limit(1)
        const currentUser = userResult[0]

        if (!currentUser?.companyId) {
            throw new Error("Utilisateur non associé à une entreprise")
        }

        const updateData: any = {}
        if (input.name) updateData.name = input.name
        if (input.email !== undefined) updateData.email = input.email
        if (input.phone !== undefined) updateData.phone = input.phone
        if (input.address !== undefined) updateData.address = input.address
        if (input.city !== undefined) updateData.city = input.city
        if (input.postalCode !== undefined) updateData.postalCode = input.postalCode
        if (input.country) updateData.country = input.country
        if (input.siret !== undefined) updateData.siret = input.siret
        if (input.vatNumber !== undefined) updateData.vatNumber = input.vatNumber
        if (input.notes !== undefined) updateData.notes = input.notes
        if (input.isActive !== undefined) updateData.isActive = input.isActive
        updateData.updatedAt = new Date()

        const updatedSupplier = await db.update(supplier)
            .set(updateData)
            .where(
                and(
                    eq(supplier.id, input.id),
                    eq(supplier.companyId, currentUser.companyId)
                )
            )
            .returning()

        if (!updatedSupplier[0]) {
            throw new Error("Fournisseur non trouvé")
        }

        return { success: true, supplier: updatedSupplier[0] }
    }
)

export const deleteSupplierAction = useMutation(
    deleteSchema,
    async (input, { userId }) => {
        const userResult = await db.select().from(user).where(eq(user.id, userId)).limit(1)
        const currentUser = userResult[0]

        if (!currentUser?.companyId) {
            throw new Error("Utilisateur non associé à une entreprise")
        }

        await db.delete(supplier)
            .where(
                and(
                    eq(supplier.id, input.id),
                    eq(supplier.companyId, currentUser.companyId)
                )
            )

        return { success: true }
    }
)

// Actions pour les catégories de dépenses
export const createExpenseCategoryAction = useMutation(
    createExpenseCategorySchema,
    async (input, { userId }) => {
        const userResult = await db.select().from(user).where(eq(user.id, userId)).limit(1)
        const currentUser = userResult[0]

        if (!currentUser?.companyId) {
            throw new Error("Utilisateur non associé à une entreprise")
        }

        const newCategory = await db.insert(expenseCategory).values({
            name: input.name,
            description: input.description || null,
            color: input.color || null,
            isActive: input.isActive ?? true,
            companyId: currentUser.companyId,
        }).returning()

        return { success: true, category: newCategory[0] }
    }
)

export const updateExpenseCategoryAction = useMutation(
    updateExpenseCategorySchema,
    async (input, { userId }) => {
        const userResult = await db.select().from(user).where(eq(user.id, userId)).limit(1)
        const currentUser = userResult[0]

        if (!currentUser?.companyId) {
            throw new Error("Utilisateur non associé à une entreprise")
        }

        const updateData: any = {}
        if (input.name) updateData.name = input.name
        if (input.description !== undefined) updateData.description = input.description
        if (input.color !== undefined) updateData.color = input.color
        if (input.isActive !== undefined) updateData.isActive = input.isActive
        updateData.updatedAt = new Date()

        const updatedCategory = await db.update(expenseCategory)
            .set(updateData)
            .where(
                and(
                    eq(expenseCategory.id, input.id),
                    eq(expenseCategory.companyId, currentUser.companyId)
                )
            )
            .returning()

        if (!updatedCategory[0]) {
            throw new Error("Catégorie non trouvée")
        }

        return { success: true, category: updatedCategory[0] }
    }
)

export const deleteExpenseCategoryAction = useMutation(
    deleteSchema,
    async (input, { userId }) => {
        const userResult = await db.select().from(user).where(eq(user.id, userId)).limit(1)
        const currentUser = userResult[0]

        if (!currentUser?.companyId) {
            throw new Error("Utilisateur non associé à une entreprise")
        }

        await db.delete(expenseCategory)
            .where(
                and(
                    eq(expenseCategory.id, input.id),
                    eq(expenseCategory.companyId, currentUser.companyId)
                )
            )

        return { success: true }
    }
) 
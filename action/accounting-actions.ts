"use server"

import { useMutation } from "@/lib/safe-action"
import { db } from "@/lib/drizzle"
import {
    chartOfAccounts,
    journalEntry,
    journalEntryLine,
    payment,
    fiscalYear,
    user,
    company
} from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { z } from "zod"
import {
    createAccountSchema,
    updateAccountSchema,
    createJournalEntrySchema,
    updateJournalEntrySchema,
    createPaymentSchema,
    updatePaymentSchema,
    createFiscalYearSchema,
    updateFiscalYearSchema
} from "@/validation/accounting-schema"

// Schémas pour les actions de suppression
const deleteSchema = z.object({
    id: z.string().min(1, "L'ID est requis")
})

// Actions pour le plan comptable
export const createAccountAction = useMutation(
    createAccountSchema,
    async (input, { userId }) => {
        // Vérifier que l'utilisateur appartient à une entreprise
        const userResult = await db.select().from(user).where(eq(user.id, userId)).limit(1)
        const currentUser = userResult[0]

        if (!currentUser?.companyId) {
            throw new Error("Utilisateur non associé à une entreprise")
        }

        const newAccount = await db.insert(chartOfAccounts).values({
            code: input.code,
            name: input.name,
            type: input.type,
            parentAccountId: input.parentId,
            companyId: currentUser.companyId,
        }).returning()

        return { success: true, account: newAccount[0] }
    }
)

export const updateAccountAction = useMutation(
    updateAccountSchema,
    async (input, { userId }) => {
        const userResult = await db.select().from(user).where(eq(user.id, userId)).limit(1)
        const currentUser = userResult[0]

        if (!currentUser?.companyId) {
            throw new Error("Utilisateur non associé à une entreprise")
        }

        const updateData: any = {}
        if (input.code) updateData.code = input.code
        if (input.name) updateData.name = input.name
        if (input.type) updateData.type = input.type
        if (input.parentId !== undefined) updateData.parentAccountId = input.parentId
        updateData.updatedAt = new Date()

        const updatedAccount = await db.update(chartOfAccounts)
            .set(updateData)
            .where(
                and(
                    eq(chartOfAccounts.id, input.id),
                    eq(chartOfAccounts.companyId, currentUser.companyId)
                )
            )
            .returning()

        if (!updatedAccount[0]) {
            throw new Error("Compte non trouvé")
        }

        return { success: true, account: updatedAccount[0] }
    }
)

export const deleteAccountAction = useMutation(
    deleteSchema,
    async (input, { userId }) => {
        const userResult = await db.select().from(user).where(eq(user.id, userId)).limit(1)
        const currentUser = userResult[0]

        if (!currentUser?.companyId) {
            throw new Error("Utilisateur non associé à une entreprise")
        }

        // Vérifier qu'il n'y a pas d'écritures liées à ce compte
        const hasEntries = await db.select().from(journalEntryLine).where(eq(journalEntryLine.accountId, input.id)).limit(1)

        if (hasEntries.length > 0) {
            throw new Error("Impossible de supprimer un compte avec des écritures")
        }

        await db.delete(chartOfAccounts)
            .where(
                and(
                    eq(chartOfAccounts.id, input.id),
                    eq(chartOfAccounts.companyId, currentUser.companyId)
                )
            )

        return { success: true }
    }
)

// Actions pour les écritures comptables
export const createJournalEntryAction = useMutation(
    createJournalEntrySchema,
    async (input, { userId }) => {
        const userResult = await db.select().from(user).where(eq(user.id, userId)).limit(1)
        const currentUser = userResult[0]

        if (!currentUser?.companyId) {
            throw new Error("Utilisateur non associé à une entreprise")
        }

        // Créer l'écriture
        const newEntry = await db.insert(journalEntry).values({
            number: input.number,
            date: new Date(input.date),
            description: input.description,
            type: 'adjustment', // Par défaut
            companyId: currentUser.companyId,
            isPosted: input.status === 'posted'
        }).returning()

        // Créer les lignes d'écriture
        const lines = await Promise.all(
            input.lines.map(line =>
                db.insert(journalEntryLine).values({
                    journalEntryId: newEntry[0].id,
                    accountId: line.accountId,
                    debit: line.debit,
                    credit: line.credit,
                    description: line.description
                }).returning()
            )
        )

        return {
            success: true,
            entry: newEntry[0],
            lines: lines.flat()
        }
    }
)

export const updateJournalEntryAction = useMutation(
    updateJournalEntrySchema,
    async (input, { userId }) => {
        const userResult = await db.select().from(user).where(eq(user.id, userId)).limit(1)
        const currentUser = userResult[0]

        if (!currentUser?.companyId) {
            throw new Error("Utilisateur non associé à une entreprise")
        }

        const updateData: any = {}
        if (input.number) updateData.number = input.number
        if (input.date) updateData.date = new Date(input.date)
        if (input.description) updateData.description = input.description
        if (input.status) updateData.isPosted = input.status === 'posted'
        updateData.updatedAt = new Date()

        // Mettre à jour l'écriture
        const updatedEntry = await db.update(journalEntry)
            .set(updateData)
            .where(
                and(
                    eq(journalEntry.id, input.id),
                    eq(journalEntry.companyId, currentUser.companyId)
                )
            )
            .returning()

        if (!updatedEntry[0]) {
            throw new Error("Écriture non trouvée")
        }

        // Mettre à jour les lignes si fournies
        if (input.lines) {
            // Supprimer les anciennes lignes
            await db.delete(journalEntryLine)
                .where(eq(journalEntryLine.journalEntryId, input.id))

            // Créer les nouvelles lignes
            await Promise.all(
                input.lines.map(line =>
                    db.insert(journalEntryLine).values({
                        journalEntryId: input.id,
                        accountId: line.accountId,
                        debit: line.debit,
                        credit: line.credit,
                        description: line.description
                    })
                )
            )
        }

        return { success: true, entry: updatedEntry[0] }
    }
)

export const deleteJournalEntryAction = useMutation(
    deleteSchema,
    async (input, { userId }) => {
        const userResult = await db.select().from(user).where(eq(user.id, userId)).limit(1)
        const currentUser = userResult[0]

        if (!currentUser?.companyId) {
            throw new Error("Utilisateur non associé à une entreprise")
        }

        // Supprimer les lignes d'écriture
        await db.delete(journalEntryLine)
            .where(eq(journalEntryLine.journalEntryId, input.id))

        // Supprimer l'écriture
        await db.delete(journalEntry)
            .where(
                and(
                    eq(journalEntry.id, input.id),
                    eq(journalEntry.companyId, currentUser.companyId)
                )
            )

        return { success: true }
    }
)

// Actions pour les paiements
export const createPaymentAction = useMutation(
    createPaymentSchema,
    async (input, { userId }) => {
        const userResult = await db.select().from(user).where(eq(user.id, userId)).limit(1)
        const currentUser = userResult[0]

        if (!currentUser?.companyId) {
            throw new Error("Utilisateur non associé à une entreprise")
        }

        // Pour les paiements, on a besoin d'un invoiceId obligatoire selon le schéma
        // On va créer un paiement factice pour l'instant ou adapter le schéma
        const newPayment = await db.insert(payment).values({
            invoiceId: "temp-invoice-id", // TODO: Gérer correctement l'invoiceId
            amount: input.amount,
            paymentDate: new Date(input.date),
            method: input.method,
            reference: input.reference,
            notes: input.description,
            companyId: currentUser.companyId,
        }).returning()

        return { success: true, payment: newPayment[0] }
    }
)

export const updatePaymentAction = useMutation(
    updatePaymentSchema,
    async (input, { userId }) => {
        const userResult = await db.select().from(user).where(eq(user.id, userId)).limit(1)
        const currentUser = userResult[0]

        if (!currentUser?.companyId) {
            throw new Error("Utilisateur non associé à une entreprise")
        }

        const updateData: any = {}
        if (input.amount) updateData.amount = input.amount
        if (input.date) updateData.paymentDate = new Date(input.date)
        if (input.method) updateData.method = input.method
        if (input.reference) updateData.reference = input.reference
        if (input.description) updateData.notes = input.description

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

export const deletePaymentAction = useMutation(
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

        return { success: true }
    }
)

// Actions pour les exercices fiscaux
export const createFiscalYearAction = useMutation(
    createFiscalYearSchema,
    async (input, { userId }) => {
        const userResult = await db.select().from(user).where(eq(user.id, userId)).limit(1)
        const currentUser = userResult[0]

        if (!currentUser?.companyId) {
            throw new Error("Utilisateur non associé à une entreprise")
        }

        // Si c'est l'exercice actuel, désactiver les autres
        if (input.isCurrent) {
            await db.update(fiscalYear)
                .set({ isClosed: true })
                .where(eq(fiscalYear.companyId, currentUser.companyId))
        }

        const newFiscalYear = await db.insert(fiscalYear).values({
            name: input.name,
            startDate: new Date(input.startDate),
            endDate: new Date(input.endDate),
            isClosed: input.status === 'closed',
            companyId: currentUser.companyId,
        }).returning()

        return { success: true, fiscalYear: newFiscalYear[0] }
    }
)

export const updateFiscalYearAction = useMutation(
    updateFiscalYearSchema,
    async (input, { userId }) => {
        const userResult = await db.select().from(user).where(eq(user.id, userId)).limit(1)
        const currentUser = userResult[0]

        if (!currentUser?.companyId) {
            throw new Error("Utilisateur non associé à une entreprise")
        }

        const updateData: any = {}
        if (input.name) updateData.name = input.name
        if (input.startDate) updateData.startDate = new Date(input.startDate)
        if (input.endDate) updateData.endDate = new Date(input.endDate)
        if (input.status) updateData.isClosed = input.status === 'closed'
        updateData.updatedAt = new Date()

        const updatedFiscalYear = await db.update(fiscalYear)
            .set(updateData)
            .where(
                and(
                    eq(fiscalYear.id, input.id),
                    eq(fiscalYear.companyId, currentUser.companyId)
                )
            )
            .returning()

        if (!updatedFiscalYear[0]) {
            throw new Error("Exercice fiscal non trouvé")
        }

        return { success: true, fiscalYear: updatedFiscalYear[0] }
    }
)

export const deleteFiscalYearAction = useMutation(
    deleteSchema,
    async (input, { userId }) => {
        const userResult = await db.select().from(user).where(eq(user.id, userId)).limit(1)
        const currentUser = userResult[0]

        if (!currentUser?.companyId) {
            throw new Error("Utilisateur non associé à une entreprise")
        }

        await db.delete(fiscalYear)
            .where(
                and(
                    eq(fiscalYear.id, input.id),
                    eq(fiscalYear.companyId, currentUser.companyId)
                )
            )

        return { success: true }
    }
) 
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
    company,
    invoice,
    supplier,
    expenseCategory
} from "@/db/schema"
import { eq, and, sql } from "drizzle-orm"
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
import { getUserWithCompany } from "@/db/queries/company"
import { ActionError } from "@/lib/safe-action"

// Schémas pour les actions de suppression
const deleteSchema = z.object({
    id: z.string().min(1, "L'ID est requis")
})

// Actions pour le plan comptable
export const createAccountAction = useMutation(
    createAccountSchema,
    async (input, { userId }) => {
        const userWithCompany = await getUserWithCompany(userId)
        const companyId = userWithCompany.company?.id

        if (!companyId) {
            throw new ActionError("Entreprise non trouvée")
        }

        // Vérifier si le code existe déjà
        const existingAccount = await db
            .select()
            .from(chartOfAccounts)
            .where(
                and(
                    eq(chartOfAccounts.code, input.code),
                    eq(chartOfAccounts.companyId, companyId)
                )
            )
            .limit(1)

        if (existingAccount.length > 0) {
            throw new ActionError("Un compte avec ce code existe déjà")
        }

        // Vérifier si le compte parent existe si parentId est fourni
        if (input.parentId) {
            const parentAccount = await db
                .select()
                .from(chartOfAccounts)
                .where(
                    and(
                        eq(chartOfAccounts.id, input.parentId),
                        eq(chartOfAccounts.companyId, companyId)
                    )
                )
                .limit(1)

            if (parentAccount.length === 0) {
                throw new ActionError("Le compte parent n'existe pas")
            }
        }

        const [account] = await db
            .insert(chartOfAccounts)
            .values({
                code: input.code,
                name: input.name,
                type: input.type,
                parentAccountId: input.parentId || null,
                companyId,
                // Le solde sera calculé dynamiquement à partir des écritures
            })
            .returning()

        return { success: true, account }
    }
)

export const updateAccountAction = useMutation(
    updateAccountSchema,
    async (input, { userId }) => {
        const userWithCompany = await getUserWithCompany(userId)
        const companyId = userWithCompany.company?.id

        if (!companyId) {
            throw new ActionError("Entreprise non trouvée")
        }

        // Vérifier si le compte existe
        const existingAccount = await db
            .select()
            .from(chartOfAccounts)
            .where(
                and(
                    eq(chartOfAccounts.id, input.id),
                    eq(chartOfAccounts.companyId, companyId)
                )
            )
            .limit(1)

        if (existingAccount.length === 0) {
            throw new ActionError("Compte non trouvé")
        }

        // Vérifier si le nouveau code existe déjà (sauf pour ce compte)
        const duplicateCode = await db
            .select()
            .from(chartOfAccounts)
            .where(
                and(
                    eq(chartOfAccounts.code, input.code),
                    eq(chartOfAccounts.companyId, companyId),
                    sql`${chartOfAccounts.id} != ${input.id}`
                )
            )
            .limit(1)

        if (duplicateCode.length > 0) {
            throw new ActionError("Un autre compte avec ce code existe déjà")
        }

        // Vérifier si le compte parent existe si parentId est fourni
        if (input.parentId) {
            const parentAccount = await db
                .select()
                .from(chartOfAccounts)
                .where(
                    and(
                        eq(chartOfAccounts.id, input.parentId),
                        eq(chartOfAccounts.companyId, companyId)
                    )
                )
                .limit(1)

            if (parentAccount.length === 0) {
                throw new ActionError("Le compte parent n'existe pas")
            }

            // Éviter les références circulaires
            if (input.parentId === input.id) {
                throw new ActionError("Un compte ne peut pas être son propre parent")
            }
        }

        const [account] = await db
            .update(chartOfAccounts)
            .set({
                code: input.code,
                name: input.name,
                type: input.type,
                parentAccountId: input.parentId || null,
                // Le solde sera calculé dynamiquement à partir des écritures
                updatedAt: new Date(),
            })
            .where(eq(chartOfAccounts.id, input.id))
            .returning()

        return { success: true, account }
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
        const userWithCompany = await getUserWithCompany(userId)
        const companyId = userWithCompany.company?.id

        if (!companyId) {
            throw new ActionError("Entreprise non trouvée")
        }

        // Vérifier que la facture existe et appartient à l'entreprise
        const invoiceExists = await db
            .select()
            .from(invoice)
            .where(
                and(
                    eq(invoice.id, input.invoiceId!),
                    eq(invoice.companyId, companyId)
                )
            )
            .limit(1)

        if (invoiceExists.length === 0) {
            throw new ActionError("Facture non trouvée")
        }

        const [newPayment] = await db.insert(payment).values({
            description: `Paiement pour la facture ${input.invoiceId}`,
            type: "incoming",
            invoiceId: input.invoiceId,
            amount: input.amount,
            paymentDate: new Date(input.date),
            method: input.method,
            reference: input.reference || null,
            notes: input.notes || null,
            companyId,
        }).returning()

        return { success: true, payment: newPayment }
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
        if (input.notes) updateData.notes = input.notes

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

        return { success: true, id: input.id }
    }
)

// Action pour récupérer les exercices fiscaux avec leurs statistiques
export const getFiscalYearsWithStatsAction = useMutation(
    z.object({}),
    async (input, { userId }) => {
        const userWithCompany = await getUserWithCompany(userId)
        const companyId = userWithCompany.company?.id

        if (!companyId) {
            throw new ActionError("Entreprise non trouvée")
        }

        // Utiliser la fonction existante de queries/accounting.ts
        const { getFiscalYears } = await import("@/db/queries/accounting")
        const fiscalYears = await getFiscalYears(companyId)

        return {
            success: true,
            data: fiscalYears
        }
    }
) 
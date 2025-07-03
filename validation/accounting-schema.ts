import { z } from "zod"

// Schémas pour le plan comptable
export const accountSchema = z.object({
    id: z.string().optional(),
    code: z.string().min(1, "Le code du compte est requis"),
    name: z.string().min(2, "Le nom du compte doit contenir au moins 2 caractères"),
    type: z.enum(["asset", "liability", "equity", "revenue", "expense"], {
        required_error: "Le type de compte est requis"
    }),
    parentId: z.string().optional(),
    description: z.string().optional(),
})

export const createAccountSchema = z.object({
    code: z.string().min(1, "Le code est requis").regex(/^\d{6}$/, "Le code doit contenir exactement 6 chiffres"),
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    type: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']),
    parentId: z.string().optional(),
})

export const updateAccountSchema = z.object({
    id: z.string(),
    code: z.string().min(1, "Le code est requis").regex(/^\d{6}$/, "Le code doit contenir exactement 6 chiffres"),
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    type: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']),
    parentId: z.string().optional(),
})

// Schémas pour les écritures comptables
export const journalEntryLineSchema = z.object({
    id: z.string().optional(),
    accountId: z.string().min(1, "Le compte est requis"),
    description: z.string().min(1, "La description est requise"),
    debit: z.number().min(0, "Le débit doit être positif"),
    credit: z.number().min(0, "Le crédit doit être positif"),
})

export const journalEntrySchema = z.object({
    id: z.string().optional(),
    number: z.string().min(1, "Le numéro d'écriture est requis"),
    date: z.string().min(1, "La date est requise"),
    description: z.string().min(1, "La description est requise"),
    status: z.enum(["draft", "posted", "cancelled"]).default("draft"),
    lines: z.array(journalEntryLineSchema).min(1, "Au moins une ligne est requise"),
}).refine((data) => {
    // Vérifier que le total des débits = total des crédits
    const totalDebit = data.lines.reduce((sum, line) => sum + line.debit, 0)
    const totalCredit = data.lines.reduce((sum, line) => sum + line.credit, 0)
    return Math.abs(totalDebit - totalCredit) < 0.01
}, {
    message: "Le total des débits doit être égal au total des crédits",
    path: ["lines"]
})

export const createJournalEntrySchema = z.object({
    number: z.string().min(1, "Le numéro d'écriture est requis"),
    date: z.string().min(1, "La date est requise"),
    description: z.string().min(1, "La description est requise"),
    status: z.enum(["draft", "posted", "cancelled"]).default("draft"),
    lines: z.array(journalEntryLineSchema).min(1, "Au moins une ligne est requise"),
}).refine((data) => {
    // Vérifier que le total des débits = total des crédits
    const totalDebit = data.lines.reduce((sum, line) => sum + line.debit, 0)
    const totalCredit = data.lines.reduce((sum, line) => sum + line.credit, 0)
    return Math.abs(totalDebit - totalCredit) < 0.01
}, {
    message: "Le total des débits doit être égal au total des crédits",
    path: ["lines"]
})

export const updateJournalEntrySchema = z.object({
    id: z.string().min(1, "L'ID de l'écriture est requis"),
    number: z.string().min(1, "Le numéro d'écriture est requis").optional(),
    date: z.string().min(1, "La date est requise").optional(),
    description: z.string().min(1, "La description est requise").optional(),
    status: z.enum(["draft", "posted", "cancelled"]).optional(),
    lines: z.array(journalEntryLineSchema).min(1, "Au moins une ligne est requise").optional(),
}).refine((data) => {
    if (!data.lines) return true
    // Vérifier que le total des débits = total des crédits
    const totalDebit = data.lines.reduce((sum, line) => sum + line.debit, 0)
    const totalCredit = data.lines.reduce((sum, line) => sum + line.credit, 0)
    return Math.abs(totalDebit - totalCredit) < 0.01
}, {
    message: "Le total des débits doit être égal au total des crédits",
    path: ["lines"]
})

// Schémas pour les paiements
export const paymentSchema = z.object({
    id: z.string().optional(),
    type: z.enum(["incoming", "outgoing"], {
        required_error: "Le type de paiement est requis"
    }),
    amount: z.number().positive("Le montant doit être positif"),
    date: z.string().min(1, "La date est requise"),
    method: z.enum(["bank_transfer", "check", "cash", "card", "other"], {
        required_error: "La méthode de paiement est requise"
    }),
    reference: z.string().optional(),
    description: z.string().min(1, "La description est requise"),
    notes: z.string().optional(),
    invoiceId: z.string().optional().nullable(), // Pour les encaissements
    supplierId: z.string().optional().nullable(), // Pour les décaissements
    expenseCategoryId: z.string().optional().nullable(), // Catégorie de dépense
})

export const createPaymentSchema = paymentSchema.omit({ id: true })
export const updatePaymentSchema = paymentSchema.partial().extend({
    id: z.string().min(1, "L'ID du paiement est requis")
})

// Schémas pour les fournisseurs
export const supplierSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Le nom est requis"),
    email: z.string().email("Email invalide").optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().min(1, "Le pays est requis"),
    siret: z.string().optional(),
    vatNumber: z.string().optional(),
    notes: z.string().optional(),
    isActive: z.boolean().default(true),
})

export const createSupplierSchema = supplierSchema.omit({ id: true })
export const updateSupplierSchema = supplierSchema.partial().extend({
    id: z.string().min(1, "L'ID du fournisseur est requis")
})

// Schémas pour les catégories de dépenses
export const expenseCategorySchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Le nom est requis"),
    description: z.string().optional(),
    color: z.string().optional(),
    isActive: z.boolean().default(true),
})

export const createExpenseCategorySchema = expenseCategorySchema.omit({ id: true })
export const updateExpenseCategorySchema = expenseCategorySchema.partial().extend({
    id: z.string().min(1, "L'ID de la catégorie est requis")
})

// Schémas pour les exercices fiscaux
export const fiscalYearSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Le nom de l'exercice est requis"),
    startDate: z.string().min(1, "La date de début est requise"),
    endDate: z.string().min(1, "La date de fin est requise"),
    status: z.enum(["open", "closed", "draft"]).default("draft"),
    isCurrent: z.boolean().default(false),
})

export const createFiscalYearSchema = fiscalYearSchema.omit({ id: true })
export const updateFiscalYearSchema = fiscalYearSchema.partial().extend({
    id: z.string().min(1, "L'ID de l'exercice est requis")
})

// Schémas pour les filtres et requêtes
export const accountingFiltersSchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: z.string().optional(),
    type: z.string().optional(),
    search: z.string().optional(),
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0),
})

export const reportSchema = z.object({
    type: z.enum(["balance_sheet", "income_statement", "cash_flow", "trial_balance"]),
    startDate: z.string().min(1, "La date de début est requise"),
    endDate: z.string().min(1, "La date de fin est requise"),
    format: z.enum(["json", "pdf", "excel"]).default("json"),
}) 
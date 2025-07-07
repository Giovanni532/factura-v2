import { db } from "@/lib/drizzle"
import {
    chartOfAccounts,
    journalEntry,
    journalEntryLine,
    payment,
    fiscalYear,
    company,
    client,
    supplier,
    expenseCategory,
    invoice,
    quote
} from "@/db/schema"
import { eq, and, desc, asc, sql, gte, lte, like, or, isNull, isNotNull } from "drizzle-orm"
import { accountingFiltersSchema } from "@/validation/accounting-schema"

// Types pour les résultats
export interface AccountWithBalance {
    id: string
    code: string
    name: string
    type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
    parentAccountId?: string | null
    balance: number
    children?: AccountWithBalance[]
}

export interface JournalEntryWithLines {
    id: string
    number: string
    date: Date
    description: string
    reference?: string | null
    type: 'sale' | 'purchase' | 'payment' | 'receipt' | 'adjustment'
    isPosted: boolean
    total: number
    lines: {
        id: string
        accountId: string
        accountCode: string
        accountName: string
        debit: number
        credit: number
        description?: string | null
    }[]
}

export interface PaymentWithDetails {
    id: string
    invoiceId: string | null
    amount: number
    paymentDate: Date
    method: 'bank_transfer' | 'check' | 'cash' | 'card' | 'other'
    reference?: string | null
    notes?: string | null
    invoice: {
        number: string
        client: {
            name: string
        }
    }
}

export interface FiscalYearWithStats {
    id: string
    name: string
    startDate: Date
    endDate: Date
    isClosed: boolean
    totalRevenue: number
    totalExpenses: number
    netIncome: number
}

// Requêtes pour le plan comptable
export async function getChartOfAccounts(companyId: string): Promise<AccountWithBalance[]> {
    const accounts = await db
        .select({
            id: chartOfAccounts.id,
            code: chartOfAccounts.code,
            name: chartOfAccounts.name,
            type: chartOfAccounts.type,
            parentAccountId: chartOfAccounts.parentAccountId,
        })
        .from(chartOfAccounts)
        .where(eq(chartOfAccounts.companyId, companyId))
        .orderBy(asc(chartOfAccounts.code))

    // Calculer les soldes pour chaque compte
    const accountsWithBalance = await Promise.all(
        accounts.map(async (account) => {
            const balance = await calculateAccountBalance(account.id)
            return {
                ...account,
                balance,
                children: []
            }
        })
    )

    // Organiser la hiérarchie parent/enfant
    const accountMap = new Map<string, AccountWithBalance>()
    const rootAccounts: AccountWithBalance[] = []

    accountsWithBalance.forEach(account => {
        accountMap.set(account.id, account)
    })

    accountsWithBalance.forEach(account => {
        if (account.parentAccountId) {
            const parent = accountMap.get(account.parentAccountId)
            if (parent) {
                parent.children = parent.children || []
                parent.children.push(account)
            }
        } else {
            rootAccounts.push(account)
        }
    })

    return rootAccounts
}

async function calculateAccountBalance(accountId: string): Promise<number> {
    // D'abord récupérer le type de compte
    const account = await db
        .select({ type: chartOfAccounts.type })
        .from(chartOfAccounts)
        .where(eq(chartOfAccounts.id, accountId))
        .limit(1)

    if (!account[0]) return 0

    // Calculer les totaux débit et crédit
    const result = await db
        .select({
            totalDebit: sql<number>`COALESCE(SUM(${journalEntryLine.debit}), 0)`,
            totalCredit: sql<number>`COALESCE(SUM(${journalEntryLine.credit}), 0)`
        })
        .from(journalEntryLine)
        .innerJoin(journalEntry, eq(journalEntryLine.journalEntryId, journalEntry.id))
        .where(
            and(
                eq(journalEntryLine.accountId, accountId),
                eq(journalEntry.isPosted, true)
            )
        )

    const totalDebit = result[0]?.totalDebit || 0
    const totalCredit = result[0]?.totalCredit || 0

    // Calculer le solde selon le type de compte
    switch (account[0].type) {
        case 'asset':
        case 'expense':
            // Actifs et charges : Débit - Crédit (solde débiteur positif)
            return totalDebit - totalCredit
        case 'liability':
        case 'equity':
        case 'revenue':
            // Passifs, capitaux propres et produits : Crédit - Débit (solde créditeur positif)
            return totalCredit - totalDebit
        default:
            return 0
    }
}

export async function getAccountById(accountId: string, companyId: string) {
    return await db
        .select()
        .from(chartOfAccounts)
        .where(
            and(
                eq(chartOfAccounts.id, accountId),
                eq(chartOfAccounts.companyId, companyId)
            )
        )
        .limit(1)
}

// Requêtes pour les écritures comptables
export async function getJournalEntries(
    companyId: string,
    filters: typeof accountingFiltersSchema._type
): Promise<JournalEntryWithLines[]> {
    const whereConditions = [eq(journalEntry.companyId, companyId)]

    if (filters.startDate) {
        whereConditions.push(gte(journalEntry.date, new Date(filters.startDate)))
    }
    if (filters.endDate) {
        whereConditions.push(lte(journalEntry.date, new Date(filters.endDate)))
    }
    if (filters.status) {
        whereConditions.push(eq(journalEntry.isPosted, filters.status === 'posted'))
    }
    if (typeof filters.search === 'string' && filters.search.length > 0) {
        const search = `%${filters.search}%`
        const searchCondition = or(
            sql`COALESCE(${journalEntry.number}, '') LIKE ${search}`,
            sql`COALESCE(${journalEntry.description}, '') LIKE ${search}`,
            sql`COALESCE(${journalEntry.reference}, '') LIKE ${search}`
        )
        if (searchCondition) {
            whereConditions.push(searchCondition)
        }
    }

    const entries = await db
        .select({
            id: journalEntry.id,
            number: journalEntry.number,
            date: journalEntry.date,
            description: journalEntry.description,
            reference: journalEntry.reference,
            type: journalEntry.type,
            isPosted: journalEntry.isPosted,
        })
        .from(journalEntry)
        .where(and(...whereConditions))
        .orderBy(desc(journalEntry.date), desc(journalEntry.createdAt))
        .limit(filters.limit)
        .offset(filters.offset)

    // Récupérer les lignes pour chaque écriture
    const entriesWithLines = await Promise.all(
        entries.map(async (entry) => {
            const lines = await db
                .select({
                    id: journalEntryLine.id,
                    accountId: journalEntryLine.accountId,
                    accountCode: chartOfAccounts.code,
                    accountName: chartOfAccounts.name,
                    debit: journalEntryLine.debit,
                    credit: journalEntryLine.credit,
                    description: journalEntryLine.description,
                })
                .from(journalEntryLine)
                .innerJoin(chartOfAccounts, eq(journalEntryLine.accountId, chartOfAccounts.id))
                .where(eq(journalEntryLine.journalEntryId, entry.id))

            const total = lines.reduce((sum, line) => sum + line.debit, 0)

            return {
                ...entry,
                total,
                lines
            }
        })
    )

    return entriesWithLines
}

export async function getJournalEntryById(entryId: string, companyId: string): Promise<JournalEntryWithLines | null> {
    const entry = await db
        .select({
            id: journalEntry.id,
            number: journalEntry.number,
            date: journalEntry.date,
            description: journalEntry.description,
            reference: journalEntry.reference,
            type: journalEntry.type,
            isPosted: journalEntry.isPosted,
        })
        .from(journalEntry)
        .where(
            and(
                eq(journalEntry.id, entryId),
                eq(journalEntry.companyId, companyId)
            )
        )
        .limit(1)

    if (!entry[0]) return null

    const lines = await db
        .select({
            id: journalEntryLine.id,
            accountId: journalEntryLine.accountId,
            accountCode: chartOfAccounts.code,
            accountName: chartOfAccounts.name,
            debit: journalEntryLine.debit,
            credit: journalEntryLine.credit,
            description: journalEntryLine.description,
        })
        .from(journalEntryLine)
        .innerJoin(chartOfAccounts, eq(journalEntryLine.accountId, chartOfAccounts.id))
        .where(eq(journalEntryLine.journalEntryId, entryId))

    const total = lines.reduce((sum, line) => sum + line.debit, 0)

    return {
        ...entry[0],
        total,
        lines
    }
}

// Requêtes pour les paiements
export async function getPayments(
    companyId: string,
    filters: typeof accountingFiltersSchema._type
): Promise<PaymentWithDetails[]> {
    const whereConditions = [eq(payment.companyId, companyId)]

    if (filters.startDate) {
        whereConditions.push(gte(payment.paymentDate, new Date(filters.startDate)))
    }
    if (filters.endDate) {
        whereConditions.push(lte(payment.paymentDate, new Date(filters.endDate)))
    }
    if (typeof filters.search === 'string' && filters.search.length > 0) {
        const search = `%${filters.search}%`
        const searchCondition = or(
            sql`COALESCE(${payment.reference}, '') LIKE ${search}`,
            sql`COALESCE(${payment.notes}, '') LIKE ${search}`
        )
        if (searchCondition) {
            whereConditions.push(searchCondition)
        }
    }

    const payments = await db
        .select({
            id: payment.id,
            invoiceId: payment.invoiceId,
            amount: payment.amount,
            paymentDate: payment.paymentDate,
            method: payment.method,
            reference: payment.reference,
            notes: payment.notes,
            invoiceNumber: invoice.number,
            clientName: client.name,
        })
        .from(payment)
        .innerJoin(invoice, eq(payment.invoiceId, invoice.id))
        .innerJoin(client, eq(invoice.clientId, client.id))
        .where(and(...whereConditions))
        .orderBy(desc(payment.paymentDate))
        .limit(filters.limit)
        .offset(filters.offset)

    return payments.map(p => ({
        id: p.id,
        invoiceId: p.invoiceId,
        amount: p.amount,
        paymentDate: p.paymentDate,
        method: p.method,
        reference: p.reference,
        notes: p.notes,
        invoice: {
            number: p.invoiceNumber,
            client: {
                name: p.clientName,
            }
        }
    }))
}

// Requêtes pour les exercices fiscaux
export async function getFiscalYears(companyId: string): Promise<FiscalYearWithStats[]> {
    const fiscalYears = await db
        .select({
            id: fiscalYear.id,
            name: fiscalYear.name,
            startDate: fiscalYear.startDate,
            endDate: fiscalYear.endDate,
            isClosed: fiscalYear.isClosed,
        })
        .from(fiscalYear)
        .where(eq(fiscalYear.companyId, companyId))
        .orderBy(desc(fiscalYear.startDate))

    // Calculer les statistiques pour chaque exercice
    const fiscalYearsWithStats = await Promise.all(
        fiscalYears.map(async (year) => {
            const stats = await calculateFiscalYearStats(year.id)
            return {
                ...year,
                ...stats
            }
        })
    )

    return fiscalYearsWithStats
}

async function calculateFiscalYearStats(fiscalYearId: string) {
    // Récupérer les dates de l'exercice
    const year = await db
        .select({
            startDate: fiscalYear.startDate,
            endDate: fiscalYear.endDate,
        })
        .from(fiscalYear)
        .where(eq(fiscalYear.id, fiscalYearId))
        .limit(1)

    if (!year[0]) return { totalRevenue: 0, totalExpenses: 0, netIncome: 0 }

    // Calculer les revenus (comptes de produits)
    const revenueResult = await db
        .select({
            total: sql<number>`COALESCE(SUM(${journalEntryLine.credit}), 0)`
        })
        .from(journalEntryLine)
        .innerJoin(journalEntry, eq(journalEntryLine.journalEntryId, journalEntry.id))
        .innerJoin(chartOfAccounts, eq(journalEntryLine.accountId, chartOfAccounts.id))
        .where(
            and(
                eq(chartOfAccounts.type, 'revenue'),
                eq(journalEntry.isPosted, true),
                gte(journalEntry.date, year[0].startDate),
                lte(journalEntry.date, year[0].endDate)
            )
        )

    // Calculer les dépenses (comptes de charges)
    const expenseResult = await db
        .select({
            total: sql<number>`COALESCE(SUM(${journalEntryLine.debit}), 0)`
        })
        .from(journalEntryLine)
        .innerJoin(journalEntry, eq(journalEntryLine.journalEntryId, journalEntry.id))
        .innerJoin(chartOfAccounts, eq(journalEntryLine.accountId, chartOfAccounts.id))
        .where(
            and(
                eq(chartOfAccounts.type, 'expense'),
                eq(journalEntry.isPosted, true),
                gte(journalEntry.date, year[0].startDate),
                lte(journalEntry.date, year[0].endDate)
            )
        )

    const totalRevenue = revenueResult[0]?.total || 0
    const totalExpenses = expenseResult[0]?.total || 0
    const netIncome = totalRevenue - totalExpenses

    return { totalRevenue, totalExpenses, netIncome }
}

// Statistiques pour le dashboard
export async function getAccountingStats(companyId: string) {
    const currentMonth = new Date()
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

    const previousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    const endOfPreviousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0)

    // Revenus du mois actuel
    const currentRevenueResult = await db
        .select({
            total: sql<number>`COALESCE(SUM(${journalEntryLine.credit}), 0)`
        })
        .from(journalEntryLine)
        .innerJoin(journalEntry, eq(journalEntryLine.journalEntryId, journalEntry.id))
        .innerJoin(chartOfAccounts, eq(journalEntryLine.accountId, chartOfAccounts.id))
        .where(
            and(
                eq(chartOfAccounts.type, 'revenue'),
                eq(journalEntry.isPosted, true),
                gte(journalEntry.date, startOfMonth),
                lte(journalEntry.date, endOfMonth)
            )
        )

    // Revenus du mois précédent
    const previousRevenueResult = await db
        .select({
            total: sql<number>`COALESCE(SUM(${journalEntryLine.credit}), 0)`
        })
        .from(journalEntryLine)
        .innerJoin(journalEntry, eq(journalEntryLine.journalEntryId, journalEntry.id))
        .innerJoin(chartOfAccounts, eq(journalEntryLine.accountId, chartOfAccounts.id))
        .where(
            and(
                eq(chartOfAccounts.type, 'revenue'),
                eq(journalEntry.isPosted, true),
                gte(journalEntry.date, previousMonth),
                lte(journalEntry.date, endOfPreviousMonth)
            )
        )

    // Dépenses du mois actuel
    const currentExpensesResult = await db
        .select({
            total: sql<number>`COALESCE(SUM(${journalEntryLine.debit}), 0)`
        })
        .from(journalEntryLine)
        .innerJoin(journalEntry, eq(journalEntryLine.journalEntryId, journalEntry.id))
        .innerJoin(chartOfAccounts, eq(journalEntryLine.accountId, chartOfAccounts.id))
        .where(
            and(
                eq(chartOfAccounts.type, 'expense'),
                eq(journalEntry.isPosted, true),
                gte(journalEntry.date, startOfMonth),
                lte(journalEntry.date, endOfMonth)
            )
        )

    // Paiements en attente (simplifié)
    const pendingPaymentsResult = await db
        .select({
            total: sql<number>`COALESCE(SUM(${invoice.total}), 0)`
        })
        .from(invoice)
        .where(
            and(
                eq(invoice.companyId, companyId),
                eq(invoice.status, 'sent'),
                lte(invoice.dueDate, new Date())
            )
        )

    const currentRevenue = currentRevenueResult[0]?.total || 0
    const previousRevenue = previousRevenueResult[0]?.total || 0
    const currentExpenses = currentExpensesResult[0]?.total || 0
    const pendingPayments = pendingPaymentsResult[0]?.total || 0

    const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0
    const expensesChange = 0 // À calculer si nécessaire
    const netIncome = currentRevenue - currentExpenses
    const netIncomeChange = previousRevenue > 0 ? ((netIncome - (previousRevenue - currentExpenses)) / (previousRevenue - currentExpenses)) * 100 : 0

    return {
        revenue: {
            current: currentRevenue,
            change: revenueChange
        },
        expenses: {
            current: currentExpenses,
            change: expensesChange
        },
        netIncome: {
            current: netIncome,
            change: netIncomeChange
        },
        pendingPayments: {
            current: pendingPayments,
            change: 0
        }
    }
}

// Historique des revenus par mois
export async function getRevenueHistory(companyId: string, months: number = 12) {
    const monthsData = []
    const currentDate = new Date()

    for (let i = months - 1; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)

        const monthNames = [
            "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
            "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
        ]

        const monthName = monthNames[date.getMonth()]

        // Récupérer les revenus pour ce mois
        const revenueResult = await db
            .select({
                total: sql<number>`COALESCE(SUM(${journalEntryLine.credit}), 0)`
            })
            .from(journalEntryLine)
            .innerJoin(journalEntry, eq(journalEntryLine.journalEntryId, journalEntry.id))
            .innerJoin(chartOfAccounts, eq(journalEntryLine.accountId, chartOfAccounts.id))
            .where(
                and(
                    eq(chartOfAccounts.type, 'revenue'),
                    eq(journalEntry.isPosted, true),
                    gte(journalEntry.date, startOfMonth),
                    lte(journalEntry.date, endOfMonth)
                )
            )

        monthsData.push({
            month: monthName,
            revenue: revenueResult[0]?.total || 0
        })
    }

    return monthsData
}

// Activités récentes comptables
export async function getRecentAccountingActivities(companyId: string, limit: number = 10) {
    // Récupérer les dernières factures
    const recentInvoices = await db
        .select({
            id: invoice.id,
            type: sql<string>`'invoice'`,
            description: sql<string>`CONCAT('Facture #', ${invoice.number})`,
            amount: invoice.total,
            date: invoice.createdAt,
            status: invoice.status,
        })
        .from(invoice)
        .where(eq(invoice.companyId, companyId))
        .orderBy(desc(invoice.createdAt))
        .limit(limit / 2)

    // Récupérer les derniers paiements
    const recentPayments = await db
        .select({
            id: payment.id,
            type: sql<string>`'payment'`,
            description: sql<string>`CONCAT('Paiement - ', ${payment.reference})`,
            amount: payment.amount,
            date: payment.paymentDate,
            status: sql<string>`'completed'`,
        })
        .from(payment)
        .where(eq(payment.companyId, companyId))
        .orderBy(desc(payment.paymentDate))
        .limit(limit / 2)

    // Combiner et trier par date
    const allActivities = [...recentInvoices, ...recentPayments]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit)

    return allActivities.map(activity => ({
        id: activity.id,
        type: activity.type as 'invoice' | 'payment',
        description: activity.description,
        amount: activity.amount,
        date: activity.date,
        status: activity.status as 'paid' | 'pending' | 'completed'
    }))
} 
"use server"

import { useMutation } from "@/lib/safe-action";
import { z } from "zod";
import { ActionError } from "@/lib/safe-action";
import { getUserWithCompany } from "@/db/queries/company";
import {
    getChartOfAccounts,
    getFiscalYears,
    getAccountingStats
} from "@/db/queries/accounting";
import { db } from "@/lib/drizzle";
import {
    chartOfAccounts,
    journalEntry,
    journalEntryLine,
    fiscalYear as fiscalYearTable,
    invoice,
    payment,
    client,
    supplier,
    expenseCategory
} from "@/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

// Schémas pour les paramètres
const generateReportSchema = z.object({
    type: z.enum(['balance_sheet', 'income_statement', 'cash_flow', 'trial_balance']),
    fiscalYearId: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    format: z.enum(['pdf', 'excel', 'csv']).default('pdf')
});

// Types pour les rapports
interface BalanceSheetData {
    type: 'balance_sheet';
    date: Date;
    assets: {
        current: { name: string; amount: number }[];
        nonCurrent: { name: string; amount: number }[];
        totalAssets: number;
    };
    liabilities: {
        current: { name: string; amount: number }[];
        nonCurrent: { name: string; amount: number }[];
        totalLiabilities: number;
    };
    equity: {
        items: { name: string; amount: number }[];
        totalEquity: number;
    };
    totalLiabilitiesAndEquity: number;
}

interface IncomeStatementData {
    type: 'income_statement';
    startDate: Date;
    endDate: Date;
    revenue: {
        items: { name: string; amount: number }[];
        totalRevenue: number;
    };
    expenses: {
        items: { name: string; amount: number }[];
        totalExpenses: number;
    };
    netIncome: number;
}

interface CashFlowData {
    type: 'cash_flow';
    startDate: Date;
    endDate: Date;
    operating: {
        inflows: { name: string; amount: number }[];
        outflows: { name: string; amount: number }[];
        netOperating: number;
    };
    investing: {
        inflows: { name: string; amount: number }[];
        outflows: { name: string; amount: number }[];
        netInvesting: number;
    };
    financing: {
        inflows: { name: string; amount: number }[];
        outflows: { name: string; amount: number }[];
        netFinancing: number;
    };
    netCashFlow: number;
}

interface TrialBalanceData {
    type: 'trial_balance';
    startDate: Date;
    endDate: Date;
    accounts: {
        code: string;
        name: string;
        debit: number;
        credit: number;
        balance: number;
    }[];
    totalDebits: number;
    totalCredits: number;
    isBalanced: boolean;
}

// Fonction pour obtenir les dates d'un exercice fiscal
async function getFiscalYearDates(fiscalYearId: string, companyId: string) {
    const fiscalYear = await db
        .select()
        .from(fiscalYearTable)
        .where(
            and(
                eq(fiscalYearTable.id, fiscalYearId),
                eq(fiscalYearTable.companyId, companyId)
            )
        )
        .limit(1);

    if (!fiscalYear[0]) {
        throw new ActionError("Exercice fiscal non trouvé");
    }

    return {
        startDate: fiscalYear[0].startDate,
        endDate: fiscalYear[0].endDate
    };
}

// Fonction pour générer un bilan comptable
async function generateBalanceSheet(
    companyId: string,
    date: Date
): Promise<BalanceSheetData> {
    const accounts = await getChartOfAccounts(companyId);

    const assets = accounts.filter(acc => acc.type === 'asset');
    const liabilities = accounts.filter(acc => acc.type === 'liability');
    const equity = accounts.filter(acc => acc.type === 'equity');

    const assetItems = assets.map(acc => ({ name: acc.name, amount: acc.balance }));
    const liabilityItems = liabilities.map(acc => ({ name: acc.name, amount: acc.balance }));
    const equityItems = equity.map(acc => ({ name: acc.name, amount: acc.balance }));

    const totalAssets = assetItems.reduce((sum, item) => sum + item.amount, 0);
    const totalLiabilities = liabilityItems.reduce((sum, item) => sum + item.amount, 0);
    const totalEquity = equityItems.reduce((sum, item) => sum + item.amount, 0);

    return {
        type: 'balance_sheet',
        date,
        assets: {
            current: assetItems,
            nonCurrent: [],
            totalAssets
        },
        liabilities: {
            current: liabilityItems,
            nonCurrent: [],
            totalLiabilities
        },
        equity: {
            items: equityItems,
            totalEquity
        },
        totalLiabilitiesAndEquity: totalLiabilities + totalEquity
    };
}

// Fonction pour générer un compte de résultat
async function generateIncomeStatement(
    companyId: string,
    startDate: Date,
    endDate: Date
): Promise<IncomeStatementData> {
    // Récupérer les revenus
    const revenueResult = await db
        .select({
            accountName: chartOfAccounts.name,
            amount: sql<number>`COALESCE(SUM(${journalEntryLine.credit} - ${journalEntryLine.debit}), 0)`
        })
        .from(journalEntryLine)
        .innerJoin(journalEntry, eq(journalEntryLine.journalEntryId, journalEntry.id))
        .innerJoin(chartOfAccounts, eq(journalEntryLine.accountId, chartOfAccounts.id))
        .where(
            and(
                eq(chartOfAccounts.type, 'revenue'),
                eq(journalEntry.isPosted, true),
                eq(journalEntry.companyId, companyId),
                gte(journalEntry.date, startDate),
                lte(journalEntry.date, endDate)
            )
        )
        .groupBy(chartOfAccounts.name);

    // Récupérer les dépenses
    const expenseResult = await db
        .select({
            accountName: chartOfAccounts.name,
            amount: sql<number>`COALESCE(SUM(${journalEntryLine.debit} - ${journalEntryLine.credit}), 0)`
        })
        .from(journalEntryLine)
        .innerJoin(journalEntry, eq(journalEntryLine.journalEntryId, journalEntry.id))
        .innerJoin(chartOfAccounts, eq(journalEntryLine.accountId, chartOfAccounts.id))
        .where(
            and(
                eq(chartOfAccounts.type, 'expense'),
                eq(journalEntry.isPosted, true),
                eq(journalEntry.companyId, companyId),
                gte(journalEntry.date, startDate),
                lte(journalEntry.date, endDate)
            )
        )
        .groupBy(chartOfAccounts.name);

    const revenueItems = revenueResult.map(item => ({
        name: item.accountName,
        amount: item.amount
    }));

    const expenseItems = expenseResult.map(item => ({
        name: item.accountName,
        amount: item.amount
    }));

    const totalRevenue = revenueItems.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = expenseItems.reduce((sum, item) => sum + item.amount, 0);

    return {
        type: 'income_statement',
        startDate,
        endDate,
        revenue: {
            items: revenueItems,
            totalRevenue
        },
        expenses: {
            items: expenseItems,
            totalExpenses
        },
        netIncome: totalRevenue - totalExpenses
    };
}

// Fonction pour générer un tableau des flux de trésorerie
async function generateCashFlow(
    companyId: string,
    startDate: Date,
    endDate: Date
): Promise<CashFlowData> {
    // Récupérer les encaissements clients
    const incomingPayments = await db
        .select({
            amount: sql<number>`COALESCE(SUM(${payment.amount}), 0)`
        })
        .from(payment)
        .where(
            and(
                eq(payment.companyId, companyId),
                eq(payment.type, 'incoming'),
                gte(payment.paymentDate, startDate),
                lte(payment.paymentDate, endDate)
            )
        );

    // Récupérer les décaissements fournisseurs
    const outgoingPayments = await db
        .select({
            amount: sql<number>`COALESCE(SUM(${payment.amount}), 0)`
        })
        .from(payment)
        .where(
            and(
                eq(payment.companyId, companyId),
                eq(payment.type, 'outgoing'),
                gte(payment.paymentDate, startDate),
                lte(payment.paymentDate, endDate)
            )
        );

    const totalIncoming = incomingPayments[0]?.amount || 0;
    const totalOutgoing = outgoingPayments[0]?.amount || 0;

    return {
        type: 'cash_flow',
        startDate,
        endDate,
        operating: {
            inflows: [{ name: 'Encaissements clients', amount: totalIncoming }],
            outflows: [{ name: 'Décaissements fournisseurs', amount: totalOutgoing }],
            netOperating: totalIncoming - totalOutgoing
        },
        investing: {
            inflows: [],
            outflows: [],
            netInvesting: 0
        },
        financing: {
            inflows: [],
            outflows: [],
            netFinancing: 0
        },
        netCashFlow: totalIncoming - totalOutgoing
    };
}

// Fonction pour générer une balance de vérification
async function generateTrialBalance(
    companyId: string,
    startDate: Date,
    endDate: Date
): Promise<TrialBalanceData> {
    const balanceResult = await db
        .select({
            accountCode: chartOfAccounts.code,
            accountName: chartOfAccounts.name,
            totalDebit: sql<number>`COALESCE(SUM(${journalEntryLine.debit}), 0)`,
            totalCredit: sql<number>`COALESCE(SUM(${journalEntryLine.credit}), 0)`
        })
        .from(journalEntryLine)
        .innerJoin(journalEntry, eq(journalEntryLine.journalEntryId, journalEntry.id))
        .innerJoin(chartOfAccounts, eq(journalEntryLine.accountId, chartOfAccounts.id))
        .where(
            and(
                eq(journalEntry.companyId, companyId),
                eq(journalEntry.isPosted, true),
                gte(journalEntry.date, startDate),
                lte(journalEntry.date, endDate)
            )
        )
        .groupBy(chartOfAccounts.code, chartOfAccounts.name)
        .orderBy(chartOfAccounts.code);

    const accounts = balanceResult.map(row => ({
        code: row.accountCode,
        name: row.accountName,
        debit: row.totalDebit,
        credit: row.totalCredit,
        balance: row.totalDebit - row.totalCredit
    }));

    const totalDebits = accounts.reduce((sum, acc) => sum + acc.debit, 0);
    const totalCredits = accounts.reduce((sum, acc) => sum + acc.credit, 0);

    return {
        type: 'trial_balance',
        startDate,
        endDate,
        accounts,
        totalDebits,
        totalCredits,
        isBalanced: Math.abs(totalDebits - totalCredits) < 0.01
    };
}

// Action pour générer un rapport
export const generateReportAction = useMutation(
    generateReportSchema,
    async (input, { userId }) => {
        const userWithCompany = await getUserWithCompany(userId);
        const companyId = userWithCompany.company?.id;

        if (!companyId) {
            throw new ActionError("Entreprise non trouvée");
        }

        let startDate: Date;
        let endDate: Date;

        // Déterminer les dates
        if (input.startDate && input.endDate) {
            startDate = new Date(input.startDate);
            endDate = new Date(input.endDate);
        } else if (input.fiscalYearId) {
            const dates = await getFiscalYearDates(input.fiscalYearId, companyId);
            startDate = dates.startDate;
            endDate = dates.endDate;
        } else {
            // Par défaut, prendre l'année en cours
            const now = new Date();
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31);
        }

        let reportData: BalanceSheetData | IncomeStatementData | CashFlowData | TrialBalanceData;

        switch (input.type) {
            case 'balance_sheet':
                reportData = await generateBalanceSheet(companyId, endDate);
                break;
            case 'income_statement':
                reportData = await generateIncomeStatement(companyId, startDate, endDate);
                break;
            case 'cash_flow':
                reportData = await generateCashFlow(companyId, startDate, endDate);
                break;
            case 'trial_balance':
                reportData = await generateTrialBalance(companyId, startDate, endDate);
                break;
            default:
                throw new ActionError("Type de rapport non supporté");
        }

        return {
            success: true,
            data: reportData,
            message: `Rapport ${input.type} généré avec succès`
        };
    }
);

// Action pour récupérer les exercices fiscaux
export const getFiscalYearsAction = useMutation(
    z.object({}),
    async (input, { userId }) => {
        const userWithCompany = await getUserWithCompany(userId);
        const companyId = userWithCompany.company?.id;

        if (!companyId) {
            throw new ActionError("Entreprise non trouvée");
        }

        const fiscalYears = await getFiscalYears(companyId);

        return {
            success: true,
            data: fiscalYears
        };
    }
);

// Action pour récupérer les statistiques
export const getReportStatsAction = useMutation(
    z.object({
        fiscalYearId: z.string().optional()
    }),
    async (input, { userId }) => {
        const userWithCompany = await getUserWithCompany(userId);
        const companyId = userWithCompany.company?.id;

        if (!companyId) {
            throw new ActionError("Entreprise non trouvée");
        }

        const stats = await getAccountingStats(companyId);

        return {
            success: true,
            data: stats
        };
    }
); 
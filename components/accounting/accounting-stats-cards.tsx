"use client"

import { IconCash, IconCreditCard, IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { LedgerStats, type LedgerStat } from "@/components/ledger"
import { formatCurrency } from "@/lib/utils"

interface AccountingStatsCardsProps {
    stats?: {
        revenue: { current: number; change: number }
        expenses: { current: number; change: number }
        netIncome: { current: number; change: number }
        pendingPayments: { current: number; change: number }
    } | null
}

export function AccountingStatsCards({ stats }: AccountingStatsCardsProps) {
    const s = stats ?? {
        revenue: { current: 0, change: 0 },
        expenses: { current: 0, change: 0 },
        netIncome: { current: 0, change: 0 },
        pendingPayments: { current: 0, change: 0 },
    }

    // Une variation nulle n'apporte rien : on ne l'affiche que si elle existe.
    const change = (value: number) => (stats && value !== 0 ? value : null)

    const items: LedgerStat[] = [
        {
            label: "Chiffre d'affaires",
            value: formatCurrency(s.revenue.current, "EUR"),
            detail: "Ce mois, écritures validées",
            icon: IconTrendingUp,
            delta: change(s.revenue.change),
        },
        {
            label: "Dépenses",
            value: formatCurrency(s.expenses.current, "EUR"),
            detail: "Ce mois, écritures validées",
            icon: IconTrendingDown,
            delta: change(s.expenses.change),
        },
        {
            label: "Résultat net",
            value: formatCurrency(s.netIncome.current, "EUR"),
            detail: "Produits moins charges",
            icon: IconCash,
            tone: s.netIncome.current < 0 ? "destructive" : undefined,
            delta: change(s.netIncome.change),
        },
        {
            label: "À encaisser",
            value: formatCurrency(s.pendingPayments.current, "EUR"),
            detail: "Factures envoyées arrivées à échéance",
            icon: IconCreditCard,
            tone: s.pendingPayments.current > 0 ? "warning" : undefined,
        },
    ]

    return <LedgerStats items={items} />
}

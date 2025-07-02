"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    IconTrendingUp,
    IconTrendingDown,
    IconCash,
    IconCreditCard,
    IconReportMoney,
    IconCalculator
} from "@tabler/icons-react"

interface AccountingStatsCardsProps {
    stats?: {
        revenue: { current: number; change: number }
        expenses: { current: number; change: number }
        netIncome: { current: number; change: number }
        pendingPayments: { current: number; change: number }
    } | null
}

export function AccountingStatsCards({ stats }: AccountingStatsCardsProps) {
    // Données par défaut si pas de stats
    const defaultStats = [
        {
            title: "Chiffre d'affaires",
            value: "€0",
            change: "0%",
            trend: "up" as const,
            icon: IconTrendingUp,
            description: "vs mois dernier"
        },
        {
            title: "Dépenses",
            value: "€0",
            change: "0%",
            trend: "down" as const,
            icon: IconTrendingDown,
            description: "vs mois dernier"
        },
        {
            title: "Bénéfice net",
            value: "€0",
            change: "0%",
            trend: "up" as const,
            icon: IconCash,
            description: "vs mois dernier"
        },
        {
            title: "Paiements en attente",
            value: "€0",
            change: "0%",
            trend: "down" as const,
            icon: IconCreditCard,
            description: "vs mois dernier"
        }
    ]

    const displayStats = stats ? [
        {
            title: "Chiffre d'affaires",
            value: `€${stats.revenue.current.toLocaleString('fr-FR')}`,
            change: `${stats.revenue.change >= 0 ? '+' : ''}${stats.revenue.change.toFixed(1)}%`,
            trend: stats.revenue.change >= 0 ? "up" as const : "down" as const,
            icon: IconTrendingUp,
            description: "vs mois dernier"
        },
        {
            title: "Dépenses",
            value: `€${stats.expenses.current.toLocaleString('fr-FR')}`,
            change: `${stats.expenses.change >= 0 ? '+' : ''}${stats.expenses.change.toFixed(1)}%`,
            trend: stats.expenses.change >= 0 ? "down" as const : "up" as const,
            icon: IconTrendingDown,
            description: "vs mois dernier"
        },
        {
            title: "Bénéfice net",
            value: `€${stats.netIncome.current.toLocaleString('fr-FR')}`,
            change: `${stats.netIncome.change >= 0 ? '+' : ''}${stats.netIncome.change.toFixed(1)}%`,
            trend: stats.netIncome.change >= 0 ? "up" as const : "down" as const,
            icon: IconCash,
            description: "vs mois dernier"
        },
        {
            title: "Paiements en attente",
            value: `€${stats.pendingPayments.current.toLocaleString('fr-FR')}`,
            change: `${stats.pendingPayments.change >= 0 ? '+' : ''}${stats.pendingPayments.change.toFixed(1)}%`,
            trend: stats.pendingPayments.change >= 0 ? "down" as const : "up" as const,
            icon: IconCreditCard,
            description: "vs mois dernier"
        }
    ] : defaultStats

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {displayStats.map((stat) => (
                <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {stat.title}
                        </CardTitle>
                        <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <span className={stat.trend === "up" ? "text-green-600" : "text-red-600"}>
                                {stat.change}
                            </span>
                            {stat.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
} 
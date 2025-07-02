"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    IconTrendingUp,
    IconTrendingDown,
    IconCash,
    IconCreditCard,
    IconFileInvoice,
    IconReceipt
} from "@tabler/icons-react"

interface AccountingOverviewProps {
    stats?: {
        revenue: { current: number; change: number }
        expenses: { current: number; change: number }
        netIncome: { current: number; change: number }
        pendingPayments: { current: number; change: number }
    } | null
}

export function AccountingOverview({ stats }: AccountingOverviewProps) {
    // Données fictives pour l'instant (à remplacer par de vraies données d'activités)
    const recentActivities = [
        {
            id: 1,
            type: "invoice" as const,
            description: "Facture #2024-001 payée",
            amount: 1200,
            date: "2024-01-15",
            status: "paid" as const,
            icon: IconReceipt
        },
        {
            id: 2,
            type: "payment" as const,
            description: "Paiement reçu - Client ABC",
            amount: 850,
            date: "2024-01-14",
            status: "completed" as const,
            icon: IconCash
        },
        {
            id: 3,
            type: "expense" as const,
            description: "Achat fournitures",
            amount: -150,
            date: "2024-01-13",
            status: "completed" as const,
            icon: IconCreditCard
        },
        {
            id: 4,
            type: "invoice" as const,
            description: "Facture #2024-002 créée",
            amount: 2300,
            date: "2024-01-12",
            status: "pending" as const,
            icon: IconFileInvoice
        },
        {
            id: 5,
            type: "payment" as const,
            description: "Paiement en attente - Client XYZ",
            amount: 950,
            date: "2024-01-11",
            status: "pending" as const,
            icon: IconCash
        }
    ]

    const getStatusColor = (status: "paid" | "pending" | "completed") => {
        switch (status) {
            case "paid":
            case "completed":
                return "bg-green-100 text-green-800"
            case "pending":
                return "bg-yellow-100 text-yellow-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const formatAmount = (amount: number) => {
        const sign = amount >= 0 ? "+" : ""
        return `${sign}€${Math.abs(amount).toLocaleString()}`
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Graphique des revenus */}
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Évolution des revenus</CardTitle>
                    {stats && (
                        <p className="text-sm text-muted-foreground">
                            Chiffre d'affaires actuel: €{stats.revenue.current.toLocaleString('fr-FR')}
                            {stats.revenue.change !== 0 && (
                                <span className={`ml-2 ${stats.revenue.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {stats.revenue.change >= 0 ? '+' : ''}{stats.revenue.change.toFixed(1)}%
                                </span>
                            )}
                        </p>
                    )}
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-lg">
                        <div className="text-center text-muted-foreground">
                            <IconTrendingUp className="h-8 w-8 mx-auto mb-2" />
                            <p>Graphique des revenus</p>
                            <p className="text-sm">Intégration avec une librairie de graphiques</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Activités récentes */}
            <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>Activités récentes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-center space-x-4">
                                <div className="p-2 bg-muted rounded-lg">
                                    <activity.icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {activity.description}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(activity.date).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium">
                                        {formatAmount(activity.amount)}
                                    </p>
                                    <Badge
                                        variant="secondary"
                                        className={`text-xs ${getStatusColor(activity.status)}`}
                                    >
                                        {activity.status === "paid" ? "Payé" :
                                            activity.status === "pending" ? "En attente" :
                                                "Terminé"}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 
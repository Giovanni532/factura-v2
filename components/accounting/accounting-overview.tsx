"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    IconTrendingUp,
    IconFileInvoice,
    IconReceipt
} from "@tabler/icons-react"
import { RevenueChart } from "./charts"

interface AccountingOverviewProps {
    stats?: {
        revenue: { current: number; change: number }
        expenses: { current: number; change: number }
        netIncome: { current: number; change: number }
        pendingPayments: { current: number; change: number }
    } | null
    revenueHistory?: { month: string; revenue: number }[]
    recentActivities?: {
        id: string
        type: 'invoice' | 'payment'
        description: string
        amount: number
        date: Date
        status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'accepted' | 'rejected' | 'expired' | 'converted'
    }[]
}

export function AccountingOverview({ stats, revenueHistory, recentActivities }: AccountingOverviewProps) {
    // Données par défaut si pas d'activités
    const defaultActivities = [
        {
            id: "1",
            type: "invoice" as const,
            description: "Aucune activité récente",
            amount: 0,
            date: new Date(),
            status: "draft" as const,
        }
    ]

    const displayActivities = recentActivities || defaultActivities

    const getStatusColor = (status: "draft" | "sent" | "paid" | "overdue" | "cancelled" | "accepted" | "rejected" | "expired" | "converted") => {
        switch (status) {
            case "paid":
            case "accepted":
                return "bg-success/10 text-success"
            case "sent":
                return "bg-warning/10 text-warning"
            case "draft":
                return "bg-muted text-foreground"
            case "cancelled":
                return "bg-destructive/10 text-destructive"
            case "rejected":
                return "bg-destructive/10 text-destructive"
            case "expired":
                return "bg-destructive/10 text-destructive"
            case "converted":
                return "bg-success/10 text-success"
            case "overdue":
                return "bg-destructive/10 text-destructive"
            default:
                return (status as string) === "completed" ? "bg-success/10 text-success" : "bg-muted text-foreground"
        }
    }

    const getStatusLabel = (status: "draft" | "sent" | "paid" | "overdue" | "cancelled" | "accepted" | "rejected" | "expired" | "converted") => {
        switch (status) {
            case "paid":
                return "Payé"
            case "sent":
                return "En attente"
            case "accepted":
                return "Terminé"
            case "draft":
                return "Brouillon"
            case "cancelled":
                return "Annulé"
            case "rejected":
                return "Rejeté"
            case "expired":
                return "Expiré"
            case "converted":
                return "Converti"
            case "overdue":
                return "En retard"
            default:
                // Les paiements remontent avec le statut « completed »
                return (status as string) === "completed" ? "Réglé" : status
        }
    }

    const getActivityIcon = (type: 'invoice' | 'payment') => {
        return type === 'invoice' ? IconFileInvoice : IconReceipt
    }

    // Montant signé au format français : « +2 594,40 € »
    const formatAmount = (amount: number) => {
        const formatted = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Math.abs(amount))
        return `${amount >= 0 ? "+" : "−"}${formatted}`
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Graphique des revenus */}
            <Card className="col-span-4">
                {revenueHistory && stats ? (
                    <RevenueChart
                        data={revenueHistory}
                        currentRevenue={stats.revenue.current}
                        change={stats.revenue.change}
                        title="Évolution des revenus"
                        description="Chiffre d'affaires mensuel"
                    />
                ) : (
                    <>
                        <CardHeader>
                            <CardTitle>Évolution des revenus</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Chargement des données...
                            </p>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-lg">
                                <div className="text-center text-muted-foreground">
                                    <IconTrendingUp className="h-8 w-8 mx-auto mb-2" />
                                    <p>Chargement du graphique...</p>
                                </div>
                            </div>
                        </CardContent>
                    </>
                )}
            </Card>

            {/* Activités récentes */}
            <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>Activités récentes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {displayActivities.map((activity) => {
                            const ActivityIcon = getActivityIcon(activity.type)
                            return (
                                <div key={activity.id} className="flex items-center space-x-4">
                                    <div className="p-2 bg-muted rounded-lg">
                                        <ActivityIcon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {/* « Paiement - » quand la référence est vide */}
                                            {activity.description.replace(/\s*-\s*$/, "")}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(activity.date).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono text-[13px] font-medium tabular-nums">
                                            {formatAmount(activity.amount)}
                                        </p>
                                        <Badge
                                            variant="secondary"
                                            className={`text-xs ${getStatusColor(activity.status)}`}
                                        >
                                            {getStatusLabel(activity.status)}
                                        </Badge>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 
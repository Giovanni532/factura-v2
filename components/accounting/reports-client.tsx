"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    IconDownload,
    IconEye,
    IconChartBar,
    IconReportMoney,
    IconCalculator,
    IconTrendingUp,
    IconCalendar,
    IconFileText
} from "@tabler/icons-react"

interface ReportsClientProps {
    stats?: {
        revenue: { current: number; change: number }
        expenses: { current: number; change: number }
        netIncome: { current: number; change: number }
        pendingPayments: { current: number; change: number }
    } | null
}

interface Report {
    id: string
    name: string
    description: string
    type: "balance_sheet" | "income_statement" | "cash_flow" | "trial_balance"
    period: string
    lastGenerated: string
    icon: any
}

export function ReportsClient({ stats }: ReportsClientProps) {
    const [selectedPeriod, setSelectedPeriod] = useState("2024")

    const reports: Report[] = [
        {
            id: "1",
            name: "Bilan",
            description: "Situation financière à une date donnée",
            type: "balance_sheet",
            period: "2024",
            lastGenerated: "2024-01-15",
            icon: IconReportMoney
        },
        {
            id: "2",
            name: "Compte de résultat",
            description: "Résultat de l'exercice",
            type: "income_statement",
            period: "2024",
            lastGenerated: "2024-01-15",
            icon: IconCalculator
        },
        {
            id: "3",
            name: "Tableau de flux de trésorerie",
            description: "Évolution de la trésorerie",
            type: "cash_flow",
            period: "2024",
            lastGenerated: "2024-01-14",
            icon: IconTrendingUp
        },
        {
            id: "4",
            name: "Balance de vérification",
            description: "Vérification des soldes comptables",
            type: "trial_balance",
            period: "2024",
            lastGenerated: "2024-01-13",
            icon: IconChartBar
        }
    ]

    const getReportTypeLabel = (type: Report["type"]) => {
        switch (type) {
            case "balance_sheet":
                return "Bilan"
            case "income_statement":
                return "Compte de résultat"
            case "cash_flow":
                return "Flux de trésorerie"
            case "trial_balance":
                return "Balance"
            default:
                return type
        }
    }

    return (
        <div className="space-y-6">
            {/* Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2024">2024</SelectItem>
                            <SelectItem value="2023">2023</SelectItem>
                            <SelectItem value="2022">2022</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button>
                    <IconDownload className="h-4 w-4 mr-2" />
                    Exporter tous les rapports
                </Button>
            </div>

            {/* Grille des rapports */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {reports.map((report) => (
                    <Card key={report.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-muted rounded-lg">
                                    <report.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">{report.name}</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        {getReportTypeLabel(report.type)}
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                {report.description}
                            </p>
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                    <IconCalendar className="h-3 w-3" />
                                    <span>Période: {report.period}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                    <IconFileText className="h-3 w-3" />
                                    <span>Dernière génération: {new Date(report.lastGenerated).toLocaleDateString('fr-FR')}</span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm" className="flex-1">
                                    <IconEye className="h-4 w-4 mr-2" />
                                    Voir
                                </Button>
                                <Button variant="outline" size="sm">
                                    <IconDownload className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Rapports rapides */}
            <Card>
                <CardHeader>
                    <CardTitle>Rapports rapides</CardTitle>
                    {stats && (
                        <p className="text-sm text-muted-foreground">
                            Chiffre d'affaires: €{stats.revenue.current.toLocaleString('fr-FR')} |
                            Bénéfice net: €{stats.netIncome.current.toLocaleString('fr-FR')}
                        </p>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Button variant="outline" className="h-20 flex-col space-y-2">
                            <IconChartBar className="h-6 w-6" />
                            <span className="text-sm">Ventes du mois</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex-col space-y-2">
                            <IconTrendingUp className="h-6 w-6" />
                            <span className="text-sm">Évolution CA</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex-col space-y-2">
                            <IconCalculator className="h-6 w-6" />
                            <span className="text-sm">Marge brute</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex-col space-y-2">
                            <IconReportMoney className="h-6 w-6" />
                            <span className="text-sm">Trésorerie</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 
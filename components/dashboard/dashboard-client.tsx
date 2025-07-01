"use client";

import { useState } from "react";
import { StatsCards } from "./stats-cards";
import { RevenueChart, RevenueQuoteAndInvoiceChart } from "./charts";
import { DeadlinesTable } from "./deadlines-table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, FileText, Users } from "lucide-react";

interface DashboardData {
    stats: any;
    charts: any;
    deadlines: any;
}

interface DashboardClientProps {
    initialData: DashboardData;
}

export function DashboardClient({ initialData }: DashboardClientProps) {
    const [stats, setStats] = useState<any>(initialData.stats);
    const [charts, setCharts] = useState<any>(initialData.charts);
    const [deadlines, setDeadlines] = useState<any>(initialData.deadlines);

    if (!stats && !charts && !deadlines) {
        return (
            <div className="space-y-8">
                {/* Skeleton pour les statistiques */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-8 w-8 rounded" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-16 mb-2" />
                                <Skeleton className="h-3 w-20" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Skeleton pour les graphiques */}
                <div className="grid gap-6 md:grid-cols-2">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-48 mb-2" />
                                <Skeleton className="h-4 w-64" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-[350px] w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {stats && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold">Statistiques</h2>
                    <StatsCards stats={stats} />
                </div>
            )}
            {/* Graphiques */}
            {charts && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold">Analyses</h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Préparation des données pour les deux charts */}
                        {(() => {
                            // On suppose que charts.monthlyInvoices et charts.monthlyQuotes sont ordonnés par mois croissant
                            const months = Array.from(new Set([
                                ...(charts.monthlyInvoices?.map((i: any) => i.month) || []),
                                ...(charts.monthlyQuotes?.map((q: any) => q.month) || []),
                            ])).sort();

                            // Pour le bar chart (RevenueQuoteAndInvoiceChart)
                            const revenueBarData = months.map((month) => {
                                const inv = charts.monthlyInvoices?.find((i: any) => i.month === month) || {};
                                const qte = charts.monthlyQuotes?.find((q: any) => q.month === month) || {};
                                return {
                                    date: month, // ou formater en nom de mois si besoin
                                    running: Number(inv.revenue) || 0, // revenus factures
                                    swimming: Number(qte.accepted) || 0, // nombre de devis acceptés (ou revenus devis si dispo)
                                };
                            });

                            // Pour le line chart (RevenueChart)
                            const revenueLineData = months.map((month) => {
                                const inv = charts.monthlyInvoices?.find((i: any) => i.month === month) || {};
                                const qte = charts.monthlyQuotes?.find((q: any) => q.month === month) || {};
                                // On affiche le nom du mois (ex: "Janvier")
                                const monthName = new Date(month + "-01").toLocaleString("fr-FR", { month: "long" });
                                return {
                                    month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
                                    desktop: Number(inv.invoices) || 0, // nombre de factures
                                    mobile: Number(qte.quotes) || 0, // nombre de devis
                                };
                            });

                            return (
                                <>
                                    <RevenueQuoteAndInvoiceChart charts={{ revenue: revenueBarData }} />
                                    <RevenueChart charts={revenueLineData} />
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* Tableau des échéances */}
            {deadlines && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold">Suivi</h2>
                    <DeadlinesTable deadlines={deadlines} />
                </div>
            )}

            {/* Actions rapides */}
            <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Actions rapides</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <div className="font-medium">Nouvelle facture</div>
                                    <div className="text-sm text-muted-foreground">Créer une facture</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                                    <FileText className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <div className="font-medium">Nouveau devis</div>
                                    <div className="text-sm text-muted-foreground">Créer un devis</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                                    <Users className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <div className="font-medium">Nouveau client</div>
                                    <div className="text-sm text-muted-foreground">Ajouter un client</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <div className="font-medium">Rapports</div>
                                    <div className="text-sm text-muted-foreground">Voir les analyses</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 
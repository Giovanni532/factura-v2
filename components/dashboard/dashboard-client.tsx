"use client";

import { StatsCards } from "./stats-cards";
import { RevenueChart, RevenueQuoteAndInvoiceChart } from "./charts";
import { DeadlinesTable } from "./deadlines-table";
import { FileText, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { paths } from "@/paths";

interface DashboardData {
    stats: any;
    charts: any;
    deadlines: any;
}

interface DashboardClientProps {
    initialData: DashboardData;
}

export function DashboardClient({ initialData }: DashboardClientProps) {

    return (
        <div className="space-y-8">
            {initialData.stats && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold">Statistiques</h2>
                    <StatsCards stats={initialData.stats} />
                </div>
            )}
            {/* Graphiques */}
            {initialData.charts && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold">Analyses</h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Préparation des données pour les deux charts */}
                        {(() => {
                            // Pour le bar chart - on utilise les données de bénéfices
                            const benefitMonths = Array.from(new Set([
                                ...(initialData.charts.monthlyBenefits?.map((b: any) => b.month) || []),
                            ])).sort();

                            // Pour le line chart - on combine les mois des factures et devis
                            const activityMonths = Array.from(new Set([
                                ...(initialData.charts.monthlyInvoices?.map((i: any) => i.month) || []),
                                ...(initialData.charts.monthlyQuotes?.map((q: any) => q.month) || []),
                            ])).sort();

                            // Pour le bar chart (RevenueQuoteAndInvoiceChart) - Chiffre d'affaires
                            const revenueBarData = benefitMonths.map((month) => {
                                const benefit = initialData.charts.monthlyBenefits?.find((b: any) => b.month === month) || {};
                                // On affiche le nom du mois (ex: "Janvier")
                                const monthName = new Date(month + "-01").toLocaleString("fr-FR", { month: "long" });
                                return {
                                    month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
                                    benefice: Number(benefit.benefice) || 0, // chiffre d'affaires des factures payées
                                };
                            });

                            // Pour le line chart (RevenueChart) - Volume d'activité (factures et devis)
                            const revenueLineData = activityMonths.map((month) => {
                                const inv = initialData.charts.monthlyInvoices?.find((i: any) => i.month === month) || {};
                                const qte = initialData.charts.monthlyQuotes?.find((q: any) => q.month === month) || {};
                                // On affiche le nom du mois (ex: "Janvier")
                                const monthName = new Date(month + "-01").toLocaleString("fr-FR", { month: "long" });
                                return {
                                    month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
                                    invoice: Number(inv.invoices) || 0, // nombre de factures
                                    quote: Number(qte.quotes) || 0, // nombre de devis
                                };
                            });

                            return (
                                <>
                                    <RevenueQuoteAndInvoiceChart charts={revenueBarData} />
                                    <RevenueChart charts={revenueLineData} />
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* Tableau des échéances */}
            {initialData.deadlines && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold">Suivi</h2>
                    <DeadlinesTable deadlines={initialData.deadlines} />
                </div>
            )}

            {/* Actions rapides */}
            <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Actions rapides</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Button variant="outline" className="w-full h-24" asChild>
                        <Link href={paths.invoices.list + "?new=true"}>
                            <div className="flex items-center gap-3 w-full h-full">
                                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="flex flex-col items-start w-full">
                                    <div className="font-medium">Nouvelle facture</div>
                                    <div className="text-sm text-muted-foreground">Créer une facture</div>
                                </div>
                            </div>
                        </Link>
                    </Button>

                    <Button variant="outline" className="w-full h-24" asChild>
                        <Link href={paths.quotes.list + "?new=true"}>
                            <div className="flex items-center gap-3 w-full h-full">
                                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                                    <FileText className="h-5 w-5 text-purple-600" />
                                </div>
                                <div className="flex flex-col items-start w-full">
                                    <div className="font-medium">Nouveau devis</div>
                                    <div className="text-sm text-muted-foreground">Créer un devis</div>
                                </div>
                            </div>
                        </Link>
                    </Button>

                    <Button variant="outline" className="w-full h-24" asChild>
                        <Link href={paths.clients.list + "?new=true"}>
                            <div className="flex items-center gap-3 w-full h-full">
                                <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                                    <Users className="h-5 w-5 text-orange-600" />
                                </div>
                                <div className="flex flex-col items-start w-full">
                                    <div className="font-medium">Nouveau client</div>
                                    <div className="text-sm text-muted-foreground">Ajouter un client</div>
                                </div>
                            </div>
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
} 
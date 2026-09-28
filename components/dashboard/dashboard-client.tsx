"use client";

import Link from "next/link";
import { ArrowRight, FileText, Receipt, UserPlus } from "lucide-react";
import { StatsCards } from "./stats-cards";
import { RevenueChart, RevenueQuoteAndInvoiceChart } from "./charts";
import { DeadlinesTable } from "./deadlines-table";
import { paths } from "@/paths";

interface DashboardData {
    stats: any;
    charts: any;
    deadlines: any;
}

interface DashboardClientProps {
    initialData: DashboardData;
}

// Les 6 derniers mois au format "YYYY-MM", du plus ancien au plus récent :
// un mois sans activité reste affiché à zéro plutôt que de disparaître.
function lastSixMonths() {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    });
}

// Abréviations sans ambiguïté (juin ≠ juillet) : « Juin », « Juil. », « Sept. »
function monthLabel(month: string) {
    const name = new Date(`${month}-01T00:00:00`).toLocaleString("fr-FR", { month: "short" });
    return name.charAt(0).toUpperCase() + name.slice(1);
}

const QUICK_ACTIONS = [
    { href: `${paths.invoices.list}?new=true`, label: "Nouvelle facture", hint: "Émettre et envoyer", icon: Receipt },
    { href: `${paths.quotes.list}?new=true`, label: "Nouveau devis", hint: "Chiffrer une prestation", icon: FileText },
    { href: `${paths.clients.list}?new=true`, label: "Nouveau client", hint: "Ajouter au registre", icon: UserPlus },
];

export function DashboardClient({ initialData }: DashboardClientProps) {
    const { stats, charts, deadlines } = initialData;
    const months = lastSixMonths();

    const revenueBarData = months.map((month) => ({
        month: monthLabel(month),
        benefice: Number(charts?.monthlyBenefits?.find((b: any) => b.month === month)?.benefice) || 0,
    }));

    const revenueLineData = months.map((month) => ({
        month: monthLabel(month),
        invoice: Number(charts?.monthlyInvoices?.find((i: any) => i.month === month)?.invoices) || 0,
        quote: Number(charts?.monthlyQuotes?.find((q: any) => q.month === month)?.quotes) || 0,
    }));

    return (
        <div className="space-y-6">
            {stats && <StatsCards stats={stats} />}

            {charts && (
                <div className="grid gap-6 lg:grid-cols-2">
                    <RevenueQuoteAndInvoiceChart charts={revenueBarData} />
                    <RevenueChart charts={revenueLineData} />
                </div>
            )}

            <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
                {deadlines && <DeadlinesTable deadlines={deadlines} />}

                <section aria-labelledby="quick-actions" className="rounded-xl border bg-card">
                    <h2 id="quick-actions" className="border-b px-5 py-4 font-semibold">
                        Actions rapides
                    </h2>
                    <ul>
                        {QUICK_ACTIONS.map(({ href, label, hint, icon: Icon }) => (
                            <li key={href} className="border-b last:border-0">
                                <Link
                                    href={href}
                                    className="group flex items-center gap-3 px-5 py-4 transition-colors hover:bg-muted/60"
                                >
                                    <span className="flex size-9 items-center justify-center rounded-md border bg-background">
                                        <Icon className="size-4" />
                                    </span>
                                    <span className="flex-1">
                                        <span className="block text-sm font-medium">{label}</span>
                                        <span className="block text-[13px] text-muted-foreground">{hint}</span>
                                    </span>
                                    <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </div>
    );
}

"use client";

import { FileText, Receipt, Users, Wallet } from "lucide-react";
import { LedgerStats, type LedgerStat } from "@/components/ledger";
import { formatCurrency } from "@/lib/utils";

interface StatsCardsProps {
    stats: {
        invoices: {
            total: number;
            revenue: number;
            paid: number;
            pending: number;
            overdue: number;
            monthly: number;
            monthlyRevenue: number;
            lastMonthRevenue: number;
            lastMonthInvoices: number;
        };
        quotes: {
            total: number;
            accepted: number;
            pending: number;
            expired: number;
            monthly: number;
            lastMonthQuotes: number;
        };
        clients: {
            total: number;
            active: number;
        };
        services: {
            total: number;
            active: number;
        };
    };
}

// Variation en % d'un mois sur l'autre ; null si le mois précédent est vide.
function delta(current: number, previous: number) {
    if (!previous) return null;
    return ((current - previous) / previous) * 100;
}

export function StatsCards({ stats }: StatsCardsProps) {
    const revenueDelta = delta(stats.invoices.monthlyRevenue, stats.invoices.lastMonthRevenue);

    const cells: LedgerStat[] = [
        {
            label: "Montant facturé",
            value: formatCurrency(stats.invoices.revenue, "EUR"),
            detail: `${formatCurrency(stats.invoices.monthlyRevenue, "EUR")} encaissés ce mois`,
            icon: Wallet,
            delta: revenueDelta,
        },
        {
            label: "Factures",
            value: stats.invoices.total.toString(),
            detail: `${stats.invoices.paid} payées · ${stats.invoices.pending} envoyées`,
            icon: Receipt,
            delta: delta(stats.invoices.monthly, stats.invoices.lastMonthInvoices),
        },
        {
            label: "Devis",
            value: stats.quotes.total.toString(),
            detail: `${stats.quotes.accepted} acceptés · ${stats.quotes.pending} en attente`,
            icon: FileText,
            delta: delta(stats.quotes.monthly, stats.quotes.lastMonthQuotes),
        },
        {
            label: "Clients",
            value: stats.clients.total.toString(),
            detail: `${stats.clients.active} nouveaux sur 30 jours`,
            icon: Users,
            delta: null,
        },
    ];

    return <LedgerStats items={cells} />;
}

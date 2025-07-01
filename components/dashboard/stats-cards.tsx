"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    FileText,
    Users,
    Package,
    AlertTriangle,
    CheckCircle
} from "lucide-react";

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
        };
        quotes: {
            total: number;
            accepted: number;
            pending: number;
            expired: number;
            monthly: number;
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

export function StatsCards({ stats }: StatsCardsProps) {
    const cards = [
        {
            title: "Chiffre d'affaires",
            value: `${stats.invoices.revenue.toLocaleString('fr-FR')} €`,
            description: `${stats.invoices.monthlyRevenue.toLocaleString('fr-FR')} € ce mois`,
            icon: DollarSign,
            trend: stats.invoices.monthlyRevenue > 0 ? "up" : "down",
            color: "text-green-600",
            bgColor: "bg-green-50 dark:bg-green-900/20",
        },
        {
            title: "Factures",
            value: stats.invoices.total.toString(),
            description: `${stats.invoices.monthly} ce mois`,
            icon: FileText,
            trend: stats.invoices.monthly > 0 ? "up" : "down",
            color: "text-blue-600",
            bgColor: "bg-blue-50 dark:bg-blue-900/20",
        },
        {
            title: "Devis",
            value: stats.quotes.total.toString(),
            description: `${stats.quotes.monthly} ce mois`,
            icon: FileText,
            trend: stats.quotes.monthly > 0 ? "up" : "down",
            color: "text-purple-600",
            bgColor: "bg-purple-50 dark:bg-purple-900/20",
        },
        {
            title: "Clients actifs",
            value: stats.clients.total.toString(),
            description: `${stats.clients.active} nouveaux (30j)`,
            icon: Users,
            trend: stats.clients.active > 0 ? "up" : "down",
            color: "text-orange-600",
            bgColor: "bg-orange-50 dark:bg-orange-900/20",
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card, index) => {
                const Icon = card.icon;
                const TrendIcon = card.trend === "up" ? TrendingUp : TrendingDown;

                return (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {card.title}
                            </CardTitle>
                            <div className={`p-2 rounded-lg ${card.bgColor}`}>
                                <Icon className={`h-4 w-4 ${card.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{card.value}</div>
                            <div className="flex items-center text-xs text-muted-foreground">
                                <TrendIcon className={`h-3 w-3 mr-1 ${card.trend === "up" ? "text-green-600" : "text-red-600"
                                    }`} />
                                {card.description}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
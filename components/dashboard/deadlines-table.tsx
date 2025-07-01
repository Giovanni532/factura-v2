"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertTriangle, Clock } from "lucide-react";

interface DeadlinesTableProps {
    deadlines: {
        invoices: Array<{
            id: string;
            number: string;
            dueDate: Date;
            status: string;
            total: number;
            clientName: string;
            daysLeft: number;
        }>;
        quotes: Array<{
            id: string;
            number: string;
            validUntil: Date;
            status: string;
            total: number;
            clientName: string;
            daysLeft: number;
        }>;
    };
}

// Fonction pour formater les montants
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
    }).format(value);
};

// Fonction pour formater les dates
const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

// Fonction pour obtenir la couleur du badge selon les jours restants
const getDaysLeftColor = (daysLeft: number) => {
    if (daysLeft <= 0) return "destructive";
    if (daysLeft <= 3) return "destructive";
    if (daysLeft <= 7) return "secondary";
    return "default";
};

// Fonction pour obtenir le texte du badge
const getDaysLeftText = (daysLeft: number) => {
    if (daysLeft <= 0) return "En retard";
    if (daysLeft === 1) return "1 jour";
    return `${daysLeft} jours`;
};

export function DeadlinesTable({ deadlines }: DeadlinesTableProps) {
    const allDeadlines = [
        ...deadlines.invoices.map(inv => ({
            ...inv,
            type: 'invoice' as const,
            date: inv.dueDate,
            title: `Facture ${inv.number}`,
        })),
        ...deadlines.quotes.map(quote => ({
            ...quote,
            type: 'quote' as const,
            date: quote.validUntil,
            title: `Devis ${quote.number}`,
        })),
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Échéances à venir
                </CardTitle>
                <CardDescription>
                    Factures et devis arrivant à échéance dans les 30 prochains jours
                </CardDescription>
            </CardHeader>
            <CardContent>
                {allDeadlines.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Aucune échéance à venir</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {allDeadlines.slice(0, 10).map((item, index) => (
                            <div
                                key={`${item.type}-${item.id}`}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${item.type === 'invoice'
                                            ? 'bg-blue-50 dark:bg-blue-900/20'
                                            : 'bg-purple-50 dark:bg-purple-900/20'
                                        }`}>
                                        {item.type === 'invoice' ? (
                                            <Calendar className={`h-4 w-4 ${item.type === 'invoice' ? 'text-blue-600' : 'text-purple-600'
                                                }`} />
                                        ) : (
                                            <AlertTriangle className="h-4 w-4 text-purple-600" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-medium">{item.title}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {item.clientName}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="font-medium">
                                            {formatCurrency(item.total)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {formatDate(item.date)}
                                        </div>
                                    </div>
                                    <Badge variant={getDaysLeftColor(item.daysLeft)}>
                                        {getDaysLeftText(item.daysLeft)}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 
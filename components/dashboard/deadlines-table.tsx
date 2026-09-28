"use client";

import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { paths } from "@/paths";

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

const shortDate = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });

function DaysLeft({ days }: { days: number }) {
    if (days <= 0) return <Badge variant="destructive">En retard</Badge>;
    if (days <= 3) return <Badge variant="destructive">{days === 1 ? "1 jour" : `${days} jours`}</Badge>;
    if (days <= 7) return <Badge variant="warning">{days} jours</Badge>;
    return <Badge variant="muted">{days} jours</Badge>;
}

export function DeadlinesTable({ deadlines }: DeadlinesTableProps) {
    const allDeadlines = [
        ...deadlines.invoices.map((inv) => ({ ...inv, type: "invoice" as const, date: inv.dueDate })),
        ...deadlines.quotes.map((quote) => ({ ...quote, type: "quote" as const, date: quote.validUntil })),
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <Card className="gap-0 pb-0">
            <CardHeader className="border-b pb-5">
                <CardTitle>Échéances à venir</CardTitle>
                <CardDescription>Factures à encaisser et devis à relancer dans les 30 prochains jours</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
                {allDeadlines.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center text-muted-foreground">
                        <CalendarCheck className="size-8 opacity-60" />
                        <p>Aucune échéance dans les 30 prochains jours. Registre à jour.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="ledger-label px-6 py-3 text-left font-medium">Échéance</th>
                                <th className="ledger-label px-3 py-3 text-left font-medium">Document</th>
                                <th className="ledger-label hidden px-3 py-3 text-left font-medium md:table-cell">Client</th>
                                <th className="ledger-label px-3 py-3 text-right font-medium">Montant</th>
                                <th className="ledger-label px-6 py-3 text-right font-medium">Reste</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allDeadlines.slice(0, 10).map((item) => {
                                const href = `${item.type === "invoice" ? paths.invoices.list : paths.quotes.list}?id=${item.id}`;
                                return (
                                    <tr key={`${item.type}-${item.id}`} className="border-b last:border-0 hover:bg-muted/60">
                                        <td className="px-6 py-3 font-mono text-[13px]">{shortDate.format(new Date(item.date))}</td>
                                        <td className="px-3 py-3">
                                            <Link href={href} className="font-mono text-[13px] underline-offset-4 hover:underline">
                                                {item.number}
                                            </Link>
                                            <span className="ml-2 text-[12px] text-muted-foreground">
                                                {item.type === "invoice" ? "Facture" : "Devis"}
                                            </span>
                                        </td>
                                        <td className="hidden px-3 py-3 md:table-cell">{item.clientName}</td>
                                        <td className="px-3 py-3 text-right font-mono text-[13px]">
                                            {formatCurrency(item.total, "EUR")}
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <DaysLeft days={item.daysLeft} />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </CardContent>
        </Card>
    );
}

"use client"

import { Bar, BarChart, XAxis, CartesianGrid, LabelList, Line, LineChart } from "recharts"
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

const barChartConfig = {
    benefice: {
        label: "Encaissé",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig

const lineChartConfig = {
    invoice: {
        label: "Factures",
        color: "var(--chart-1)",
    },
    quote: {
        label: "Devis",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig

const compact = new Intl.NumberFormat("fr-FR", { notation: "compact", maximumFractionDigits: 1 })

// Tendance réelle sur les deux derniers mois complets (le mois en cours est
// partiel : le comparer donnerait une fausse baisse).
function Trend({ data, unit }: { data: { month: string; value: number }[]; unit: string }) {
    const complete = data.slice(0, -1)
    const [prev, last] = complete.slice(-2)
    if (!prev || !last || !prev.value) {
        return <span className="text-muted-foreground">Pas encore assez d&apos;historique pour une tendance.</span>
    }
    const pct = ((last.value - prev.value) / prev.value) * 100
    const flat = Math.abs(pct) < 1
    const Icon = flat ? Minus : pct > 0 ? ArrowUpRight : ArrowDownRight
    return (
        <span className="inline-flex items-center gap-1.5">
            <Icon className={cn("size-4", flat ? "text-muted-foreground" : pct > 0 ? "text-success" : "text-destructive")} />
            {unit} en {last.month.toLowerCase()} :{" "}
            <span className="font-mono">{flat ? "stable" : `${pct > 0 ? "+" : "−"}${Math.abs(pct).toFixed(0)} %`}</span>
            <span className="text-muted-foreground">vs {prev.month.toLowerCase()}</span>
        </span>
    )
}

export function RevenueQuoteAndInvoiceChart({ charts }: { charts: { month: string; benefice: number }[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Chiffre d&apos;affaires encaissé</CardTitle>
                <CardDescription>Factures payées, par mois d&apos;émission — 6 derniers mois</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={barChartConfig} className="aspect-[16/9]">
                    <BarChart accessibilityLayer data={charts} margin={{ top: 24 }}>
                        <CartesianGrid vertical={false} strokeDasharray="2 4" />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            className="font-mono"
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Bar dataKey="benefice" fill="var(--color-benefice)" radius={[4, 4, 0, 0]} maxBarSize={48}>
                            <LabelList
                                position="top"
                                offset={10}
                                className="fill-foreground font-mono"
                                fontSize={11}
                                formatter={(value) => (typeof value === "number" && value ? `${compact.format(value)}\u00a0€` : "")}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="border-t pt-4 text-sm">
                <Trend data={charts.map((c) => ({ month: c.month, value: c.benefice }))} unit="Encaissements" />
            </CardFooter>
        </Card>
    )
}

export function RevenueChart({ charts }: { charts: { month: string; invoice: number; quote: number }[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Volume d&apos;activité</CardTitle>
                <CardDescription>Factures et devis émis par mois</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={lineChartConfig} className="aspect-[16/9]">
                    <LineChart accessibilityLayer data={charts} margin={{ left: 12, right: 12, top: 12 }}>
                        <CartesianGrid vertical={false} strokeDasharray="2 4" />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            className="font-mono"
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Line dataKey="invoice" type="monotone" stroke="var(--color-invoice)" strokeWidth={2} dot={{ r: 3 }} />
                        <Line dataKey="quote" type="monotone" stroke="var(--color-quote)" strokeWidth={2} strokeDasharray="4 3" dot={{ r: 3 }} />
                    </LineChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="border-t pt-4 text-sm">
                <Trend data={charts.map((c) => ({ month: c.month, value: c.invoice }))} unit="Factures émises" />
            </CardFooter>
        </Card>
    )
}

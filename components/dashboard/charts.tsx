"use client"

import { Bar, BarChart, XAxis, CartesianGrid, LabelList, Line, LineChart } from "recharts"

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
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { TrendingUp } from "lucide-react"

// Configuration pour le graphique en barres (revenus)
const barChartConfig = {
    benefice: {
        label: "Chiffre d'affaires",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig

// Configuration pour le graphique en ligne (factures et devis)
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

export function RevenueQuoteAndInvoiceChart({ charts }: { charts: any }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Chiffre d'affaires mensuel</CardTitle>
                <CardDescription>Évolution du CA sur les 6 derniers mois</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={barChartConfig}>
                    <BarChart
                        accessibilityLayer
                        data={charts}
                        margin={{
                            top: 20,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="benefice" fill="var(--color-benefice)" radius={8}>
                            <LabelList
                                position="top"
                                offset={12}
                                className="fill-foreground"
                                fontSize={12}
                                formatter={(value: any) => `${value.toLocaleString('fr-FR')} €`}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                    Chiffre d'affaires en hausse ce mois <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                    Affichage du CA des 6 derniers mois
                </div>
            </CardFooter>
        </Card>
    )
}

export function RevenueChart({ charts }: { charts: any }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Volume d'activité</CardTitle>
                <CardDescription>Nombre de factures et devis par mois</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={lineChartConfig}>
                    <LineChart
                        accessibilityLayer
                        data={charts}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Line
                            dataKey="invoice"
                            type="monotone"
                            stroke="var(--color-invoice)"
                            strokeWidth={2}
                            dot={false}
                        />
                        <Line
                            dataKey="quote"
                            type="monotone"
                            stroke="var(--color-quote)"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
            <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2 leading-none font-medium">
                            Activité en hausse ce mois <TrendingUp className="h-4 w-4" />
                        </div>
                        <div className="text-muted-foreground flex items-center gap-2 leading-none">
                            Évolution des 6 derniers mois
                        </div>
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}

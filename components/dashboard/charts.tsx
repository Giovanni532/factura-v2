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

// Configuration pour le graphique en barres (devis et factures)
const barChartConfig = {
    running: {
        label: "Factures",
        color: "var(--chart-1)",
    },
    swimming: {
        label: "Devis",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig

// Configuration pour le graphique en ligne (revenus)
const lineChartConfig = {
    desktop: {
        label: "Factures",
        color: "var(--chart-1)",
    },
    mobile: {
        label: "Devis",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig

export function RevenueQuoteAndInvoiceChart({ charts }: { charts: any }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Devis et factures</CardTitle>
                <CardDescription>Évolution mensuelle des revenus</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={barChartConfig}>
                    <BarChart accessibilityLayer data={charts.revenue}>
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => {
                                return new Date(value + "-01").toLocaleDateString("fr-FR", {
                                    month: "short",
                                })
                            }}
                        />
                        <Bar
                            dataKey="running"
                            stackId="a"
                            fill="var(--color-running)"
                            radius={[0, 0, 4, 4]}
                        />
                        <Bar
                            dataKey="swimming"
                            stackId="a"
                            fill="var(--color-swimming)"
                            radius={[4, 4, 0, 0]}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    hideLabel
                                    className="w-[180px]"
                                    formatter={(value, name, item, index) => (
                                        <>
                                            <div
                                                className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-(--color-bg)"
                                                style={
                                                    {
                                                        "--color-bg": `var(--color-${name})`,
                                                    } as React.CSSProperties
                                                }
                                            />
                                            {barChartConfig[name as keyof typeof barChartConfig]?.label ||
                                                name}
                                            <div className="text-foreground ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums">
                                                {value.toLocaleString('fr-FR')}
                                                <span className="text-muted-foreground font-normal">
                                                    €
                                                </span>
                                            </div>
                                            {/* Add this after the last item */}
                                            {index === 1 && (
                                                <div className="text-foreground mt-1.5 flex basis-full items-center border-t pt-1.5 text-xs font-medium">
                                                    Total
                                                    <div className="text-foreground ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums">
                                                        {(item.payload.running + item.payload.swimming).toLocaleString('fr-FR')}
                                                        <span className="text-muted-foreground font-normal">
                                                            €
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                />
                            }
                            cursor={false}
                            defaultIndex={1}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
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
                            top: 20,
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
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                        />
                        <Line
                            dataKey="desktop"
                            type="natural"
                            stroke="var(--color-desktop)"
                            strokeWidth={2}
                            dot={{
                                fill: "var(--color-desktop)",
                            }}
                            activeDot={{
                                r: 6,
                            }}
                        >
                            <LabelList
                                position="top"
                                offset={12}
                                className="fill-foreground"
                                fontSize={12}
                            />
                        </Line>
                        <Line
                            dataKey="mobile"
                            type="natural"
                            stroke="var(--color-mobile)"
                            strokeWidth={2}
                            dot={{
                                fill: "var(--color-mobile)",
                            }}
                            activeDot={{
                                r: 6,
                            }}
                        >
                            <LabelList
                                position="top"
                                offset={12}
                                className="fill-foreground"
                                fontSize={12}
                            />
                        </Line>
                    </LineChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                    Activité en hausse ce mois <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                    Évolution des 6 derniers mois
                </div>
            </CardFooter>
        </Card>
    )
}

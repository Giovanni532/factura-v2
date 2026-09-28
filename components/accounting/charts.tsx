"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

const eur = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" })
const compact = new Intl.NumberFormat("fr-FR", { notation: "compact", maximumFractionDigits: 1 })

interface RevenueData {
    month: string
    revenue: number
}

interface RevenueChartProps {
    data: RevenueData[]
    currentRevenue: number
    change: number
    title?: string
    description?: string
}

// const defaultData = [
//     { month: "Jan", revenue: 1000 },
//     { month: "Feb", revenue: 1200 },
//     { month: "Mar", revenue: 1100 },
//     { month: "Apr", revenue: 1300 },
//     { month: "May", revenue: 1400 },
//     { month: "Jun", revenue: 1500 },
// ]

export function RevenueChart({
    data,
    currentRevenue,
    change,
    title = "Évolution des revenus",
    description = "Chiffre d'affaires mensuel"
}: RevenueChartProps) {
    const isPositive = change >= 0
    const TrendIcon = isPositive ? TrendingUp : TrendingDown

    return (
        <Card className="border-none shadow-none">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>
                    {description} · ce mois <span className="font-mono">{eur.format(currentRevenue)}</span>
                    {change !== 0 && (
                        <span className={`ml-2 ${isPositive ? 'text-success' : 'text-destructive'}`}>
                            {isPositive ? '+' : ''}{change.toFixed(1)}%
                        </span>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart
                        data={data}
                        margin={{
                            left: 12,
                            right: 12,
                            top: 12,
                            bottom: 12,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value: string) => (value.length > 4 ? `${value.slice(0, 3)}.` : value)}
                            interval={1}
                            className="font-mono"
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => `${compact.format(value)}\u00a0€`}
                            className="font-mono"
                            width={76}
                        />
                        <Tooltip
                            formatter={(value: number) => [eur.format(value), 'Revenus']}
                            labelFormatter={(label) => `${label}`}
                            contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                        />
                        <Line
                            dataKey="revenue"
                            type="monotone"
                            stroke="var(--chart-1)"
                            strokeWidth={2}
                            dot={{ fill: 'var(--chart-1)', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: 'var(--chart-1)', strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                {change !== 0 ? (
                    <div className="flex items-center gap-2 leading-none font-medium">
                        <TrendIcon className={`h-4 w-4 ${isPositive ? 'text-success' : 'text-destructive'}`} />
                        {isPositive ? 'En hausse' : 'En baisse'} de <span className="font-mono">{Math.abs(change).toFixed(1)} %</span> par rapport au mois précédent
                    </div>
                ) : null}
                <div className="text-muted-foreground leading-none">
                    Écritures de revenus validées, {data.length} derniers mois
                </div>
            </CardFooter>
        </Card>
    )
}

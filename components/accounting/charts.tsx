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
                    {description} - €{currentRevenue.toLocaleString('fr-FR')}
                    {change !== 0 && (
                        <span className={`ml-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
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
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            formatter={(value: number) => [`€${value.toLocaleString('fr-FR')}`, 'Revenus']}
                            labelFormatter={(label) => `Mois: ${label}`}
                        />
                        <Line
                            dataKey="revenue"
                            type="monotone"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                    {isPositive ? 'En hausse' : 'En baisse'} de {Math.abs(change).toFixed(1)}% ce mois
                    <TrendIcon className={`h-4 w-4 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
                </div>
                <div className="text-muted-foreground leading-none">
                    Affichage des revenus des {data.length} derniers mois
                </div>
            </CardFooter>
        </Card>
    )
}

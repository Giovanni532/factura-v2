"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    IconPlus,
    IconEdit,
    IconTrash,
    IconLock,
    IconLockOpen,
    IconCalendar,
    IconCalculator,
    IconCheck,
    IconX
} from "@tabler/icons-react"
import { createFiscalYearAction, updateFiscalYearAction, deleteFiscalYearAction } from "@/action/accounting-actions"

interface FiscalYearWithStats {
    id: string
    name: string
    startDate: Date
    endDate: Date
    isClosed: boolean
    totalRevenue: number
    totalExpenses: number
    netIncome: number
}

interface FiscalYearsClientProps {
    fiscalYears: FiscalYearWithStats[]
}

export function FiscalYearsClient({ fiscalYears }: FiscalYearsClientProps) {
    const [localFiscalYears, setLocalFiscalYears] = useState(fiscalYears)

    // Mutations
    const handleCreate = async (data: any) => {
        const res = await createFiscalYearAction(data)
        if (res.success) {
            setLocalFiscalYears((prev) => [...prev, res.fiscalYear])
        }
    }
    const handleUpdate = async (id: string, data: any) => {
        const res = await updateFiscalYearAction({ id, ...data })
        if (res.success) {
            setLocalFiscalYears((prev) => prev.map(fy => fy.id === id ? res.fiscalYear : fy))
        }
    }
    const handleDelete = async (id: string) => {
        const res = await deleteFiscalYearAction({ id })
        if (res.success) {
            setLocalFiscalYears((prev) => prev.filter(fy => fy.id !== id))
        }
    }

    const getStatusColor = (status: FiscalYearWithStats["isClosed"]) => {
        switch (status) {
            case true:
                return "bg-red-100 text-red-800"
            case false:
                return "bg-green-100 text-green-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const getStatusLabel = (status: FiscalYearWithStats["isClosed"]) => {
        switch (status) {
            case true:
                return "Clôturé"
            case false:
                return "Ouvert"
            default:
                return status
        }
    }

    const getStatusIcon = (status: FiscalYearWithStats["isClosed"]) => {
        switch (status) {
            case true:
                return IconLock
            case false:
                return IconLockOpen
            default:
                return IconCalculator
        }
    }

    return (
        <div className="space-y-6">
            {/* Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <h2 className="text-lg font-semibold">Exercices fiscaux</h2>
                </div>
                <Button>
                    <IconPlus className="h-4 w-4 mr-2" />
                    Nouvel exercice
                </Button>
            </div>

            {/* Liste des exercices */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {localFiscalYears.map((year) => {
                    const StatusIcon = getStatusIcon(year.isClosed)
                    return (
                        <Card key={year.id} className={`hover:shadow-md transition-shadow ${year.isClosed ? 'ring-2 ring-red-500' : ''}`}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-muted rounded-lg">
                                            <StatusIcon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{year.name}</CardTitle>
                                            <div className="flex items-center space-x-2">
                                                <Badge variant="secondary" className={getStatusColor(year.isClosed)}>
                                                    {getStatusLabel(year.isClosed)}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Période */}
                                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                        <IconCalendar className="h-4 w-4" />
                                        <span>
                                            {new Date(year.startDate).toLocaleDateString('fr-FR')} - {new Date(year.endDate).toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>

                                    {/* Statistiques */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Chiffre d'affaires:</span>
                                            <span className="font-medium text-green-600">
                                                {year.totalRevenue.toLocaleString('fr-FR', {
                                                    style: 'currency',
                                                    currency: 'EUR'
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Dépenses:</span>
                                            <span className="font-medium text-red-600">
                                                {year.totalExpenses.toLocaleString('fr-FR', {
                                                    style: 'currency',
                                                    currency: 'EUR'
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm border-t pt-2">
                                            <span className="font-medium">Résultat net:</span>
                                            <span className={`font-bold ${year.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {year.netIncome.toLocaleString('fr-FR', {
                                                    style: 'currency',
                                                    currency: 'EUR'
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center space-x-2 pt-2">
                                        <Button variant="outline" size="sm" className="flex-1">
                                            <IconEdit className="h-4 w-4 mr-2" />
                                            Modifier
                                        </Button>
                                        {year.isClosed && (
                                            <Button variant="outline" size="sm">
                                                <IconLock className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="sm">
                                            <IconTrash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Résumé */}
            <Card>
                <CardHeader>
                    <CardTitle>Résumé des exercices</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {localFiscalYears.filter(y => !y.isClosed).length}
                            </div>
                            <div className="text-sm text-muted-foreground">Exercices ouverts</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">
                                {localFiscalYears.filter(y => y.isClosed).length}
                            </div>
                            <div className="text-sm text-muted-foreground">Exercices clôturés</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">
                                {localFiscalYears.reduce((sum, y) => sum + y.netIncome, 0).toLocaleString('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR'
                                })}
                            </div>
                            <div className="text-sm text-muted-foreground">Résultat total</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 
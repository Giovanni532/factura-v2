"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    IconPlus,
    IconSearch,
    IconEye,
    IconEdit,
    IconTrash,
    IconFileText,
    IconCalendar,
    IconCalculator
} from "@tabler/icons-react"
import { createJournalEntryAction, updateJournalEntryAction, deleteJournalEntryAction } from "@/action/accounting-actions"

interface JournalEntryWithLines {
    id: string
    number: string
    date: Date
    description: string
    reference?: string | null
    type: string
    isPosted: boolean
    total: number
    lines: {
        id: string
        accountId: string
        accountCode: string
        accountName: string
        debit: number
        credit: number
        description?: string | null
    }[]
}

interface JournalEntriesClientProps {
    entries: JournalEntryWithLines[]
}

export function JournalEntriesClient({ entries }: JournalEntriesClientProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [localEntries, setLocalEntries] = useState(entries)

    // Mutations
    const handleCreate = async (data: any) => {
        const res = await createJournalEntryAction(data)
        if (res.success) {
            setLocalEntries((prev) => [...prev, res.entry])
        }
    }
    const handleUpdate = async (id: string, data: any) => {
        const res = await updateJournalEntryAction({ id, ...data })
        if (res.success) {
            setLocalEntries((prev) => prev.map(e => e.id === id ? res.entry : e))
        }
    }
    const handleDelete = async (id: string) => {
        const res = await deleteJournalEntryAction({ id })
        if (res.success) {
            setLocalEntries((prev) => prev.filter(e => e.id !== id))
        }
    }

    const getStatusColor = (status: JournalEntryWithLines["isPosted"]) => {
        switch (status) {
            case true:
                return "bg-green-100 text-green-800"
            case false:
                return "bg-yellow-100 text-yellow-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const getStatusLabel = (status: JournalEntryWithLines["isPosted"]) => {
        switch (status) {
            case true:
                return "Comptabilisée"
            case false:
                return "Brouillon"
            default:
                return status
        }
    }

    const filteredEntries = localEntries.filter(entry =>
        entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.number.includes(searchTerm)
    )

    return (
        <div className="space-y-6">
            {/* Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Input
                        placeholder="Rechercher une écriture..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64"
                    />
                    <IconSearch className="h-4 w-4 text-muted-foreground" />
                </div>
                <Button>
                    <IconPlus className="h-4 w-4 mr-2" />
                    Nouvelle écriture
                </Button>
            </div>

            {/* Liste des écritures */}
            <Card>
                <CardHeader>
                    <CardTitle>Écritures comptables</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredEntries.map((entry) => (
                            <div key={entry.id} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-4">
                                        <IconFileText className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium">{entry.number}</span>
                                                <Badge variant="secondary" className={getStatusColor(entry.isPosted)}>
                                                    {getStatusLabel(entry.isPosted)}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{entry.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-right">
                                            <div className="flex items-center space-x-2">
                                                <IconCalendar className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">
                                                    {new Date(entry.date).toLocaleDateString('fr-FR')}
                                                </span>
                                            </div>
                                            <div className="font-medium">
                                                {entry.total.toLocaleString('fr-FR', {
                                                    style: 'currency',
                                                    currency: 'EUR'
                                                })}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button variant="ghost" size="sm">
                                                <IconEye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                <IconEdit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                <IconTrash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Lignes d'écriture */}
                                <div className="bg-muted/20 rounded-lg p-3">
                                    <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground mb-2">
                                        <div>Compte</div>
                                        <div>Description</div>
                                        <div className="text-right">Débit</div>
                                        <div className="text-right">Crédit</div>
                                    </div>
                                    {entry.lines.map((line) => (
                                        <div key={line.id} className="grid grid-cols-4 gap-4 py-2 border-b last:border-b-0">
                                            <div>
                                                <div className="font-medium">{line.accountCode}</div>
                                                <div className="text-sm text-muted-foreground">{line.accountName}</div>
                                            </div>
                                            <div className="text-sm">{line.description}</div>
                                            <div className="text-right">
                                                {line.debit > 0 ? (
                                                    <span className="font-medium">
                                                        {line.debit.toLocaleString('fr-FR', {
                                                            style: 'currency',
                                                            currency: 'EUR'
                                                        })}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                {line.credit > 0 ? (
                                                    <span className="font-medium">
                                                        {line.credit.toLocaleString('fr-FR', {
                                                            style: 'currency',
                                                            currency: 'EUR'
                                                        })}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { createJournalEntrySchema, updateJournalEntrySchema } from "@/validation/accounting-schema"

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
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [editingEntry, setEditingEntry] = useState<JournalEntryWithLines | null>(null)
    const [viewingEntry, setViewingEntry] = useState<JournalEntryWithLines | null>(null)

    // Formulaires
    const createForm = useForm({
        resolver: zodResolver(createJournalEntrySchema),
        defaultValues: {
            number: "",
            date: "",
            description: "",
            status: "draft" as const,
            lines: [
                { accountId: "", debit: 0, credit: 0, description: "" },
                { accountId: "", debit: 0, credit: 0, description: "" }
            ]
        }
    })

    const updateForm = useForm({
        resolver: zodResolver(updateJournalEntrySchema),
        defaultValues: {
            id: "",
            number: "",
            date: "",
            description: "",
            status: "draft" as const,
            lines: []
        }
    })

    // Actions
    const { execute: executeCreate, isPending: isCreating } = useAction(createJournalEntryAction, {
        onSuccess: (data) => {
            toast.success("Écriture comptable créée avec succès")
            if (data.data?.entry && data.data?.lines) {
                const newEntry: JournalEntryWithLines = {
                    ...data.data.entry,
                    reference: null,
                    type: "general",
                    total: data.data.lines.reduce((sum: number, line: any) => sum + line.debit, 0),
                    lines: data.data.lines.map((line: any) => ({
                        ...line,
                        accountCode: "",
                        accountName: ""
                    }))
                }
                setLocalEntries((prev) => [...prev, newEntry])
            }
            setIsCreateDialogOpen(false)
            createForm.reset()
        },
        onError: () => {
            toast.error("Erreur lors de la création de l'écriture comptable")
        }
    })

    const { execute: executeUpdate, isPending: isUpdating } = useAction(updateJournalEntryAction, {
        onSuccess: (data) => {
            toast.success("Écriture comptable mise à jour avec succès")
            if (data.data?.entry) {
                const updatedEntry: JournalEntryWithLines = {
                    ...data.data.entry,
                    reference: editingEntry?.reference || null,
                    type: editingEntry?.type || "general",
                    total: editingEntry?.total || 0,
                    lines: editingEntry?.lines || []
                }
                setLocalEntries((prev) => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e))
            }
            setEditingEntry(null)
            updateForm.reset()
        },
        onError: () => {
            toast.error("Erreur lors de la mise à jour de l'écriture comptable")
        }
    })

    const { execute: executeDelete, isPending: isDeleting } = useAction(deleteJournalEntryAction, {
        onSuccess: () => {
            toast.success("Écriture comptable supprimée avec succès")
            if (editingEntry) {
                setLocalEntries((prev) => prev.filter(e => e.id !== editingEntry.id))
            }
            setEditingEntry(null)
        },
        onError: () => {
            toast.error("Erreur lors de la suppression de l'écriture comptable")
        }
    })

    const handleCreate = (data: any) => {
        executeCreate(data)
    }

    const handleUpdate = (data: any) => {
        executeUpdate(data)
    }

    const handleDelete = (entry: JournalEntryWithLines) => {
        setEditingEntry(entry)
        executeDelete({ id: entry.id })
    }

    const openEditDialog = (entry: JournalEntryWithLines) => {
        setEditingEntry(entry)
        updateForm.reset({
            id: entry.id,
            number: entry.number,
            date: entry.date.toISOString().split('T')[0],
            description: entry.description,
            status: entry.isPosted ? 'posted' : 'draft',
            lines: entry.lines.map(line => ({
                id: line.id,
                accountId: line.accountId,
                debit: line.debit,
                credit: line.credit,
                description: line.description || ""
            }))
        })
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
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <IconPlus className="h-4 w-4 mr-2" />
                            Nouvelle écriture
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Créer une nouvelle écriture comptable</DialogTitle>
                        </DialogHeader>
                        <Form {...createForm}>
                            <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={createForm.control}
                                        name="number"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Numéro</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="JE-001" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={createForm.control}
                                        name="date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Date</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={createForm.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Description de l'écriture" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={createForm.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Statut</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Sélectionner un statut" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="draft">Brouillon</SelectItem>
                                                    <SelectItem value="posted">Comptabilisée</SelectItem>
                                                    <SelectItem value="cancelled">Annulée</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex justify-end space-x-2">
                                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                        Annuler
                                    </Button>
                                    <Button type="submit" disabled={isCreating}>
                                        {isCreating ? "Création..." : "Créer"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
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
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setViewingEntry(entry)}
                                            >
                                                <IconEye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditDialog(entry)}
                                            >
                                                <IconEdit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(entry)}
                                                disabled={isDeleting}
                                            >
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

            {/* Dialog de modification */}
            <Dialog open={!!editingEntry} onOpenChange={() => setEditingEntry(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Modifier l'écriture comptable</DialogTitle>
                    </DialogHeader>
                    <Form {...updateForm}>
                        <form onSubmit={updateForm.handleSubmit(handleUpdate)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={updateForm.control}
                                    name="number"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Numéro</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={updateForm.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={updateForm.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={updateForm.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Statut</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="draft">Brouillon</SelectItem>
                                                <SelectItem value="posted">Comptabilisée</SelectItem>
                                                <SelectItem value="cancelled">Annulée</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setEditingEntry(null)}>
                                    Annuler
                                </Button>
                                <Button type="submit" disabled={isUpdating}>
                                    {isUpdating ? "Mise à jour..." : "Mettre à jour"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Dialog de visualisation */}
            <Dialog open={!!viewingEntry} onOpenChange={() => setViewingEntry(null)}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Détails de l'écriture comptable</DialogTitle>
                    </DialogHeader>
                    {viewingEntry && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Numéro</label>
                                    <p className="text-sm text-muted-foreground">{viewingEntry.number}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Date</label>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(viewingEntry.date).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Description</label>
                                <p className="text-sm text-muted-foreground">{viewingEntry.description}</p>
                            </div>
                            {viewingEntry.reference && (
                                <div>
                                    <label className="text-sm font-medium">Référence</label>
                                    <p className="text-sm text-muted-foreground">{viewingEntry.reference}</p>
                                </div>
                            )}
                            <div>
                                <label className="text-sm font-medium">Type</label>
                                <p className="text-sm text-muted-foreground">{viewingEntry.type}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Lignes d'écriture</label>
                                <div className="mt-2 border rounded-lg">
                                    <div className="grid grid-cols-4 gap-4 p-3 bg-muted/20 text-sm font-medium">
                                        <div>Compte</div>
                                        <div>Description</div>
                                        <div className="text-right">Débit</div>
                                        <div className="text-right">Crédit</div>
                                    </div>
                                    {viewingEntry.lines.map((line) => (
                                        <div key={line.id} className="grid grid-cols-4 gap-4 p-3 border-t">
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
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
} 
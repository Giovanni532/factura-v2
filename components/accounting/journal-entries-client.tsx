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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { fr as frCalendar } from "react-day-picker/locale"
import { fr } from "date-fns/locale"
import {
    IconPlus,
    IconSearch,
    IconEye,
    IconEdit,
    IconTrash,
    IconFileText,
    IconCalendar,
    IconCalculator,
    IconX
} from "@tabler/icons-react"
import { createJournalEntryAction, updateJournalEntryAction, deleteJournalEntryAction } from "@/action/accounting-actions"
import { createJournalEntrySchema, updateJournalEntrySchema } from "@/validation/accounting-schema"
import { useJournalEntries } from "@/hooks/use-journal-entries"
import { useRouter } from "next/navigation"

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

interface AccountWithBalance {
    id: string
    code: string
    name: string
    type: "asset" | "liability" | "equity" | "revenue" | "expense"
    parentAccountId?: string | null
    balance: number
    children?: AccountWithBalance[]
}

interface JournalEntriesClientProps {
    entries: JournalEntryWithLines[]
    accounts: AccountWithBalance[] // Ajout des comptes pour la sélection
}

export function JournalEntriesClient({ entries, accounts }: JournalEntriesClientProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [editingEntry, setEditingEntry] = useState<JournalEntryWithLines | null>(null)
    const [viewingEntry, setViewingEntry] = useState<JournalEntryWithLines | null>(null)
    const [deleteConfirmEntry, setDeleteConfirmEntry] = useState<JournalEntryWithLines | null>(null)

    const router = useRouter()

    // Utiliser le context
    const { entries: contextEntries, addEntry, updateEntry, deleteEntry, getAccountInfo } = useJournalEntries()

    // Formulaires
    const createForm = useForm({
        resolver: zodResolver(createJournalEntrySchema),
        defaultValues: {
            number: "",
            date: new Date().toISOString().split('T')[0],
            description: "",
            status: "draft" as const,
            lines: [
                { accountId: "", debit: 0, credit: 0, description: "" },
                { accountId: "", debit: 0, credit: 0, description: "" }
            ]
        }
    })

    const { fields, append, remove } = useFieldArray({
        control: createForm.control,
        name: "lines"
    })

    const updateForm = useForm({
        resolver: zodResolver(updateJournalEntrySchema),
        defaultValues: {
            id: "",
            number: "",
            date: new Date().toISOString().split('T')[0],
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
                // Mapper les lignes avec les infos des comptes
                const linesWithAccountInfo = data.data.lines.map((line: any) => {
                    const accountInfo = getAccountInfo(line.accountId)
                    return {
                        ...line,
                        accountCode: accountInfo?.code || "",
                        accountName: accountInfo?.name || ""
                    }
                })

                const newEntry: JournalEntryWithLines = {
                    ...data.data.entry,
                    reference: null,
                    type: "general",
                    total: data.data.lines.reduce((sum: number, line: any) => sum + line.debit, 0),
                    lines: linesWithAccountInfo
                }
                addEntry(newEntry)
            }
            setIsCreateDialogOpen(false)
            createForm.reset({
                number: "",
                date: new Date().toISOString().split('T')[0],
                description: "",
                status: "draft" as const,
                lines: [
                    { accountId: "", debit: 0, credit: 0, description: "" },
                    { accountId: "", debit: 0, credit: 0, description: "" }
                ]
            })
            router.refresh()
        },
        onError: (error) => {
            toast.error(error.error?.serverError?.message || "Erreur lors de la création de l'écriture comptable")
        }
    })

    const { execute: executeUpdate, isPending: isUpdating } = useAction(updateJournalEntryAction, {
        onSuccess: (data) => {
            toast.success("Écriture comptable mise à jour avec succès")
            if (data.data?.entry && editingEntry) {
                // Garder les lignes existantes avec leurs infos de compte
                const updatedEntry: JournalEntryWithLines = {
                    ...data.data.entry,
                    reference: editingEntry.reference || null,
                    type: editingEntry.type || "general",
                    total: editingEntry.total || 0,
                    lines: editingEntry.lines || []
                }
                updateEntry(updatedEntry)
            }
            setEditingEntry(null)
            updateForm.reset()
            router.refresh()
        },
        onError: (error) => {
            toast.error(error.error?.serverError?.message || "Erreur lors de la mise à jour de l'écriture comptable")
        }
    })

    const { execute: executeDelete, isPending: isDeleting } = useAction(deleteJournalEntryAction, {
        onSuccess: () => {
            toast.success("Écriture comptable supprimée avec succès")
            if (deleteConfirmEntry) {
                // Mise à jour directe du contexte
                deleteEntry(deleteConfirmEntry.id)
            }
            setDeleteConfirmEntry(null)
            router.refresh()
        },
        onError: (error) => {
            toast.error(error.error?.serverError?.message || "Erreur lors de la suppression de l'écriture comptable")
            setDeleteConfirmEntry(null)
        }
    })

    const handleCreate = (data: any) => {
        // Filtrer les lignes vides
        const validLines = data.lines.filter((line: any) =>
            line.accountId && (line.debit > 0 || line.credit > 0)
        )

        if (validLines.length < 2) {
            toast.error("Au moins deux lignes sont requises")
            return
        }

        executeCreate({
            ...data,
            lines: validLines
        })
    }

    const handleUpdate = (data: any) => {
        executeUpdate(data)
    }

    const handleDelete = (entry: JournalEntryWithLines) => {
        setDeleteConfirmEntry(entry)
    }

    const confirmDelete = () => {
        if (deleteConfirmEntry) {
            executeDelete({ id: deleteConfirmEntry.id })
        }
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

    const addLine = () => {
        append({ accountId: "", debit: 0, credit: 0, description: "" })
    }

    const removeLine = (index: number) => {
        if (fields.length > 2) {
            remove(index)
        } else {
            toast.error("Au moins deux lignes sont requises")
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

    const filteredEntries = contextEntries.filter(entry =>
        entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.reference?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Aplatir tous les comptes pour la sélection
    const allAccounts = accounts.reduce((acc: AccountWithBalance[], account) => {
        acc.push(account)
        if (account.children) {
            acc.push(...account.children)
        }
        return acc
    }, [])

    return (
        <div className="space-y-6">
            {/* Actions */}
            <div className="flex items-center justify-between">
                <div className="flex flex-1 items-center space-x-2 max-w-sm">
                    <div className="relative flex-1">
                        <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher une écriture..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <IconPlus className="h-4 w-4 mr-2" />
                            Nouvelle écriture
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl min-w-4xl max-h-[90vh] overflow-y-auto">
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
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant="outline"
                                                                className="w-full justify-start text-left font-normal"
                                                            >
                                                                <IconCalendar className="mr-2 h-4 w-4" />
                                                                {field.value ? (
                                                                    format(new Date(field.value), "PPP", { locale: fr })
                                                                ) : (
                                                                    <span>Sélectionner une date</span>
                                                                )}
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value ? new Date(field.value) : undefined}
                                                            onSelect={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                                                            locale={frCalendar}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
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
                                                <Textarea placeholder="Description de l&apos;écriture" {...field} />
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
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Lignes d'écriture */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <FormLabel className="text-base font-semibold">Lignes d&apos;écriture</FormLabel>
                                        <Button type="button" variant="outline" size="sm" onClick={addLine}>
                                            <IconPlus className="h-4 w-4 mr-2" />
                                            Ajouter une ligne
                                        </Button>
                                    </div>
                                    <div className="rounded-lg border bg-muted/50 divide-y">
                                        <div className="grid grid-cols-5 gap-3 px-4 py-2 text-xs font-semibold text-muted-foreground bg-muted rounded-t-lg">
                                            <div>Compte</div>
                                            <div>Débit</div>
                                            <div>Crédit</div>
                                            <div>Description</div>
                                            <div></div>
                                        </div>
                                        {fields.map((field, index) => (
                                            <div key={field.id} className="grid grid-cols-5 gap-3 px-4 py-3 items-center group bg-white hover:bg-muted/80 transition">
                                                <FormField
                                                    control={createForm.control}
                                                    name={`lines.${index}.accountId`}
                                                    render={({ field }) => (
                                                        <FormItem className="mb-0">
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="h-9">
                                                                        <SelectValue placeholder="Sélectionner" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {allAccounts.map((account) => (
                                                                        <SelectItem key={account.id} value={account.id}>
                                                                            {account.code} - {account.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={createForm.control}
                                                    name={`lines.${index}.debit`}
                                                    render={({ field }) => (
                                                        <FormItem className="mb-0">
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    placeholder="0.00"
                                                                    {...field}
                                                                    value={isNaN(field.value) ? "" : field.value}
                                                                    onChange={e => field.onChange(Number(e.target.value) || 0)}
                                                                    className="h-9"
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={createForm.control}
                                                    name={`lines.${index}.credit`}
                                                    render={({ field }) => (
                                                        <FormItem className="mb-0">
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    placeholder="0.00"
                                                                    {...field}
                                                                    value={isNaN(field.value) ? "" : field.value}
                                                                    onChange={e => field.onChange(Number(e.target.value) || 0)}
                                                                    className="h-9"
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={createForm.control}
                                                    name={`lines.${index}.description`}
                                                    render={({ field }) => (
                                                        <FormItem className="mb-0">
                                                            <FormControl>
                                                                <Input placeholder="Description" {...field} className="h-9" />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <div className="flex items-center justify-end">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeLine(index)}
                                                        className="text-red-500 opacity-0 group-hover:opacity-100 transition"
                                                        tabIndex={-1}
                                                        aria-label="Supprimer la ligne"
                                                    >
                                                        <IconX className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Résumé Débit/Crédit */}
                                    <div className="flex justify-end gap-8 mt-2 text-sm">
                                        <div className="font-medium text-muted-foreground">
                                            Total Débit : {createForm.watch("lines").reduce((sum, l) => sum + (Number(l.debit) || 0), 0).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                                        </div>
                                        <div className="font-medium text-muted-foreground">
                                            Total Crédit : {createForm.watch("lines").reduce((sum, l) => sum + (Number(l.credit) || 0), 0).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                                        </div>
                                    </div>
                                    {/* Erreurs de validation globales */}
                                    {createForm.formState.errors.lines && (
                                        <div className="text-red-600 text-sm font-medium mt-2">
                                            {createForm.formState.errors.lines.message as string}
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-end space-x-2 mt-4">
                                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                        Annuler
                                    </Button>
                                    <Button type="submit" disabled={!createForm.formState.isValid || isCreating}>
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
                        {filteredEntries.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                {searchTerm ? "Aucune écriture trouvée" : "Aucune écriture comptable"}
                            </div>
                        ) : (
                            filteredEntries.map((entry) => (
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
                                                        {format(new Date(entry.date), "dd/MM/yyyy", { locale: fr })}
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
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Dialog de modification */}
            <Dialog open={!!editingEntry} onOpenChange={() => setEditingEntry(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Modifier l&apos;écriture comptable</DialogTitle>
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
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            className="w-full justify-start text-left font-normal"
                                                        >
                                                            <IconCalendar className="mr-2 h-4 w-4" />
                                                            {field.value ? (
                                                                format(new Date(field.value), "PPP", { locale: fr })
                                                            ) : (
                                                                <span>Sélectionner une date</span>
                                                            )}
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value ? new Date(field.value) : undefined}
                                                        onSelect={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
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
                        <DialogTitle>Détails de l&apos;écriture comptable</DialogTitle>
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
                                        {format(new Date(viewingEntry.date), "PPP", { locale: fr })}
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
                                <label className="text-sm font-medium">Lignes d&apos;écriture</label>
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

            {/* Dialog de confirmation de suppression */}
            <Dialog open={!!deleteConfirmEntry} onOpenChange={() => setDeleteConfirmEntry(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Confirmer la suppression de l&apos;écriture comptable</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Êtes-vous sûr de vouloir supprimer l&apos;écriture {deleteConfirmEntry?.number} ?
                        </p>
                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setDeleteConfirmEntry(null)}>
                                Annuler
                            </Button>
                            <Button type="button" variant="destructive" onClick={confirmDelete}>
                                Supprimer
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
} 
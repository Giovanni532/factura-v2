"use client"

import { useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { createFiscalYearSchema, updateFiscalYearSchema } from "@/validation/accounting-schema"
import { useFiscalYears } from "@/hooks/use-fiscal-years"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Edit, Trash2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

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

export function FiscalYearsClient({ fiscalYears: initialFiscalYears }: FiscalYearsClientProps) {
    const {
        fiscalYears,
        createFiscalYear,
        updateFiscalYear,
        deleteFiscalYear,
        isCreating,
        isUpdating,
        isDeleting
    } = useFiscalYears(initialFiscalYears)

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [editingFiscalYear, setEditingFiscalYear] = useState<FiscalYearWithStats | null>(null)

    // Formulaires
    const createForm = useForm({
        resolver: zodResolver(createFiscalYearSchema),
        defaultValues: {
            name: "",
            startDate: "",
            endDate: "",
            status: "open" as const,
            isCurrent: false,
        }
    })

    const updateForm = useForm({
        resolver: zodResolver(updateFiscalYearSchema),
        defaultValues: {
            id: "",
            name: "",
            startDate: "",
            endDate: "",
            status: "open" as const,
            isCurrent: false,
        }
    })

    const handleCreate = async (data: any) => {
        await createFiscalYear(data)
        setIsCreateDialogOpen(false)
        createForm.reset()
    }

    const handleUpdate = async (data: any) => {
        await updateFiscalYear(data)
        setEditingFiscalYear(null)
        updateForm.reset()
    }

    const handleDelete = async (fiscalYear: FiscalYearWithStats) => {
        await deleteFiscalYear(fiscalYear.id)
        setEditingFiscalYear(null)
    }

    const openEditDialog = (fiscalYear: FiscalYearWithStats) => {
        setEditingFiscalYear(fiscalYear)
        updateForm.reset({
            id: fiscalYear.id,
            name: fiscalYear.name,
            startDate: fiscalYear.startDate.toISOString().split('T')[0],
            endDate: fiscalYear.endDate.toISOString().split('T')[0],
            status: fiscalYear.isClosed ? 'closed' : 'open',
            isCurrent: false,
        })
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
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <IconPlus className="h-4 w-4 mr-2" />
                            Nouvel exercice
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Créer un nouvel exercice fiscal</DialogTitle>
                        </DialogHeader>
                        <Form {...createForm}>
                            <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
                                <FormField
                                    control={createForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nom de l'exercice</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Exercice 2024" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={createForm.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Date de début</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(new Date(field.value), "PPP", { locale: fr })
                                                            ) : (
                                                                <span>Sélectionner une date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value ? new Date(field.value) : undefined}
                                                        onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                                                        locale={fr}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={createForm.control}
                                    name="endDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Date de fin</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(new Date(field.value), "PPP", { locale: fr })
                                                            ) : (
                                                                <span>Sélectionner une date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value ? new Date(field.value) : undefined}
                                                        onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                                                        locale={fr}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
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
                                                    <SelectItem value="open">Ouvert</SelectItem>
                                                    <SelectItem value="closed">Clôturé</SelectItem>
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

            {/* Liste des exercices */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {fiscalYears.map((year) => {
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
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => openEditDialog(year)}
                                        >
                                            <IconEdit className="h-4 w-4 mr-2" />
                                            Modifier
                                        </Button>
                                        {year.isClosed && (
                                            <Button variant="outline" size="sm">
                                                <IconLock className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(year)}
                                            disabled={isDeleting}
                                        >
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
                                {fiscalYears.filter((y: FiscalYearWithStats) => !y.isClosed).length}
                            </div>
                            <div className="text-sm text-muted-foreground">Exercices ouverts</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">
                                {fiscalYears.filter((y: FiscalYearWithStats) => y.isClosed).length}
                            </div>
                            <div className="text-sm text-muted-foreground">Exercices clôturés</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">
                                {fiscalYears.reduce((sum: number, y: FiscalYearWithStats) => sum + y.netIncome, 0).toLocaleString('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR'
                                })}
                            </div>
                            <div className="text-sm text-muted-foreground">Résultat total</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Dialog de modification */}
            <Dialog open={!!editingFiscalYear} onOpenChange={() => setEditingFiscalYear(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modifier l'exercice fiscal</DialogTitle>
                    </DialogHeader>
                    <Form {...updateForm}>
                        <form onSubmit={updateForm.handleSubmit(handleUpdate)} className="space-y-4">
                            <FormField
                                control={updateForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nom de l'exercice</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={updateForm.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Date de début</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(new Date(field.value), "PPP", { locale: fr })
                                                        ) : (
                                                            <span>Sélectionner une date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                                                    locale={fr}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={updateForm.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Date de fin</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(new Date(field.value), "PPP", { locale: fr })
                                                        ) : (
                                                            <span>Sélectionner une date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                                                    locale={fr}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
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
                                                <SelectItem value="open">Ouvert</SelectItem>
                                                <SelectItem value="closed">Clôturé</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setEditingFiscalYear(null)}>
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
        </div>
    )
} 
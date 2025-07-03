"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { fr as frCalendar } from "react-day-picker/locale"
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
    IconCash,
    IconCreditCard,
    IconCalendar as IconCalendarTabler,
    IconUser,
    IconBuilding,
    IconLoader2,
    IconChevronDown
} from "@tabler/icons-react"
import { createPaymentAction, updatePaymentAction, deletePaymentAction } from "@/action/accounting-actions"
import { createSupplierAction, createExpenseCategoryAction, updateSupplierAction, updateExpenseCategoryAction, deleteSupplierAction, deleteExpenseCategoryAction } from "@/action/extended-accounting-actions"
import { createPaymentSchema, updatePaymentSchema, createSupplierSchema, createExpenseCategorySchema, updateSupplierSchema, updateExpenseCategorySchema } from "@/validation/accounting-schema"
import { usePayments } from "@/hooks/payments-context"
import { ExtendedPaymentWithDetails } from "@/db/queries/extended-accounting"
import { CalendarIcon, Plus, Search, ArrowUpCircle, ArrowDownCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PaymentsClientProps {
    initialPayments: ExtendedPaymentWithDetails[]
    invoices: any[]
    suppliers: any[]
    expenseCategories: any[]
}

export function PaymentsClient({ initialPayments, invoices, suppliers, expenseCategories }: PaymentsClientProps) {
    const router = useRouter()
    const {
        payments,
        isLoading,
        createPayment,
        updatePayment,
        deletePayment,
        searchTerm,
        setSearchTerm,
        filteredPayments
    } = usePayments()

    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedPayment, setSelectedPayment] = useState<ExtendedPaymentWithDetails | null>(null)
    const [paymentToDelete, setPaymentToDelete] = useState<ExtendedPaymentWithDetails | null>(null)
    const [paymentType, setPaymentType] = useState<'incoming' | 'outgoing'>('incoming')

    // États pour les modals fournisseurs et catégories
    const [supplierDialogOpen, setSupplierDialogOpen] = useState(false)
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
    const [editSupplierDialogOpen, setEditSupplierDialogOpen] = useState(false)
    const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false)
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null)
    const [selectedCategory, setSelectedCategory] = useState<any>(null)

    // États pour les dialogs de suppression
    const [deleteSupplierDialogOpen, setDeleteSupplierDialogOpen] = useState(false)
    const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false)
    const [supplierToDelete, setSupplierToDelete] = useState<any>(null)
    const [categoryToDelete, setCategoryToDelete] = useState<any>(null)

    // Formulaire de création
    const createForm = useForm({
        resolver: zodResolver(createPaymentSchema),
        defaultValues: {
            type: 'incoming' as const,
            amount: 0,
            date: format(new Date(), "yyyy-MM-dd"),
            method: 'bank_transfer' as const,
            reference: "",
            description: "",
            notes: "",
            invoiceId: undefined,
            supplierId: undefined,
            expenseCategoryId: undefined,
        }
    })

    // Formulaire de modification
    const updateForm = useForm({
        resolver: zodResolver(updatePaymentSchema),
        defaultValues: {
            id: "",
            type: 'incoming' as const,
            amount: 0,
            date: "",
            method: 'bank_transfer' as const,
            reference: "",
            description: "",
            notes: "",
            invoiceId: undefined,
            supplierId: undefined,
            expenseCategoryId: undefined,
        }
    })

    // Formulaire pour créer un fournisseur
    const supplierForm = useForm({
        resolver: zodResolver(createSupplierSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            address: "",
            city: "",
            postalCode: "",
            country: "France",
            siret: "",
            vatNumber: "",
            notes: "",
            isActive: true,
        }
    })

    // Formulaire pour créer une catégorie de dépense
    const categoryForm = useForm({
        resolver: zodResolver(createExpenseCategorySchema),
        defaultValues: {
            name: "",
            description: "",
            color: "#3b82f6",
            isActive: true,
        }
    })

    // Formulaire pour modifier un fournisseur
    const editSupplierForm = useForm({
        resolver: zodResolver(updateSupplierSchema),
        defaultValues: {
            id: "",
            name: "",
            email: "",
            phone: "",
            address: "",
            city: "",
            postalCode: "",
            country: "France",
            siret: "",
            vatNumber: "",
            notes: "",
            isActive: true,
        }
    })

    // Formulaire pour modifier une catégorie de dépense
    const editCategoryForm = useForm({
        resolver: zodResolver(updateExpenseCategorySchema),
        defaultValues: {
            id: "",
            name: "",
            description: "",
            color: "#3b82f6",
            isActive: true,
        }
    })

    // Actions pour créer des fournisseurs et catégories
    const { execute: createSupplier, isPending: isCreatingSupplier } = useAction(createSupplierAction, {
        onSuccess: (data) => {
            toast.success("Fournisseur créé avec succès")
            setSupplierDialogOpen(false)
            supplierForm.reset()
            router.refresh()
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de la création du fournisseur")
        }
    })

    const { execute: createCategory, isPending: isCreatingCategory } = useAction(createExpenseCategoryAction, {
        onSuccess: (data) => {
            toast.success("Catégorie créée avec succès")
            setCategoryDialogOpen(false)
            categoryForm.reset()
            router.refresh()
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de la création de la catégorie")
        }
    })

    // Actions pour modifier des fournisseurs et catégories
    const { execute: updateSupplier, isPending: isUpdatingSupplier } = useAction(updateSupplierAction, {
        onSuccess: (data) => {
            toast.success("Fournisseur modifié avec succès")
            setEditSupplierDialogOpen(false)
            editSupplierForm.reset()
            router.refresh()
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de la modification du fournisseur")
        }
    })

    const { execute: updateCategory, isPending: isUpdatingCategory } = useAction(updateExpenseCategoryAction, {
        onSuccess: (data) => {
            toast.success("Catégorie modifiée avec succès")
            setEditCategoryDialogOpen(false)
            editCategoryForm.reset()
            router.refresh()
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de la modification de la catégorie")
        }
    })

    // Actions pour supprimer des fournisseurs et catégories
    const { execute: deleteSupplier, isPending: isDeletingSupplier } = useAction(deleteSupplierAction, {
        onSuccess: (data) => {
            toast.success("Fournisseur supprimé avec succès")
            setDeleteSupplierDialogOpen(false)
            setSupplierToDelete(null)
            router.refresh()
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de la suppression du fournisseur")
        }
    })

    const { execute: deleteCategory, isPending: isDeletingCategory } = useAction(deleteExpenseCategoryAction, {
        onSuccess: (data) => {
            toast.success("Catégorie supprimée avec succès")
            setDeleteCategoryDialogOpen(false)
            setCategoryToDelete(null)
            router.refresh()
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de la suppression de la catégorie")
        }
    })

    const onCreateSubmit = async (data: any) => {
        try {
            await createPayment(data)
            setCreateDialogOpen(false)
            createForm.reset()
        } catch (error) {
            console.error("Erreur lors de la création:", error)
        }
    }

    const onUpdateSubmit = async (data: any) => {
        try {
            await updatePayment(data)
            setEditDialogOpen(false)
            updateForm.reset()
        } catch (error) {
            console.error("Erreur lors de la modification:", error)
        }
    }

    const onSupplierSubmit = async (data: any) => {
        createSupplier(data)
    }

    const onCategorySubmit = async (data: any) => {
        createCategory(data)
    }

    const onSupplierEditSubmit = async (data: any) => {
        updateSupplier(data)
    }

    const onCategoryEditSubmit = async (data: any) => {
        updateCategory(data)
    }

    const handleEdit = (payment: ExtendedPaymentWithDetails) => {
        setSelectedPayment(payment)
        updateForm.reset({
            id: payment.id,
            type: payment.type,
            amount: payment.amount,
            date: format(payment.paymentDate, "yyyy-MM-dd"),
            method: payment.method,
            reference: payment.reference || "",
            description: payment.description,
            notes: payment.notes || "",
            invoiceId: payment.invoiceId || undefined,
            supplierId: payment.supplierId || undefined,
            expenseCategoryId: payment.expenseCategoryId || undefined,
        })
        setEditDialogOpen(true)
    }

    const handleDelete = (payment: ExtendedPaymentWithDetails) => {
        setPaymentToDelete(payment)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (paymentToDelete) {
            try {
                await deletePayment(paymentToDelete.id)
                setDeleteDialogOpen(false)
                setPaymentToDelete(null)
            } catch (error) {
                console.error("Erreur lors de la suppression:", error)
            }
        }
    }

    // Séparer les paiements par type
    const incomingPayments = filteredPayments.filter(p => p.type === 'incoming')
    const outgoingPayments = filteredPayments.filter(p => p.type === 'outgoing')

    const PaymentCard = ({ payment }: { payment: ExtendedPaymentWithDetails }) => (
        <Card key={payment.id} className="mb-4">
            <CardContent className="p-4">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            {payment.type === 'incoming' ? (
                                <ArrowDownCircle className="h-4 w-4 text-green-600" />
                            ) : (
                                <ArrowUpCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span className="font-medium">{payment.description}</span>
                            <Badge variant={payment.type === 'incoming' ? 'default' : 'destructive'} className={payment.type === 'incoming' ? 'bg-green-500' : 'bg-red-500'}>
                                {payment.type === 'incoming' ? 'Encaissement' : 'Décaissement'}
                            </Badge>
                        </div>

                        <div className="text-sm text-muted-foreground space-y-1">
                            <p><span className="font-medium">Montant:</span> {payment.amount.toFixed(2)} €</p>
                            <p><span className="font-medium">Date:</span> {format(payment.paymentDate, "dd/MM/yyyy")}</p>
                            <p><span className="font-medium">Méthode:</span> {payment.method}</p>
                            {payment.reference && (
                                <p><span className="font-medium">Référence:</span> {payment.reference}</p>
                            )}

                            {/* Informations contextuelles */}
                            {payment.invoice && (
                                <p><span className="font-medium">Facture:</span> {payment.invoice.number} - {payment.invoice.client.name}</p>
                            )}
                            {payment.supplier && (
                                <p><span className="font-medium">Fournisseur:</span> {payment.supplier.name}</p>
                            )}
                            {payment.expenseCategory && (
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Catégorie:</span>
                                    {payment.expenseCategory.color && (
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: payment.expenseCategory.color }}
                                        />
                                    )}
                                    <span>{payment.expenseCategory.name}</span>
                                </div>
                            )}

                            {payment.notes && (
                                <p><span className="font-medium">Notes:</span> {payment.notes}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(payment)}
                        >
                            <IconEdit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(payment)}
                        >
                            <IconTrash className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    const handleEditSupplier = (supplier: any) => {
        setSelectedSupplier(supplier)
        editSupplierForm.reset({
            id: supplier.id,
            name: supplier.name,
            email: supplier.email || "",
            phone: supplier.phone || "",
            address: supplier.address || "",
            city: supplier.city || "",
            postalCode: supplier.postalCode || "",
            country: supplier.country || "France",
            siret: supplier.siret || "",
            vatNumber: supplier.vatNumber || "",
            notes: supplier.notes || "",
            isActive: supplier.isActive,
        })
        setEditSupplierDialogOpen(true)
    }

    const handleEditCategory = (category: any) => {
        setSelectedCategory(category)
        editCategoryForm.reset({
            id: category.id,
            name: category.name,
            description: category.description || "",
            color: category.color || "#3b82f6",
            isActive: category.isActive,
        })
        setEditCategoryDialogOpen(true)
    }

    const handleDeleteSupplier = (supplier: any) => {
        setSupplierToDelete(supplier)
        setDeleteSupplierDialogOpen(true)
    }

    const handleDeleteCategory = (category: any) => {
        setCategoryToDelete(category)
        setDeleteCategoryDialogOpen(true)
    }

    const confirmDeleteSupplier = () => {
        if (supplierToDelete) {
            deleteSupplier({ id: supplierToDelete.id })
        }
    }

    const confirmDeleteCategory = () => {
        if (categoryToDelete) {
            deleteCategory({ id: categoryToDelete.id })
        }
    }

    const SupplierCard = ({ supplier }: { supplier: any }) => (
        <Card className="mb-4">
            <CardContent className="p-4">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <IconBuilding className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">{supplier.name}</span>
                            <Badge variant={supplier.isActive ? "default" : "secondary"}>
                                {supplier.isActive ? "Actif" : "Inactif"}
                            </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                            {supplier.email && <p><span className="font-medium">Email:</span> {supplier.email}</p>}
                            {supplier.phone && <p><span className="font-medium">Téléphone:</span> {supplier.phone}</p>}
                            {supplier.address && <p><span className="font-medium">Adresse:</span> {supplier.address}, {supplier.city} {supplier.postalCode}</p>}
                            {supplier.siret && <p><span className="font-medium">SIRET:</span> {supplier.siret}</p>}
                            {supplier.vatNumber && <p><span className="font-medium">TVA:</span> {supplier.vatNumber}</p>}
                            {supplier.notes && <p><span className="font-medium">Notes:</span> {supplier.notes}</p>}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditSupplier(supplier)}
                        >
                            <IconEdit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteSupplier(supplier)}
                        >
                            <IconTrash className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    const CategoryCard = ({ category }: { category: any }) => (
        <Card className="mb-4">
            <CardContent className="p-4">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            {category.color && (
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: category.color }}
                                />
                            )}
                            <span className="font-medium">{category.name}</span>
                            <Badge variant={category.isActive ? "default" : "secondary"}>
                                {category.isActive ? "Active" : "Inactive"}
                            </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                            {category.description && <p><span className="font-medium">Description:</span> {category.description}</p>}
                            <p><span className="font-medium">Couleur:</span> {category.color}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                        >
                            <IconEdit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteCategory(category)}
                        >
                            <IconTrash className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Paiements & Fournisseurs</h1>
                    <p className="text-muted-foreground">
                        Gérez vos encaissements et décaissements, vos fournisseurs et catégories de dépenses.
                    </p>
                </div>

                <div className="flex gap-2">
                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <IconPlus className="mr-2 h-4 w-4" />
                                Nouveau Paiement
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl min-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Créer un nouveau paiement</DialogTitle>
                            </DialogHeader>

                            <Form {...createForm}>
                                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                                    {/* Type de paiement */}
                                    <FormField
                                        control={createForm.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Type de paiement</FormLabel>
                                                <FormControl>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Sélectionner le type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="incoming">Encaissement (argent reçu)</SelectItem>
                                                            <SelectItem value="outgoing">Décaissement (argent payé)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Montant */}
                                        <FormField
                                            control={createForm.control}
                                            name="amount"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Montant</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            {...field}
                                                            value={field.value || ""}
                                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Date */}
                                        <FormField
                                            control={createForm.control}
                                            name="date"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Date</FormLabel>
                                                    <FormControl>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    className="w-full justify-start text-left font-normal"
                                                                >
                                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                                    {field.value ? format(new Date(field.value), "dd/MM/yyyy") : "Sélectionner une date"}
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0" align="start">
                                                                <Calendar
                                                                    mode="single"
                                                                    selected={field.value ? new Date(field.value) : undefined}
                                                                    onSelect={(date) => {
                                                                        field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                                                                    }}
                                                                    disabled={(date) =>
                                                                        date > new Date() || date < new Date("1900-01-01")
                                                                    }
                                                                    locale={frCalendar}
                                                                    initialFocus
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Description */}
                                    <FormField
                                        control={createForm.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Description du paiement" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Méthode */}
                                        <FormField
                                            control={createForm.control}
                                            name="method"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Méthode de paiement</FormLabel>
                                                    <FormControl>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Sélectionner la méthode" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                                                                <SelectItem value="check">Chèque</SelectItem>
                                                                <SelectItem value="cash">Espèces</SelectItem>
                                                                <SelectItem value="card">Carte bancaire</SelectItem>
                                                                <SelectItem value="other">Autre</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Référence */}
                                        <FormField
                                            control={createForm.control}
                                            name="reference"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Référence</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Numéro de chèque, référence..." />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Champs conditionnels selon le type */}
                                    {createForm.watch("type") === 'incoming' && (
                                        <FormField
                                            control={createForm.control}
                                            name="invoiceId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Facture</FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            onValueChange={(value) => field.onChange(value || undefined)}
                                                            value={field.value || undefined}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Sélectionner une facture (optionnel)" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {invoices.map((invoice) => (
                                                                    <SelectItem key={invoice.id} value={invoice.id}>
                                                                        {invoice.number} - {invoice.client.name} ({invoice.total}€)
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    {createForm.watch("type") === 'outgoing' && (
                                        <>
                                            <FormField
                                                control={createForm.control}
                                                name="supplierId"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Fournisseur</FormLabel>
                                                        <FormControl>
                                                            <Select
                                                                onValueChange={(value) => field.onChange(value || undefined)}
                                                                value={field.value || undefined}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Sélectionner un fournisseur (optionnel)" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {suppliers.map((supplier) => (
                                                                        <SelectItem key={supplier.id} value={supplier.id}>
                                                                            {supplier.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={createForm.control}
                                                name="expenseCategoryId"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Catégorie de dépense</FormLabel>
                                                        <FormControl>
                                                            <Select
                                                                onValueChange={(value) => field.onChange(value || undefined)}
                                                                value={field.value || undefined}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Sélectionner une catégorie (optionnel)" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {expenseCategories.map((category) => (
                                                                        <SelectItem key={category.id} value={category.id}>
                                                                            {category.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </>
                                    )}

                                    {/* Notes */}
                                    <FormField
                                        control={createForm.control}
                                        name="notes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Notes</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} placeholder="Notes additionnelles..." />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex justify-end gap-4">
                                        <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                                            Annuler
                                        </Button>
                                        <Button type="submit" disabled={isLoading}>
                                            {isLoading ? "Création..." : "Créer le paiement"}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <IconPlus className="mr-2 h-4 w-4" />
                                Créer
                                <IconChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSupplierDialogOpen(true)}>
                                <IconBuilding className="mr-2 h-4 w-4" />
                                Nouveau Fournisseur
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setCategoryDialogOpen(true)}>
                                <IconUser className="mr-2 h-4 w-4" />
                                Nouvelle Catégorie
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Barre de recherche */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Onglets principaux */}
            <Tabs defaultValue="payments" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="payments" className="flex items-center gap-2">
                        💰 Paiements
                        <Badge variant="outline" className="text-xs">
                            {filteredPayments.length}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="reference-data" className="flex items-center gap-2">
                        ⚙️ Données de référence
                        <Badge variant="secondary" className="text-xs">
                            {suppliers.length + expenseCategories.length}
                        </Badge>
                    </TabsTrigger>
                </TabsList>

                {/* Onglet Paiements */}
                <TabsContent value="payments" className="mt-6">
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList>
                            <TabsTrigger value="all">Tous ({filteredPayments.length})</TabsTrigger>
                            <TabsTrigger value="incoming">Encaissements ({incomingPayments.length})</TabsTrigger>
                            <TabsTrigger value="outgoing">Décaissements ({outgoingPayments.length})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all">
                            <div className="mt-6">
                                {filteredPayments.length === 0 ? (
                                    <Card>
                                        <CardContent className="p-8 text-center">
                                            <p className="text-muted-foreground">Aucun paiement trouvé.</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    filteredPayments.map((payment) => <PaymentCard key={payment.id} payment={payment} />)
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="incoming">
                            <div className="mt-6">
                                {incomingPayments.length === 0 ? (
                                    <Card>
                                        <CardContent className="p-8 text-center">
                                            <p className="text-muted-foreground">Aucun encaissement trouvé.</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    incomingPayments.map((payment) => <PaymentCard key={payment.id} payment={payment} />)
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="outgoing">
                            <div className="mt-6">
                                {outgoingPayments.length === 0 ? (
                                    <Card>
                                        <CardContent className="p-8 text-center">
                                            <p className="text-muted-foreground">Aucun décaissement trouvé.</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    outgoingPayments.map((payment) => <PaymentCard key={payment.id} payment={payment} />)
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </TabsContent>

                {/* Onglet Données de référence */}
                <TabsContent value="reference-data" className="mt-6">
                    <Tabs defaultValue="suppliers" className="w-full">
                        <TabsList>
                            <TabsTrigger value="suppliers" className="flex items-center gap-2">
                                🏢 Fournisseurs
                                <Badge variant="outline" className="text-xs">
                                    {suppliers.length}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger value="categories" className="flex items-center gap-2">
                                🏷️ Catégories
                                <Badge variant="outline" className="text-xs">
                                    {expenseCategories.length}
                                </Badge>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="suppliers">
                            <div className="mt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium">Gestion des fournisseurs</h3>
                                    <Button onClick={() => setSupplierDialogOpen(true)}>
                                        <IconPlus className="mr-2 h-4 w-4" />
                                        Nouveau Fournisseur
                                    </Button>
                                </div>
                                {suppliers.length === 0 ? (
                                    <Card>
                                        <CardContent className="p-8 text-center">
                                            <IconBuilding className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                            <h3 className="text-lg font-medium mb-2">Aucun fournisseur</h3>
                                            <p className="text-muted-foreground mb-4">
                                                Ajoutez votre premier fournisseur pour commencer à gérer vos décaissements.
                                            </p>
                                            <Button onClick={() => setSupplierDialogOpen(true)}>
                                                <IconPlus className="mr-2 h-4 w-4" />
                                                Ajouter un fournisseur
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid gap-4">
                                        {suppliers.map((supplier: any) => <SupplierCard key={supplier.id} supplier={supplier} />)}
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="categories">
                            <div className="mt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium">Gestion des catégories de dépenses</h3>
                                    <Button onClick={() => setCategoryDialogOpen(true)}>
                                        <IconPlus className="mr-2 h-4 w-4" />
                                        Nouvelle Catégorie
                                    </Button>
                                </div>
                                {expenseCategories.length === 0 ? (
                                    <Card>
                                        <CardContent className="p-8 text-center">
                                            <IconUser className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                            <h3 className="text-lg font-medium mb-2">Aucune catégorie</h3>
                                            <p className="text-muted-foreground mb-4">
                                                Créez des catégories pour mieux organiser vos dépenses.
                                            </p>
                                            <Button onClick={() => setCategoryDialogOpen(true)}>
                                                <IconPlus className="mr-2 h-4 w-4" />
                                                Créer une catégorie
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid gap-4">
                                        {expenseCategories.map((category: any) => <CategoryCard key={category.id} category={category} />)}
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </TabsContent>
            </Tabs>

            {/* Dialog de modification */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Modifier le paiement</DialogTitle>
                    </DialogHeader>

                    <Form {...updateForm}>
                        <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-4">
                            {/* Type de paiement */}
                            <FormField
                                control={updateForm.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type de paiement</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner le type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="incoming">Encaissement (argent reçu)</SelectItem>
                                                    <SelectItem value="outgoing">Décaissement (argent payé)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                {/* Montant */}
                                <FormField
                                    control={updateForm.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Montant</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    {...field}
                                                    value={field.value || ""}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Date */}
                                <FormField
                                    control={updateForm.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date</FormLabel>
                                            <FormControl>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className="w-full justify-start text-left font-normal"
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {field.value ? format(new Date(field.value), "dd/MM/yyyy") : "Sélectionner une date"}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value ? new Date(field.value) : undefined}
                                                            onSelect={(date) => {
                                                                field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                                                            }}
                                                            disabled={(date) =>
                                                                date > new Date() || date < new Date("1900-01-01")
                                                            }
                                                            locale={frCalendar}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Description */}
                            <FormField
                                control={updateForm.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Description du paiement" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                {/* Méthode */}
                                <FormField
                                    control={updateForm.control}
                                    name="method"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Méthode de paiement</FormLabel>
                                            <FormControl>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Sélectionner la méthode" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                                                        <SelectItem value="check">Chèque</SelectItem>
                                                        <SelectItem value="cash">Espèces</SelectItem>
                                                        <SelectItem value="card">Carte bancaire</SelectItem>
                                                        <SelectItem value="other">Autre</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Référence */}
                                <FormField
                                    control={updateForm.control}
                                    name="reference"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Référence</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Numéro de chèque, référence..." />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Champs conditionnels selon le type */}
                            {updateForm.watch("type") === 'incoming' && (
                                <FormField
                                    control={updateForm.control}
                                    name="invoiceId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Facture</FormLabel>
                                            <FormControl>
                                                <Select
                                                    onValueChange={(value) => field.onChange(value || undefined)}
                                                    value={field.value || undefined}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Sélectionner une facture (optionnel)" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {invoices.map((invoice) => (
                                                            <SelectItem key={invoice.id} value={invoice.id}>
                                                                {invoice.number} - {invoice.client.name} ({invoice.total}€)
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {updateForm.watch("type") === 'outgoing' && (
                                <>
                                    <FormField
                                        control={updateForm.control}
                                        name="supplierId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Fournisseur</FormLabel>
                                                <FormControl>
                                                    <Select
                                                        onValueChange={(value) => field.onChange(value || undefined)}
                                                        value={field.value || undefined}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Sélectionner un fournisseur (optionnel)" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {suppliers.map((supplier) => (
                                                                <SelectItem key={supplier.id} value={supplier.id}>
                                                                    {supplier.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={updateForm.control}
                                        name="expenseCategoryId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Catégorie de dépense</FormLabel>
                                                <FormControl>
                                                    <Select
                                                        onValueChange={(value) => field.onChange(value || undefined)}
                                                        value={field.value || undefined}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Sélectionner une catégorie (optionnel)" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {expenseCategories.map((category) => (
                                                                <SelectItem key={category.id} value={category.id}>
                                                                    {category.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}

                            {/* Notes */}
                            <FormField
                                control={updateForm.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notes</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Notes additionnelles..." />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                                    Annuler
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "Modification..." : "Modifier le paiement"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Dialog de confirmation de suppression */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Supprimer le paiement</DialogTitle>
                    </DialogHeader>

                    {paymentToDelete && (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Êtes-vous sûr de vouloir supprimer ce paiement ? Cette action est irréversible.
                            </p>

                            <div className="bg-muted p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    {paymentToDelete.type === 'incoming' ? (
                                        <ArrowDownCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <ArrowUpCircle className="h-4 w-4 text-red-600" />
                                    )}
                                    <span className="font-medium">{paymentToDelete.description}</span>
                                    <Badge variant={paymentToDelete.type === 'incoming' ? 'default' : 'destructive'}>
                                        {paymentToDelete.type === 'incoming' ? 'Encaissement' : 'Décaissement'}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-medium">Montant:</span> {paymentToDelete.amount.toFixed(2)} €
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-medium">Date:</span> {format(paymentToDelete.paymentDate, "dd/MM/yyyy")}
                                </p>
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setDeleteDialogOpen(false)
                                        setPaymentToDelete(null)
                                    }}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={confirmDelete}
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Suppression..." : "Supprimer"}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Dialog pour créer un fournisseur */}
            <Dialog open={supplierDialogOpen} onOpenChange={setSupplierDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Ajouter un fournisseur</DialogTitle>
                    </DialogHeader>

                    <Form {...supplierForm}>
                        <form onSubmit={supplierForm.handleSubmit(onSupplierSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={supplierForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nom du fournisseur *</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Nom du fournisseur" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={supplierForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="email" placeholder="email@exemple.com" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={supplierForm.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Téléphone</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="01 23 45 67 89" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={supplierForm.control}
                                    name="country"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Pays *</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="France" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={supplierForm.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Adresse</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="123 Rue de l'Exemple" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={supplierForm.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ville</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Paris" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={supplierForm.control}
                                    name="postalCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Code postal</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="75000" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={supplierForm.control}
                                    name="siret"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>SIRET</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="12345678901234" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={supplierForm.control}
                                    name="vatNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Numéro TVA</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="FR12345678901" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={supplierForm.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notes</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Notes sur le fournisseur..." />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" onClick={() => setSupplierDialogOpen(false)}>
                                    Annuler
                                </Button>
                                <Button type="submit" disabled={isCreatingSupplier}>
                                    {isCreatingSupplier ? "Création..." : "Créer le fournisseur"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Dialog pour créer une catégorie de dépense */}
            <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Ajouter une catégorie de dépense</DialogTitle>
                    </DialogHeader>

                    <Form {...categoryForm}>
                        <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-4">
                            <FormField
                                control={categoryForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nom de la catégorie *</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Nom de la catégorie" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={categoryForm.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Description de la catégorie..." />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={categoryForm.control}
                                name="color"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Couleur</FormLabel>
                                        <FormControl>
                                            <div className="flex gap-2 items-center">
                                                <Input
                                                    type="color"
                                                    {...field}
                                                    className="w-16 h-10"
                                                />
                                                <Input
                                                    {...field}
                                                    placeholder="#3b82f6"
                                                    className="flex-1"
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" onClick={() => setCategoryDialogOpen(false)}>
                                    Annuler
                                </Button>
                                <Button type="submit" disabled={isCreatingCategory}>
                                    {isCreatingCategory ? "Création..." : "Créer la catégorie"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Dialog pour modifier un fournisseur */}
            <Dialog open={editSupplierDialogOpen} onOpenChange={setEditSupplierDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Modifier le fournisseur</DialogTitle>
                    </DialogHeader>

                    <Form {...editSupplierForm}>
                        <form onSubmit={editSupplierForm.handleSubmit(onSupplierEditSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={editSupplierForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nom du fournisseur *</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Nom du fournisseur" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={editSupplierForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="email" placeholder="email@exemple.com" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={editSupplierForm.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Téléphone</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="01 23 45 67 89" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={editSupplierForm.control}
                                    name="country"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Pays *</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="France" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={editSupplierForm.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Adresse</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="123 Rue de l'Exemple" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={editSupplierForm.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ville</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Paris" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={editSupplierForm.control}
                                    name="postalCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Code postal</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="75000" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={editSupplierForm.control}
                                    name="siret"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>SIRET</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="12345678901234" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={editSupplierForm.control}
                                    name="vatNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Numéro TVA</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="FR12345678901" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={editSupplierForm.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notes</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Notes sur le fournisseur..." />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" onClick={() => setEditSupplierDialogOpen(false)}>
                                    Annuler
                                </Button>
                                <Button type="submit" disabled={isUpdatingSupplier}>
                                    {isUpdatingSupplier ? "Modification..." : "Modifier le fournisseur"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Dialog pour modifier une catégorie de dépense */}
            <Dialog open={editCategoryDialogOpen} onOpenChange={setEditCategoryDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Modifier la catégorie de dépense</DialogTitle>
                    </DialogHeader>

                    <Form {...editCategoryForm}>
                        <form onSubmit={editCategoryForm.handleSubmit(onCategoryEditSubmit)} className="space-y-4">
                            <FormField
                                control={editCategoryForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nom de la catégorie *</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Nom de la catégorie" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={editCategoryForm.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Description de la catégorie..." />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={editCategoryForm.control}
                                name="color"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Couleur</FormLabel>
                                        <FormControl>
                                            <div className="flex gap-2 items-center">
                                                <Input
                                                    type="color"
                                                    {...field}
                                                    className="w-16 h-10"
                                                />
                                                <Input
                                                    {...field}
                                                    placeholder="#3b82f6"
                                                    className="flex-1"
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" onClick={() => setEditCategoryDialogOpen(false)}>
                                    Annuler
                                </Button>
                                <Button type="submit" disabled={isUpdatingCategory}>
                                    {isUpdatingCategory ? "Modification..." : "Modifier la catégorie"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Dialog de confirmation de suppression de fournisseur */}
            <Dialog open={deleteSupplierDialogOpen} onOpenChange={setDeleteSupplierDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Supprimer le fournisseur</DialogTitle>
                    </DialogHeader>

                    {supplierToDelete && (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Êtes-vous sûr de vouloir supprimer ce fournisseur ? Cette action est irréversible.
                            </p>

                            <div className="bg-muted p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <IconBuilding className="h-4 w-4 text-blue-600" />
                                    <span className="font-medium">{supplierToDelete.name}</span>
                                    <Badge variant={supplierToDelete.isActive ? "default" : "secondary"}>
                                        {supplierToDelete.isActive ? "Actif" : "Inactif"}
                                    </Badge>
                                </div>
                                {supplierToDelete.email && (
                                    <p className="text-sm text-muted-foreground">
                                        <span className="font-medium">Email:</span> {supplierToDelete.email}
                                    </p>
                                )}
                                {supplierToDelete.phone && (
                                    <p className="text-sm text-muted-foreground">
                                        <span className="font-medium">Téléphone:</span> {supplierToDelete.phone}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setDeleteSupplierDialogOpen(false)
                                        setSupplierToDelete(null)
                                    }}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={confirmDeleteSupplier}
                                    disabled={isDeletingSupplier}
                                >
                                    {isDeletingSupplier ? "Suppression..." : "Supprimer"}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Dialog de confirmation de suppression de catégorie */}
            <Dialog open={deleteCategoryDialogOpen} onOpenChange={setDeleteCategoryDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Supprimer la catégorie</DialogTitle>
                    </DialogHeader>

                    {categoryToDelete && (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible.
                            </p>

                            <div className="bg-muted p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    {categoryToDelete.color && (
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: categoryToDelete.color }}
                                        />
                                    )}
                                    <span className="font-medium">{categoryToDelete.name}</span>
                                    <Badge variant={categoryToDelete.isActive ? "default" : "secondary"}>
                                        {categoryToDelete.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                                {categoryToDelete.description && (
                                    <p className="text-sm text-muted-foreground">
                                        <span className="font-medium">Description:</span> {categoryToDelete.description}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setDeleteCategoryDialogOpen(false)
                                        setCategoryToDelete(null)
                                    }}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={confirmDeleteCategory}
                                    disabled={isDeletingCategory}
                                >
                                    {isDeletingCategory ? "Suppression..." : "Supprimer"}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
} 
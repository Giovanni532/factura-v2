"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
    IconPlus,
    IconSearch,
    IconCalendar as IconCalendarTabler,
    IconChevronDown,
    IconLoader2
} from "@tabler/icons-react"
import { CalendarIcon, Plus, Search } from "lucide-react"

// Composants refactorisés
import { PaymentsSection } from "./payments-section"
import { SuppliersSection } from "./suppliers-section"
import { CategoriesSection } from "./categories-section"

// Hooks
import { usePayments } from "@/hooks/payments-context"
import { useSuppliers } from "@/hooks/use-suppliers"
import { useCategories } from "@/hooks/use-categories"

// Actions et validations
import { createPaymentAction, updatePaymentAction, deletePaymentAction } from "@/action/accounting-actions"
import { createSupplierAction, createExpenseCategoryAction, updateSupplierAction, updateExpenseCategoryAction, deleteSupplierAction, deleteExpenseCategoryAction } from "@/action/extended-accounting-actions"
import { createPaymentSchema, updatePaymentSchema, createSupplierSchema, createExpenseCategorySchema, updateSupplierSchema, updateExpenseCategorySchema } from "@/validation/accounting-schema"
import { ExtendedPaymentWithDetails } from "@/db/queries/extended-accounting"

interface PaymentsClientProps {
    initialPayments: ExtendedPaymentWithDetails[]
    invoices: any[]
    suppliers: any[]
    expenseCategories: any[]
}

export function PaymentsClient({ initialPayments, invoices, suppliers, expenseCategories }: PaymentsClientProps) {
    // États principaux
    const [activeTab, setActiveTab] = useState("payments")
    const [activeSubTab, setActiveSubTab] = useState("all")
    const [searchTerm, setSearchTerm] = useState("")

    // Modals
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedPayment, setSelectedPayment] = useState<ExtendedPaymentWithDetails | null>(null)
    const [paymentToDelete, setPaymentToDelete] = useState<ExtendedPaymentWithDetails | null>(null)
    const [paymentType, setPaymentType] = useState<'incoming' | 'outgoing'>('incoming')

    // Hooks personnalisés
    const { payments, filteredPayments, createPayment, updatePayment, deletePayment } = usePayments()
    const { suppliers: currentSuppliers, createSupplier, updateSupplier, deleteSupplier } = useSuppliers(suppliers)
    const { categories: currentCategories, createCategory, updateCategory, deleteCategory } = useCategories(expenseCategories)

    // Formulaires
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

    const categoryForm = useForm({
        resolver: zodResolver(createExpenseCategorySchema),
        defaultValues: {
            name: "",
            description: "",
            color: "#3b82f6",
            isActive: true,
        }
    })

    // Actions
    const { execute: performCreatePayment, isPending: isCreatingPayment } = useAction(createPaymentAction, {
        onSuccess: () => {
            toast.success("Paiement créé avec succès")
            setCreateDialogOpen(false)
            createForm.reset()
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de la création du paiement")
        }
    })

    const { execute: performUpdatePayment, isPending: isUpdatingPayment } = useAction(updatePaymentAction, {
        onSuccess: () => {
            toast.success("Paiement modifié avec succès")
            setEditDialogOpen(false)
            updateForm.reset()
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de la modification du paiement")
        }
    })

    const { execute: performDeletePayment, isPending: isDeletingPayment } = useAction(deletePaymentAction, {
        onSuccess: () => {
            toast.success("Paiement supprimé avec succès")
            setDeleteDialogOpen(false)
            setPaymentToDelete(null)
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de la suppression du paiement")
        }
    })

    // Filtrage des paiements
    const filtered = filteredPayments.filter(payment => {
        const matchesSearch = payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.notes?.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesSearch
    })

    const incomingPayments = filtered.filter(p => p.type === 'incoming')
    const outgoingPayments = filtered.filter(p => p.type === 'outgoing')

    // Gestionnaires d'événements
    const handleCreatePayment = async (data: any) => {
        await performCreatePayment(data)
    }

    const handleUpdatePayment = async (data: any) => {
        await performUpdatePayment(data)
    }

    const handleDeletePayment = async () => {
        if (paymentToDelete) {
            await performDeletePayment({ id: paymentToDelete.id })
        }
    }

    const handleEditPayment = (payment: ExtendedPaymentWithDetails) => {
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

    const handleDeletePaymentClick = (payment: ExtendedPaymentWithDetails) => {
        setPaymentToDelete(payment)
        setDeleteDialogOpen(true)
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Paiements & Fournisseurs</h1>
                    <p className="text-muted-foreground">
                        Gérez vos encaissements et décaissements, vos fournisseurs et catégories de dépenses.
                    </p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 w-64"
                        />
                    </div>
                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Nouveau paiement
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Nouveau paiement</DialogTitle>
                            </DialogHeader>
                            {/* Formulaire de création de paiement */}
                            <Form {...createForm}>
                                <form onSubmit={createForm.handleSubmit(handleCreatePayment)} className="space-y-4">
                                    {/* Champs du formulaire */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={createForm.control}
                                            name="type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Type</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Type de paiement" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="incoming">Encaissement</SelectItem>
                                                            <SelectItem value="outgoing">Décaissement</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={createForm.control}
                                            name="amount"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Montant (€)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            placeholder="0.00"
                                                            {...field}
                                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                        />
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
                                                    <Input placeholder="Description du paiement" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                                            Annuler
                                        </Button>
                                        <Button type="submit" disabled={isCreatingPayment}>
                                            {isCreatingPayment && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Créer
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="payments" className="flex items-center gap-2">
                        💰 Paiements
                        <Badge variant="secondary" className="ml-auto">
                            {filtered.length}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="reference" className="flex items-center gap-2">
                        ⚙️ Données de référence
                        <Badge variant="secondary" className="ml-auto">
                            {currentSuppliers.length + currentCategories.length}
                        </Badge>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="payments">
                    <PaymentsSection
                        filteredPayments={filtered}
                        incomingPayments={incomingPayments}
                        outgoingPayments={outgoingPayments}
                        onEdit={handleEditPayment}
                        onDelete={handleDeletePaymentClick}
                    />
                </TabsContent>

                <TabsContent value="reference">
                    <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
                        <TabsList>
                            <TabsTrigger value="suppliers" className="flex items-center gap-2">
                                🏢 Fournisseurs
                                <Badge variant="secondary">{currentSuppliers.length}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="categories" className="flex items-center gap-2">
                                🏷️ Catégories
                                <Badge variant="secondary">{currentCategories.length}</Badge>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="suppliers">
                            <SuppliersSection
                                suppliers={currentSuppliers}
                                onEdit={(supplier) => {/* TODO: Implement edit supplier */ }}
                                onDelete={(supplier) => {/* TODO: Implement delete supplier */ }}
                            />
                        </TabsContent>

                        <TabsContent value="categories">
                            <CategoriesSection
                                categories={currentCategories}
                                onEdit={(category) => {/* TODO: Implement edit category */ }}
                                onDelete={(category) => {/* TODO: Implement delete category */ }}
                            />
                        </TabsContent>
                    </Tabs>
                </TabsContent>
            </Tabs>

            {/* Dialog de suppression */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmer la suppression</DialogTitle>
                    </DialogHeader>
                    <p>Êtes-vous sûr de vouloir supprimer ce paiement ?</p>
                    {paymentToDelete && (
                        <div className="bg-muted p-4 rounded-md">
                            <p><strong>Description:</strong> {paymentToDelete.description}</p>
                            <p><strong>Montant:</strong> {paymentToDelete.amount}€</p>
                            <p><strong>Date:</strong> {format(paymentToDelete.paymentDate, "dd/MM/yyyy")}</p>
                        </div>
                    )}
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Annuler
                        </Button>
                        <Button variant="destructive" onClick={handleDeletePayment} disabled={isDeletingPayment}>
                            {isDeletingPayment && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Supprimer
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
} 
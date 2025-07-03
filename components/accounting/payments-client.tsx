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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
    IconLoader2
} from "@tabler/icons-react"
import { createPaymentAction, updatePaymentAction, deletePaymentAction } from "@/action/accounting-actions"
import { createPaymentSchema, updatePaymentSchema } from "@/validation/accounting-schema"
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

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Paiements</h1>
                    <p className="text-muted-foreground">
                        Gérez vos encaissements et décaissements.
                    </p>
                </div>

                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <IconPlus className="mr-2 h-4 w-4" />
                            Nouveau Paiement
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
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
            </div>

            {/* Barre de recherche */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        placeholder="Rechercher des paiements..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Onglets pour séparer les types de paiements */}
            <Tabs defaultValue="all" className="w-full">
                <TabsList>
                    <TabsTrigger value="all">Tous les paiements</TabsTrigger>
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
        </div>
    )
} 
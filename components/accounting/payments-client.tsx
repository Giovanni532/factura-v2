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
    IconCash,
    IconCreditCard,
    IconCalendar,
    IconUser,
    IconBuilding
} from "@tabler/icons-react"
import { createPaymentAction, updatePaymentAction, deletePaymentAction } from "@/action/accounting-actions"
import { createPaymentSchema, updatePaymentSchema } from "@/validation/accounting-schema"

interface PaymentWithDetails {
    id: string
    invoiceId: string
    amount: number
    paymentDate: Date
    method: string
    reference?: string | null
    notes?: string | null
    type: "incoming" | "outgoing"
    status: "pending" | "completed" | "cancelled"
    invoice: {
        number: string
        client: {
            name: string
        }
    }
}

interface PaymentsClientProps {
    payments: PaymentWithDetails[]
}

export function PaymentsClient({ payments }: PaymentsClientProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [localPayments, setLocalPayments] = useState(payments)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [editingPayment, setEditingPayment] = useState<PaymentWithDetails | null>(null)
    const [viewingPayment, setViewingPayment] = useState<PaymentWithDetails | null>(null)

    // Formulaires
    const createForm = useForm({
        resolver: zodResolver(createPaymentSchema),
        defaultValues: {
            number: "",
            date: "",
            type: "incoming" as const,
            amount: 0,
            status: "pending" as const,
            method: "bank_transfer" as const,
            reference: "",
            description: "",
            clientId: "",
            supplierId: "",
            accountId: "",
        }
    })

    const updateForm = useForm({
        resolver: zodResolver(updatePaymentSchema),
        defaultValues: {
            id: "",
            number: "",
            date: "",
            type: "incoming" as const,
            amount: 0,
            status: "pending" as const,
            method: "bank_transfer" as const,
            reference: "",
            description: "",
            clientId: "",
            supplierId: "",
            accountId: "",
        }
    })

    // Actions
    const { execute: executeCreate, isPending: isCreating } = useAction(createPaymentAction, {
        onSuccess: (data) => {
            toast.success("Paiement créé avec succès")
            if (data.data?.payment) {
                const newPayment: PaymentWithDetails = {
                    ...data.data.payment,
                    type: "incoming",
                    status: "pending",
                    invoice: {
                        number: "",
                        client: { name: "" }
                    }
                }
                setLocalPayments((prev) => [...prev, newPayment])
            }
            setIsCreateDialogOpen(false)
            createForm.reset()
        },
        onError: () => {
            toast.error("Erreur lors de la création du paiement")
        }
    })

    const { execute: executeUpdate, isPending: isUpdating } = useAction(updatePaymentAction, {
        onSuccess: (data) => {
            toast.success("Paiement mis à jour avec succès")
            if (data.data?.payment) {
                const updatedPayment: PaymentWithDetails = {
                    ...data.data.payment,
                    type: editingPayment?.type || "incoming",
                    status: editingPayment?.status || "pending",
                    invoice: editingPayment?.invoice || {
                        number: "",
                        client: { name: "" }
                    }
                }
                setLocalPayments((prev) => prev.map(p => p.id === updatedPayment.id ? updatedPayment : p))
            }
            setEditingPayment(null)
            updateForm.reset()
        },
        onError: () => {
            toast.error("Erreur lors de la mise à jour du paiement")
        }
    })

    const { execute: executeDelete, isPending: isDeleting } = useAction(deletePaymentAction, {
        onSuccess: () => {
            toast.success("Paiement supprimé avec succès")
            if (editingPayment) {
                setLocalPayments((prev) => prev.filter(p => p.id !== editingPayment.id))
            }
            setEditingPayment(null)
        },
        onError: () => {
            toast.error("Erreur lors de la suppression du paiement")
        }
    })

    const handleCreate = (data: any) => {
        executeCreate(data)
    }

    const handleUpdate = (data: any) => {
        executeUpdate(data)
    }

    const handleDelete = (payment: PaymentWithDetails) => {
        setEditingPayment(payment)
        executeDelete({ id: payment.id })
    }

    const openEditDialog = (payment: PaymentWithDetails) => {
        setEditingPayment(payment)
        updateForm.reset({
            id: payment.id,
            number: "",
            date: payment.paymentDate.toISOString().split('T')[0],
            type: payment.type,
            amount: payment.amount,
            status: payment.status,
            method: payment.method as any,
            reference: payment.reference || "",
            description: payment.notes || "",
            clientId: "",
            supplierId: "",
            accountId: "",
        })
    }

    const filteredPayments = localPayments.filter(payment =>
        payment.invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.invoice.client.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusColor = (status: PaymentWithDetails["status"]) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800"
            case "pending":
                return "bg-yellow-100 text-yellow-800"
            case "cancelled":
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const getStatusLabel = (status: PaymentWithDetails["status"]) => {
        switch (status) {
            case "completed":
                return "Terminé"
            case "pending":
                return "En attente"
            case "cancelled":
                return "Annulé"
            default:
                return status
        }
    }

    const getMethodLabel = (method: PaymentWithDetails["method"]) => {
        switch (method) {
            case "bank_transfer":
                return "Virement"
            case "check":
                return "Chèque"
            case "cash":
                return "Espèces"
            case "card":
                return "Carte"
            default:
                return method
        }
    }

    const getTypeColor = (type: PaymentWithDetails["type"]) => {
        return type === "incoming" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
    }

    const getTypeLabel = (type: PaymentWithDetails["type"]) => {
        return type === "incoming" ? "Entrant" : "Sortant"
    }

    return (
        <div className="space-y-6">
            {/* Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <Input
                            placeholder="Rechercher un paiement..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-64"
                        />
                        <IconSearch className="h-4 w-4 text-muted-foreground" />
                    </div>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <IconPlus className="h-4 w-4 mr-2" />
                            Nouveau paiement
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Créer un nouveau paiement</DialogTitle>
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
                                                    <Input placeholder="PAY-001" {...field} />
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
                                                            <SelectValue placeholder="Sélectionner un type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="incoming">Entrant</SelectItem>
                                                        <SelectItem value="outgoing">Sortant</SelectItem>
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
                                                <FormLabel>Montant</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.01" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={createForm.control}
                                        name="method"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Méthode</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Sélectionner une méthode" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="bank_transfer">Virement</SelectItem>
                                                        <SelectItem value="check">Chèque</SelectItem>
                                                        <SelectItem value="cash">Espèces</SelectItem>
                                                        <SelectItem value="card">Carte</SelectItem>
                                                    </SelectContent>
                                                </Select>
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
                                                        <SelectItem value="pending">En attente</SelectItem>
                                                        <SelectItem value="completed">Terminé</SelectItem>
                                                        <SelectItem value="cancelled">Annulé</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={createForm.control}
                                    name="reference"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Référence</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Référence du paiement" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={createForm.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Description du paiement" {...field} />
                                            </FormControl>
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

            {/* Liste des paiements */}
            <Card>
                <CardHeader>
                    <CardTitle>Paiements</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredPayments.map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center space-x-4">
                                    <div className="p-2 bg-muted rounded-lg">
                                        <IconCash className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <span className="font-medium">{payment.invoice.number}</span>
                                            <Badge variant="secondary" className={getStatusColor(payment.status)}>
                                                {getStatusLabel(payment.status)}
                                            </Badge>
                                            <Badge variant="outline" className={getTypeColor(payment.type)}>
                                                {getTypeLabel(payment.type)}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{payment.notes}</p>
                                        <div className="flex items-center space-x-4 mt-1">
                                            <div className="flex items-center space-x-1">
                                                {payment.type === "incoming" ? (
                                                    <IconUser className="h-3 w-3 text-muted-foreground" />
                                                ) : (
                                                    <IconBuilding className="h-3 w-3 text-muted-foreground" />
                                                )}
                                                <span className="text-xs text-muted-foreground">
                                                    {payment.invoice.client.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <IconCalendar className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(payment.paymentDate).toLocaleDateString('fr-FR')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="text-right">
                                        <div className="font-medium">
                                            {payment.type === "incoming" ? "+" : "-"}
                                            {payment.amount.toLocaleString('fr-FR', {
                                                style: 'currency',
                                                currency: 'EUR'
                                            })}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {getMethodLabel(payment.method)} - {payment.reference}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setViewingPayment(payment)}
                                        >
                                            <IconEye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openEditDialog(payment)}
                                        >
                                            <IconEdit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(payment)}
                                            disabled={isDeleting}
                                        >
                                            <IconTrash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Dialog de modification */}
            <Dialog open={!!editingPayment} onOpenChange={() => setEditingPayment(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Modifier le paiement</DialogTitle>
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
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={updateForm.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Type</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="incoming">Entrant</SelectItem>
                                                    <SelectItem value="outgoing">Sortant</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={updateForm.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Montant</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={updateForm.control}
                                    name="method"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Méthode</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="bank_transfer">Virement</SelectItem>
                                                    <SelectItem value="check">Chèque</SelectItem>
                                                    <SelectItem value="cash">Espèces</SelectItem>
                                                    <SelectItem value="card">Carte</SelectItem>
                                                </SelectContent>
                                            </Select>
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
                                                    <SelectItem value="pending">En attente</SelectItem>
                                                    <SelectItem value="completed">Terminé</SelectItem>
                                                    <SelectItem value="cancelled">Annulé</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={updateForm.control}
                                name="reference"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Référence</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setEditingPayment(null)}>
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
            <Dialog open={!!viewingPayment} onOpenChange={() => setViewingPayment(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Détails du paiement</DialogTitle>
                    </DialogHeader>
                    {viewingPayment && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Numéro</label>
                                    <p className="text-sm text-muted-foreground">{viewingPayment.invoice.number}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Date</label>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(viewingPayment.paymentDate).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Type</label>
                                    <p className="text-sm text-muted-foreground">{getTypeLabel(viewingPayment.type)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Montant</label>
                                    <p className="text-sm text-muted-foreground">
                                        {viewingPayment.amount.toLocaleString('fr-FR', {
                                            style: 'currency',
                                            currency: 'EUR'
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Méthode</label>
                                    <p className="text-sm text-muted-foreground">{getMethodLabel(viewingPayment.method)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Statut</label>
                                    <p className="text-sm text-muted-foreground">{getStatusLabel(viewingPayment.status)}</p>
                                </div>
                            </div>
                            {viewingPayment.reference && (
                                <div>
                                    <label className="text-sm font-medium">Référence</label>
                                    <p className="text-sm text-muted-foreground">{viewingPayment.reference}</p>
                                </div>
                            )}
                            {viewingPayment.notes && (
                                <div>
                                    <label className="text-sm font-medium">Description</label>
                                    <p className="text-sm text-muted-foreground">{viewingPayment.notes}</p>
                                </div>
                            )}
                            <div>
                                <label className="text-sm font-medium">Client</label>
                                <p className="text-sm text-muted-foreground">{viewingPayment.invoice.client.name}</p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
} 
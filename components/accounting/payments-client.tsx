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
    IconCash,
    IconCreditCard,
    IconCalendar,
    IconUser,
    IconBuilding
} from "@tabler/icons-react"
import { createPaymentAction, updatePaymentAction, deletePaymentAction } from "@/action/accounting-actions"

interface PaymentWithDetails {
    id: string
    invoiceId: string
    amount: number
    paymentDate: Date
    method: string
    reference?: string | null
    notes?: string | null
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

    // Mutations
    const handleCreate = async (data: any) => {
        const res = await createPaymentAction(data)
        if (res?.data?.success) {
            setLocalPayments((prev) => [...prev, res.data.payment as PaymentWithDetails])
        }
    }
    const handleUpdate = async (id: string, data: any) => {
        const res = await updatePaymentAction({ id, ...data })
        if (res.success) {
            setLocalPayments((prev) => prev.map(p => p.id === id ? res.payment : p))
        }
    }
    const handleDelete = async (id: string) => {
        const res = await deletePaymentAction({ id })
        if (res.success) {
            setLocalPayments((prev) => prev.filter(p => p.id !== id))
        }
    }

    const filteredPayments = localPayments.filter(payment =>
        payment.invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.invoice.client.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusColor = (status: PaymentWithDetails["paymentDate"] extends Date ? "completed" | "pending" | "cancelled" : never) => {
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

    const getStatusLabel = (status: PaymentWithDetails["paymentDate"] extends Date ? "completed" | "pending" | "cancelled" : never) => {
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
                <Button>
                    <IconPlus className="h-4 w-4 mr-2" />
                    Nouveau paiement
                </Button>
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
                                            <Badge variant="secondary" className={getStatusColor(payment.paymentDate as Date)}>
                                                {getStatusLabel(payment.paymentDate as Date)}
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
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 
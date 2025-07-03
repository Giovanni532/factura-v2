"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ExtendedPaymentWithDetails } from '@/db/queries/extended-accounting'
import { useAction } from 'next-safe-action/hooks'
import { createExtendedPaymentAction, updateExtendedPaymentAction, deleteExtendedPaymentAction } from '@/action/extended-accounting-actions'
import { toast } from 'sonner'

interface PaymentsContextType {
    payments: ExtendedPaymentWithDetails[]
    setPayments: (payments: ExtendedPaymentWithDetails[]) => void
    isLoading: boolean
    setIsLoading: (loading: boolean) => void
    refreshPayments: () => void
    createPayment: (data: any) => Promise<void>
    updatePayment: (data: any) => Promise<void>
    deletePayment: (id: string) => Promise<void>
    searchTerm: string
    setSearchTerm: (term: string) => void
    filteredPayments: ExtendedPaymentWithDetails[]
}

const PaymentsContext = createContext<PaymentsContextType | undefined>(undefined)

export function usePayments() {
    const context = useContext(PaymentsContext)
    if (!context) {
        throw new Error('usePayments must be used within a PaymentsProvider')
    }
    return context
}

interface PaymentsProviderProps {
    children: ReactNode
    initialPayments: ExtendedPaymentWithDetails[]
}

export function PaymentsProvider({ children, initialPayments }: PaymentsProviderProps) {
    const [payments, setPayments] = useState<ExtendedPaymentWithDetails[]>(initialPayments)
    const [isLoading, setIsLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    // Actions
    const { execute: executeCreate, isPending: isCreating } = useAction(createExtendedPaymentAction, {
        onSuccess: (data) => {
            toast.success("Paiement créé avec succès")
            refreshPayments()
        },
        onError: (error) => {
            toast.error("Erreur lors de la création du paiement")
            console.error("Error creating payment:", error)
        }
    })

    const { execute: executeUpdate, isPending: isUpdating } = useAction(updateExtendedPaymentAction, {
        onSuccess: (data) => {
            toast.success("Paiement mis à jour avec succès")
            refreshPayments()
        },
        onError: (error) => {
            toast.error("Erreur lors de la mise à jour du paiement")
            console.error("Error updating payment:", error)
        }
    })

    const { execute: executeDelete, isPending: isDeleting } = useAction(deleteExtendedPaymentAction, {
        onSuccess: () => {
            toast.success("Paiement supprimé avec succès")
            refreshPayments()
        },
        onError: (error) => {
            toast.error("Erreur lors de la suppression du paiement")
            console.error("Error deleting payment:", error)
        }
    })

    const refreshPayments = async () => {
        setIsLoading(true)
        try {
            // Recharger la page pour récupérer les nouvelles données
            window.location.reload()
        } catch (error) {
            console.error("Error refreshing payments:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const createPayment = async (data: any) => {
        await executeCreate(data)
    }

    const updatePayment = async (data: any) => {
        await executeUpdate(data)
    }

    const deletePayment = async (id: string) => {
        await executeDelete({ id })
    }

    // Filtrer les paiements selon le terme de recherche
    const filteredPayments = payments.filter(payment =>
        payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (payment.invoice?.number && payment.invoice.number.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (payment.invoice?.client?.name && payment.invoice.client.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (payment.supplier?.name && payment.supplier.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (payment.expenseCategory?.name && payment.expenseCategory.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (payment.reference && payment.reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (payment.notes && payment.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    const value: PaymentsContextType = {
        payments,
        setPayments,
        isLoading: isLoading || isCreating || isUpdating || isDeleting,
        setIsLoading,
        refreshPayments,
        createPayment,
        updatePayment,
        deletePayment,
        searchTerm,
        setSearchTerm,
        filteredPayments
    }

    return (
        <PaymentsContext.Provider value={value}>
            {children}
        </PaymentsContext.Provider>
    )
} 
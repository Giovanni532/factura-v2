"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ExtendedPaymentWithDetails } from '@/db/queries/extended-accounting'
import { useAction } from 'next-safe-action/hooks'
import { createExtendedPaymentAction, updateExtendedPaymentAction, deleteExtendedPaymentAction } from '@/action/extended-accounting-actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

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
    const router = useRouter()
    const [payments, setPayments] = useState<ExtendedPaymentWithDetails[]>(initialPayments)
    const [isLoading, setIsLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    // Actions avec optimistic updates
    const { execute: executeCreate, isPending: isCreating } = useAction(createExtendedPaymentAction, {
        onSuccess: (data) => {
            toast.success("Paiement créé avec succès")
            // Ajouter le nouveau paiement au state local
            const paymentData = data.data;
            if (paymentData && paymentData.payment) {
                setPayments(prev => [paymentData.payment, ...prev])
            }
            // Rafraîchir en arrière-plan pour synchroniser
            router.refresh()
        },
        onError: (error) => {
            toast.error("Erreur lors de la création du paiement")
            console.error("Error creating payment:", error)
        }
    })

    const { execute: executeUpdate, isPending: isUpdating } = useAction(updateExtendedPaymentAction, {
        onSuccess: (data) => {
            toast.success("Paiement mis à jour avec succès")
            // Mettre à jour le paiement dans le state local
            const paymentData = data.data;
            if (paymentData && paymentData.payment) {
                setPayments(prev => prev.map(payment =>
                    payment.id === paymentData.payment.id ? paymentData.payment : payment
                ))
            }
            // Rafraîchir en arrière-plan pour synchroniser
            router.refresh()
        },
        onError: (error) => {
            toast.error("Erreur lors de la mise à jour du paiement")
            console.error("Error updating payment:", error)
        }
    })

    const { execute: executeDelete, isPending: isDeleting } = useAction(deleteExtendedPaymentAction, {
        onSuccess: (data) => {
            toast.success("Paiement supprimé avec succès")
            // Supprimer le paiement du state local en utilisant l'ID retourné
            const deletedData = data.data;
            if (deletedData && deletedData.id) {
                setPayments(prev => prev.filter(payment => payment.id !== deletedData.id))
            }
            // Rafraîchir en arrière-plan pour synchroniser
            router.refresh()
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
            router.refresh()
        } catch (error) {
            console.error("Error refreshing payments:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const createPayment = async (data: any) => {
        executeCreate(data)
    }

    const updatePayment = async (data: any) => {
        executeUpdate(data)
    }

    const deletePayment = async (id: string) => {
        executeDelete({ id })
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
"use client"

import { useOptimistic, startTransition } from "react"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
    createFiscalYearAction,
    updateFiscalYearAction,
    deleteFiscalYearAction
} from "@/action/accounting-actions"

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

export function useFiscalYears(initialFiscalYears: FiscalYearWithStats[] = []) {
    const router = useRouter()

    const [fiscalYears, setFiscalYears] = useOptimistic(
        initialFiscalYears,
        (state, action: { type: string; payload: any }) => {
            switch (action.type) {
                case "create":
                    return [action.payload, ...state]
                case "update":
                    return state.map(fiscalYear =>
                        fiscalYear.id === action.payload.id ? action.payload : fiscalYear
                    )
                case "delete":
                    return state.filter(fiscalYear => fiscalYear.id !== action.payload.id)
                default:
                    return state
            }
        }
    )

    const { execute: createFiscalYear, isPending: isCreating } = useAction(createFiscalYearAction, {
        onSuccess: (data) => {
            toast.success("Exercice fiscal créé avec succès")
            router.refresh()
        },
        onError: (error) => {
            toast.error("Erreur lors de la création de l'exercice fiscal")
            console.error("Error creating fiscal year:", error)
        }
    })

    const { execute: updateFiscalYear, isPending: isUpdating } = useAction(updateFiscalYearAction, {
        onSuccess: (data) => {
            toast.success("Exercice fiscal mis à jour avec succès")
            router.refresh()
        },
        onError: (error) => {
            toast.error("Erreur lors de la mise à jour de l'exercice fiscal")
            console.error("Error updating fiscal year:", error)
        }
    })

    const { execute: deleteFiscalYear, isPending: isDeleting } = useAction(deleteFiscalYearAction, {
        onSuccess: () => {
            toast.success("Exercice fiscal supprimé avec succès")
            router.refresh()
        },
        onError: (error) => {
            toast.error("Erreur lors de la suppression de l'exercice fiscal")
            console.error("Error deleting fiscal year:", error)
        }
    })

    const handleCreate = async (data: any) => {
        const optimisticFiscalYear = {
            id: Date.now().toString(),
            ...data,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            isClosed: data.status === 'closed',
            totalRevenue: 0,
            totalExpenses: 0,
            netIncome: 0
        }

        startTransition(() => {
            setFiscalYears({ type: "create", payload: optimisticFiscalYear })
        })
        await createFiscalYear(data)
    }

    const handleUpdate = async (data: any) => {
        // Trouver l'exercice existant pour préserver les stats
        const existingFiscalYear = fiscalYears.find(fy => fy.id === data.id)

        const optimisticFiscalYear = {
            ...existingFiscalYear,
            ...data,
            startDate: data.startDate ? new Date(data.startDate) : existingFiscalYear?.startDate,
            endDate: data.endDate ? new Date(data.endDate) : existingFiscalYear?.endDate,
            isClosed: data.status ? data.status === 'closed' : existingFiscalYear?.isClosed,
        }

        startTransition(() => {
            setFiscalYears({ type: "update", payload: optimisticFiscalYear })
        })
        await updateFiscalYear(data)
    }

    const handleDelete = async (id: string) => {
        startTransition(() => {
            setFiscalYears({ type: "delete", payload: { id } })
        })
        await deleteFiscalYear({ id })
    }

    return {
        fiscalYears,
        createFiscalYear: handleCreate,
        updateFiscalYear: handleUpdate,
        deleteFiscalYear: handleDelete,
        isCreating,
        isUpdating,
        isDeleting
    }
} 
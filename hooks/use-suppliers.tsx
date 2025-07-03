"use client"

import { useOptimistic } from "react"
import { useAction } from "next-safe-action/hooks"
import { getSuppliers } from "@/db/queries/extended-accounting"
import {
    createSupplierAction,
    updateSupplierAction,
    deleteSupplierAction
} from "@/action/extended-accounting-actions"

export function useSuppliers(initialSuppliers: any[] = []) {
    const [suppliers, setSuppliers] = useOptimistic(
        initialSuppliers,
        (state, action: { type: string; payload: any }) => {
            switch (action.type) {
                case "create":
                    return [...state, action.payload]
                case "update":
                    return state.map(supplier =>
                        supplier.id === action.payload.id ? action.payload : supplier
                    )
                case "delete":
                    return state.filter(supplier => supplier.id !== action.payload.id)
                default:
                    return state
            }
        }
    )

    const { execute: createSupplier, isPending: isCreating } = useAction(createSupplierAction)
    const { execute: updateSupplier, isPending: isUpdating } = useAction(updateSupplierAction)
    const { execute: deleteSupplier, isPending: isDeleting } = useAction(deleteSupplierAction)

    const handleCreate = async (data: any) => {
        const optimisticSupplier = {
            id: Date.now().toString(),
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
        }

        setSuppliers({ type: "create", payload: optimisticSupplier })
        await createSupplier(data)
    }

    const handleUpdate = async (id: string, data: any) => {
        const optimisticSupplier = {
            id,
            ...data,
            updatedAt: new Date()
        }

        setSuppliers({ type: "update", payload: optimisticSupplier })
        await updateSupplier({ id, ...data })
    }

    const handleDelete = async (id: string) => {
        setSuppliers({ type: "delete", payload: { id } })
        await deleteSupplier({ id })
    }

    return {
        suppliers,
        createSupplier: handleCreate,
        updateSupplier: handleUpdate,
        deleteSupplier: handleDelete,
        isCreating,
        isUpdating,
        isDeleting
    }
} 
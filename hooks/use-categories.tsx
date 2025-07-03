"use client"

import { useOptimistic } from "react"
import { useAction } from "next-safe-action/hooks"
import { getExpenseCategories } from "@/db/queries/extended-accounting"
import {
    createExpenseCategoryAction,
    updateExpenseCategoryAction,
    deleteExpenseCategoryAction
} from "@/action/extended-accounting-actions"

export function useCategories(initialCategories: any[] = []) {
    const [categories, setCategories] = useOptimistic(
        initialCategories,
        (state, action: { type: string; payload: any }) => {
            switch (action.type) {
                case "create":
                    return [...state, action.payload]
                case "update":
                    return state.map(category =>
                        category.id === action.payload.id ? action.payload : category
                    )
                case "delete":
                    return state.filter(category => category.id !== action.payload.id)
                default:
                    return state
            }
        }
    )

    const { execute: createCategory, isPending: isCreating } = useAction(createExpenseCategoryAction)
    const { execute: updateCategory, isPending: isUpdating } = useAction(updateExpenseCategoryAction)
    const { execute: deleteCategory, isPending: isDeleting } = useAction(deleteExpenseCategoryAction)

    const handleCreate = async (data: any) => {
        const optimisticCategory = {
            id: Date.now().toString(),
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
        }

        setCategories({ type: "create", payload: optimisticCategory })
        await createCategory(data)
    }

    const handleUpdate = async (id: string, data: any) => {
        const optimisticCategory = {
            id,
            ...data,
            updatedAt: new Date()
        }

        setCategories({ type: "update", payload: optimisticCategory })
        await updateCategory({ id, ...data })
    }

    const handleDelete = async (id: string) => {
        setCategories({ type: "delete", payload: { id } })
        await deleteCategory({ id })
    }

    return {
        categories,
        createCategory: handleCreate,
        updateCategory: handleUpdate,
        deleteCategory: handleDelete,
        isCreating,
        isUpdating,
        isDeleting
    }
} 
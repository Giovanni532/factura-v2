"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"

// Types
interface JournalEntryWithLines {
    id: string
    number: string
    date: Date
    description: string
    reference?: string | null
    type: string
    isPosted: boolean
    total: number
    lines: {
        id: string
        accountId: string
        accountCode: string
        accountName: string
        debit: number
        credit: number
        description?: string | null
    }[]
}

interface AccountWithBalance {
    id: string
    code: string
    name: string
    type: "asset" | "liability" | "equity" | "revenue" | "expense"
    parentAccountId?: string | null
    balance: number
    children?: AccountWithBalance[]
}

// Context Type
interface JournalEntriesContextType {
    entries: JournalEntryWithLines[]
    accounts: AccountWithBalance[]
    addEntry: (entry: JournalEntryWithLines) => void
    updateEntry: (entry: JournalEntryWithLines) => void
    deleteEntry: (id: string) => void
    setEntries: React.Dispatch<React.SetStateAction<JournalEntryWithLines[]>>
    getAccountInfo: (accountId: string) => { code: string; name: string } | null
}

// Context
const JournalEntriesContext = createContext<JournalEntriesContextType | undefined>(undefined)

// Hook
export function useJournalEntries() {
    const ctx = useContext(JournalEntriesContext)
    if (!ctx) {
        throw new Error("useJournalEntries must be used within JournalEntriesProvider")
    }
    return ctx
}

// Provider Props
interface JournalEntriesProviderProps {
    entries: JournalEntryWithLines[]
    accounts: AccountWithBalance[]
    children: React.ReactNode
}

// Provider
export function JournalEntriesProvider({
    entries: initialEntries,
    accounts,
    children
}: JournalEntriesProviderProps) {
    const [entries, setEntries] = useState<JournalEntryWithLines[]>(initialEntries)

    // Synchroniser avec les nouvelles props quand elles changent (après router.refresh)
    useEffect(() => {
        setEntries(initialEntries)
    }, [initialEntries])

    // Fonction utilitaire pour récupérer les infos d'un compte
    const getAccountInfo = useCallback((accountId: string) => {
        // Aplatir tous les comptes (parents + enfants)
        const allAccounts = accounts.reduce((acc: AccountWithBalance[], account) => {
            acc.push(account)
            if (account.children) {
                acc.push(...account.children)
            }
            return acc
        }, [])

        const account = allAccounts.find(acc => acc.id === accountId)
        return account ? { code: account.code, name: account.name } : null
    }, [accounts])

    // Actions
    const addEntry = useCallback((entry: JournalEntryWithLines) => {
        setEntries(prev => [entry, ...prev])
    }, [])

    const updateEntry = useCallback((entry: JournalEntryWithLines) => {
        setEntries(prev => prev.map(e => e.id === entry.id ? entry : e))
    }, [])

    const deleteEntry = useCallback((id: string) => {
        setEntries(prev => prev.filter(e => e.id !== id))
    }, [])

    const value: JournalEntriesContextType = {
        entries,
        accounts,
        addEntry,
        updateEntry,
        deleteEntry,
        setEntries,
        getAccountInfo
    }

    return (
        <JournalEntriesContext.Provider value={value}>
            {children}
        </JournalEntriesContext.Provider>
    )
} 
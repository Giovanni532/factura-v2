"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    IconPlus,
    IconSearch,
    IconEdit,
    IconTrash,
    IconFolder,
    IconFileText
} from "@tabler/icons-react"
import { createAccountAction, updateAccountAction, deleteAccountAction } from "@/action/accounting-actions"

interface AccountWithBalance {
    id: string
    code: string
    name: string
    type: "asset" | "liability" | "equity" | "revenue" | "expense"
    parentAccountId?: string | null
    balance: number
    children?: AccountWithBalance[]
}

interface ChartOfAccountsClientProps {
    accounts: AccountWithBalance[]
}

export function ChartOfAccountsClient({ accounts }: ChartOfAccountsClientProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [localAccounts, setLocalAccounts] = useState(accounts)

    // Mutations
    const handleCreate = async (data: any) => {
        const res = await createAccountAction.execute(data)
        if (res.success) {
            setLocalAccounts((prev) => [...prev, res.account])
        }
    }
    const handleUpdate = async (id: string, data: any) => {
        const res = await updateAccountAction.execute({ id, ...data })
        if (res.success) {
            setLocalAccounts((prev) => prev.map(acc => acc.id === id ? res.account : acc))
        }
    }
    const handleDelete = async (id: string) => {
        const res = await deleteAccountAction.execute({ id })
        if (res.success) {
            setLocalAccounts((prev) => prev.filter(acc => acc.id !== id))
        }
    }

    const getTypeColor = (type: AccountWithBalance["type"]) => {
        switch (type) {
            case "asset":
                return "bg-blue-100 text-blue-800"
            case "liability":
                return "bg-red-100 text-red-800"
            case "equity":
                return "bg-purple-100 text-purple-800"
            case "revenue":
                return "bg-green-100 text-green-800"
            case "expense":
                return "bg-orange-100 text-orange-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const getTypeLabel = (type: AccountWithBalance["type"]) => {
        switch (type) {
            case "asset":
                return "Actif"
            case "liability":
                return "Passif"
            case "equity":
                return "Capitaux propres"
            case "revenue":
                return "Produits"
            case "expense":
                return "Charges"
            default:
                return type
        }
    }

    const filteredAccounts = localAccounts.filter(account =>
        account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.code.includes(searchTerm)
    )

    return (
        <div className="space-y-6">
            {/* Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Input
                        placeholder="Rechercher un compte..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64"
                    />
                    <IconSearch className="h-4 w-4 text-muted-foreground" />
                </div>
                <Button onClick={() => handleCreate({ code: "999", name: "Nouveau compte", type: "asset" })}>
                    <IconPlus className="h-4 w-4 mr-2" />
                    Nouveau compte
                </Button>
            </div>

            {/* Liste des comptes */}
            <Card>
                <CardHeader>
                    <CardTitle>Plan comptable</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredAccounts.map((account) => (
                            <div key={account.id} className="space-y-2">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <IconFolder className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium">{account.code}</span>
                                                <span className="text-sm text-muted-foreground">-</span>
                                                <span className="font-medium">{account.name}</span>
                                            </div>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <Badge variant="secondary" className={getTypeColor(account.type)}>
                                                    {getTypeLabel(account.type)}
                                                </Badge>
                                                {account.children && (
                                                    <Badge variant="outline">
                                                        {account.children.length} sous-compte(s)
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-right">
                                            <div className="font-medium">
                                                {account.balance.toLocaleString('fr-FR', {
                                                    style: 'currency',
                                                    currency: 'EUR'
                                                })}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleUpdate(account.id, { name: account.name + " (modifié)" })}>
                                                <IconEdit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(account.id)}>
                                                <IconTrash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Sous-comptes */}
                                {account.children && (
                                    <div className="ml-8 space-y-2">
                                        {account.children.map((child) => (
                                            <div key={child.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                                                <div className="flex items-center space-x-4">
                                                    <IconFileText className="h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="font-medium">{child.code}</span>
                                                            <span className="text-sm text-muted-foreground">-</span>
                                                            <span className="font-medium">{child.name}</span>
                                                        </div>
                                                        <Badge variant="secondary" className={getTypeColor(child.type)}>
                                                            {getTypeLabel(child.type)}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <div className="text-right">
                                                        <div className="font-medium">
                                                            {child.balance.toLocaleString('fr-FR', {
                                                                style: 'currency',
                                                                currency: 'EUR'
                                                            })}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Button variant="ghost" size="sm" onClick={() => handleUpdate(child.id, { name: child.name + " (modifié)" })}>
                                                            <IconEdit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(child.id)}>
                                                            <IconTrash className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 
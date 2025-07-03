"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import {
    IconPlus,
    IconSearch,
    IconEdit,
    IconTrash,
    IconFolder,
    IconFileText,
    IconChevronDown,
    IconChevronRight
} from "@tabler/icons-react"
import { createAccountAction, updateAccountAction, deleteAccountAction } from "@/action/accounting-actions"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createAccountSchema, updateAccountSchema } from "@/validation/accounting-schema"
import { Search } from "lucide-react"

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
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [editingAccount, setEditingAccount] = useState<AccountWithBalance | null>(null)
    const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set())
    const [selectedParentAccount, setSelectedParentAccount] = useState<AccountWithBalance | null>(null)

    // Formulaires
    const createForm = useForm({
        resolver: zodResolver(createAccountSchema),
        defaultValues: {
            code: "",
            name: "",
            type: "asset" as const,
            parentId: undefined,
        }
    })

    const updateForm = useForm({
        resolver: zodResolver(updateAccountSchema),
        defaultValues: {
            id: "",
            code: "",
            name: "",
            type: "asset" as const,
            parentId: undefined,
        }
    })

    // Actions
    const { execute: executeCreate, isPending: isCreating } = useAction(createAccountAction, {
        onSuccess: (data) => {
            toast.success("Compte créé avec succès")
            if (data.data?.account) {
                const newAccount: AccountWithBalance = {
                    ...data.data.account,
                    balance: 0,
                    children: []
                }

                // Mettre à jour la structure hiérarchique
                if (newAccount.parentAccountId) {
                    // C'est un sous-compte, l'ajouter au parent
                    setLocalAccounts((prev) => {
                        const updated = [...prev]
                        const addToParent = (accounts: AccountWithBalance[]): AccountWithBalance[] => {
                            return accounts.map(account => {
                                if (account.id === newAccount.parentAccountId) {
                                    return {
                                        ...account,
                                        children: [...(account.children || []), newAccount]
                                    }
                                }
                                if (account.children) {
                                    return {
                                        ...account,
                                        children: addToParent(account.children)
                                    }
                                }
                                return account
                            })
                        }
                        return addToParent(updated)
                    })
                } else {
                    // C'est un compte principal, l'ajouter à la liste
                    setLocalAccounts((prev) => [...prev, newAccount])
                }
            }
            setIsCreateDialogOpen(false)
            createForm.reset()
            setSelectedParentAccount(null)
        },
        onError: (error) => {
            toast.error(error.error?.serverError?.message || "Erreur lors de la création du compte")
        }
    })

    const { execute: executeUpdate, isPending: isUpdating } = useAction(updateAccountAction, {
        onSuccess: (data) => {
            toast.success("Compte mis à jour avec succès")
            if (data.data?.account) {
                const updatedAccount: AccountWithBalance = {
                    ...data.data.account,
                    balance: 0,
                    children: []
                }

                // Mettre à jour le compte dans la structure hiérarchique
                setLocalAccounts((prev) => {
                    const updateInHierarchy = (accounts: AccountWithBalance[]): AccountWithBalance[] => {
                        return accounts.map(account => {
                            if (account.id === updatedAccount.id) {
                                return {
                                    ...updatedAccount,
                                    children: account.children || []
                                }
                            }
                            if (account.children) {
                                return {
                                    ...account,
                                    children: updateInHierarchy(account.children)
                                }
                            }
                            return account
                        })
                    }
                    return updateInHierarchy(prev)
                })
            }
            setEditingAccount(null)
            updateForm.reset()
        },
        onError: (error) => {
            toast.error(error.error?.serverError?.message || "Erreur lors de la mise à jour du compte")
        }
    })

    const { execute: executeDelete, isPending: isDeleting } = useAction(deleteAccountAction, {
        onSuccess: () => {
            toast.success("Compte supprimé avec succès")
            if (editingAccount) {
                // Supprimer le compte de la structure hiérarchique
                setLocalAccounts((prev) => {
                    const removeFromHierarchy = (accounts: AccountWithBalance[]): AccountWithBalance[] => {
                        return accounts.filter(account => {
                            if (account.id === editingAccount.id) {
                                return false
                            }
                            if (account.children) {
                                account.children = removeFromHierarchy(account.children)
                            }
                            return true
                        })
                    }
                    return removeFromHierarchy(prev)
                })
            }
            setEditingAccount(null)
        },
        onError: (error) => {
            toast.error(error.error?.serverError?.message || "Erreur lors de la suppression du compte")
        }
    })

    const handleCreate = (data: any) => {
        executeCreate(data)
    }

    const handleUpdate = (data: any) => {
        executeUpdate(data)
    }

    const handleDelete = (account: AccountWithBalance) => {
        setEditingAccount(account)
        executeDelete({ id: account.id })
    }

    const openEditDialog = (account: AccountWithBalance) => {
        setEditingAccount(account)
        updateForm.reset({
            id: account.id,
            code: account.code,
            name: account.name,
            type: account.type,
            parentId: account.parentAccountId || undefined,
        })
    }

    const openCreateSubAccountDialog = (parentAccount: AccountWithBalance) => {
        setSelectedParentAccount(parentAccount)
        createForm.reset({
            code: "",
            name: "",
            type: parentAccount.type, // Hériter du type du parent
            parentId: parentAccount.id,
        })
        setIsCreateDialogOpen(true)
    }

    const toggleExpanded = (accountId: string) => {
        const newExpanded = new Set(expandedAccounts)
        if (newExpanded.has(accountId)) {
            newExpanded.delete(accountId)
        } else {
            newExpanded.add(accountId)
        }
        setExpandedAccounts(newExpanded)
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

    const renderAccount = (account: AccountWithBalance, level: number = 0) => {
        const hasChildren = account.children && account.children.length > 0
        const isExpanded = expandedAccounts.has(account.id)
        const isParent = hasChildren

        return (
            <div key={account.id} className="space-y-2">
                <div
                    className={`flex items-center justify-between p-4 border rounded-lg ${level > 0 ? 'bg-muted/20' : 'bg-background'
                        }`}
                    style={{ marginLeft: `${level * 24}px` }}
                >
                    <div className="flex items-center space-x-4">
                        {isParent ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleExpanded(account.id)}
                                className="p-1 h-6 w-6"
                            >
                                {isExpanded ? (
                                    <IconChevronDown className="h-4 w-4" />
                                ) : (
                                    <IconChevronRight className="h-4 w-4" />
                                )}
                            </Button>
                        ) : (
                            <div className="w-6" />
                        )}

                        <IconFolder className="h-5 w-5 text-blue-500" />

                        <div>
                            <div className="flex items-center space-x-2">
                                <span className="font-mono font-medium text-sm">{account.code}</span>
                                <span className="text-sm text-muted-foreground">-</span>
                                <span className="font-medium">{account.name}</span>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="secondary" className={getTypeColor(account.type)}>
                                    {getTypeLabel(account.type)}
                                </Badge>
                                {hasChildren && (
                                    <Badge variant="outline" className="text-xs">
                                        {account.children!.length} sous-compte(s)
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
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openCreateSubAccountDialog(account)}
                                className="text-blue-600 hover:text-blue-700"
                                title="Ajouter un sous-compte"
                            >
                                <IconPlus className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(account)}>
                                <IconEdit className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(account)}
                                disabled={isDeleting}
                                className="text-red-600 hover:text-red-700"
                            >
                                <IconTrash className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Sous-comptes */}
                {hasChildren && isExpanded && (
                    <div className="space-y-2">
                        {account.children!.map((child) => renderAccount(child, level + 1))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Actions */}
            <div className="flex items-center justify-between">
                <div className="flex flex-1 items-center space-x-2 max-w-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher un compte..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <IconPlus className="h-4 w-4 mr-2" />
                            Nouveau compte
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {selectedParentAccount
                                    ? `Créer un sous-compte de ${selectedParentAccount.name}`
                                    : "Créer un nouveau compte"
                                }
                            </DialogTitle>
                        </DialogHeader>
                        <Form {...createForm}>
                            <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
                                <FormField
                                    control={createForm.control}
                                    name="code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Code du compte</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="512000"
                                                    {...field}
                                                    className="font-mono"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={createForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nom du compte</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Banque" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={createForm.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Type de compte</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Sélectionner un type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="asset">Actif</SelectItem>
                                                    <SelectItem value="liability">Passif</SelectItem>
                                                    <SelectItem value="equity">Capitaux propres</SelectItem>
                                                    <SelectItem value="revenue">Produits</SelectItem>
                                                    <SelectItem value="expense">Charges</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex justify-end space-x-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsCreateDialogOpen(false)
                                            setSelectedParentAccount(null)
                                        }}
                                    >
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

            {/* Liste des comptes */}
            <Card>
                <CardHeader>
                    <CardTitle>Plan comptable</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredAccounts.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                {searchTerm ? "Aucun compte trouvé" : "Aucun compte créé"}
                            </div>
                        ) : (
                            filteredAccounts.map((account) => renderAccount(account))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Dialog de modification */}
            <Dialog open={!!editingAccount} onOpenChange={() => setEditingAccount(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modifier le compte</DialogTitle>
                    </DialogHeader>
                    <Form {...updateForm}>
                        <form onSubmit={updateForm.handleSubmit(handleUpdate)} className="space-y-4">
                            <FormField
                                control={updateForm.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Code du compte</FormLabel>
                                        <FormControl>
                                            <Input {...field} className="font-mono" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={updateForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nom du compte</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={updateForm.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type de compte</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="asset">Actif</SelectItem>
                                                <SelectItem value="liability">Passif</SelectItem>
                                                <SelectItem value="equity">Capitaux propres</SelectItem>
                                                <SelectItem value="revenue">Produits</SelectItem>
                                                <SelectItem value="expense">Charges</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setEditingAccount(null)}>
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
        </div>
    )
} 
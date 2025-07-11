"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    PaginationState,
    SortingState,
    useReactTable,
} from "@tanstack/react-table"
import {
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronUpIcon,
    Search,
    Filter,
    MoreHorizontal,
    Edit,
    Trash2,
    FileText,
    Receipt,
    Settings,
    Eye,
    EyeOff,
} from "lucide-react"

// Hook de pagination intégré
interface UsePaginationProps {
    currentPage: number
    totalPages: number
    paginationItemsToDisplay: number
}

interface UsePaginationReturn {
    pages: number[]
    showLeftEllipsis: boolean
    showRightEllipsis: boolean
}

function usePagination({
    currentPage,
    totalPages,
    paginationItemsToDisplay,
}: UsePaginationProps): UsePaginationReturn {
    const halfDisplay = Math.floor(paginationItemsToDisplay / 2)

    let startPage = Math.max(1, currentPage - halfDisplay)
    let endPage = Math.min(totalPages, startPage + paginationItemsToDisplay - 1)

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < paginationItemsToDisplay) {
        startPage = Math.max(1, endPage - paginationItemsToDisplay + 1)
    }

    const pages = Array.from(
        { length: endPage - startPage + 1 },
        (_, i) => startPage + i
    )

    const showLeftEllipsis = startPage > 1
    const showRightEllipsis = endPage < totalPages

    return {
        pages,
        showLeftEllipsis,
        showRightEllipsis,
    }
}

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
} from "@/components/ui/pagination"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ClientWithStats } from "@/validation/client-schema"
import { CreateClientButton } from "@/components/clients/create-client-button"
import { useAction } from "next-safe-action/hooks"
import { updateClientAction } from "@/action/client-actions"
import { updateClientSchema } from "@/validation/client-schema"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select as FormSelect, SelectContent as FormSelectContent, SelectItem as FormSelectItem, SelectTrigger as FormSelectTrigger, SelectValue as FormSelectValue } from "@/components/ui/select"
import { PhoneInput } from "@/components/ui/phone-input"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import type { z } from "zod"

type UpdateClientFormData = z.infer<typeof updateClientSchema>

interface ClientsDataGridProps {
    initialClients: ClientWithStats[]
    newClient: boolean
    subscriptionLimits: {
        maxClients: number
        planName: string
    }
    searchParams: { [key: string]: string }
    onClientCreated: (client: ClientWithStats) => void
    onClientUpdated: (client: ClientWithStats) => void
    onClientDeleted: (clientId: string) => void
}

// Configuration des colonnes disponibles
const availableColumns = {
    name: { label: "Nom", defaultVisible: true },
    email: { label: "Email", defaultVisible: true },
    phone: { label: "Téléphone", defaultVisible: true },
    status: { label: "Statut", defaultVisible: true },
    totalInvoices: { label: "Factures", defaultVisible: true },
    totalQuotes: { label: "Devis", defaultVisible: true },
    totalRevenue: { label: "CA Total", defaultVisible: true },
}

export function ClientsDataGrid({
    initialClients,
    newClient,
    subscriptionLimits,
    searchParams,
    onClientCreated,
    onClientUpdated,
    onClientDeleted
}: ClientsDataGridProps) {
    const router = useRouter()
    const [clients, setClients] = useState<ClientWithStats[]>(initialClients)
    const [searchTerm, setSearchTerm] = useState(searchParams.search || "")
    const [filter, setFilter] = useState<"all" | "active" | "inactive">("all")
    const [newClientUrl, setNewClientUrl] = useState(newClient)
    const [editingClient, setEditingClient] = useState<ClientWithStats | null>(null)

    // État pour la personnalisation des colonnes
    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
        const defaultVisible: Record<string, boolean> = {}
        Object.entries(availableColumns).forEach(([key, config]) => {
            defaultVisible[key] = config.defaultVisible
        })
        return defaultVisible
    })

    const pageSize = 10

    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: pageSize,
    })

    const [sorting, setSorting] = useState<SortingState>([
        {
            id: "name",
            desc: false,
        },
    ])

    // Formulaire de modification
    const updateForm = useForm<UpdateClientFormData>({
        resolver: zodResolver(updateClientSchema),
        defaultValues: {
            id: "",
            name: "",
            email: "",
            phone: "",
            address: "",
            city: "",
            postalCode: "",
            country: "",
            siret: "",
            vatNumber: "",
        },
    })

    const { execute: executeUpdate, isPending: isUpdating } = useAction(updateClientAction, {
        onSuccess: (result) => {
            if (result?.data) {
                toast.success(result.data.message)

                // L'action retourne maintenant les données complètes avec les statistiques
                const updatedClient: ClientWithStats = result.data.client

                // Mettre à jour l'état local immédiatement
                setClients(prev => prev.map(client =>
                    client.id === updatedClient.id ? updatedClient : client
                ))

                // Notifier le parent
                onClientUpdated(updatedClient)

                // Fermer la modal et réinitialiser le formulaire
                setEditingClient(null)
                updateForm.reset()
            }
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de la modification du client")
        }
    })

    // Vérifier si on peut ajouter un nouveau client
    const canAddNewClient = useMemo(() =>
        subscriptionLimits.maxClients === -1 || clients.length < subscriptionLimits.maxClients,
        [subscriptionLimits.maxClients, clients.length]
    )

    useEffect(() => {
        setNewClientUrl(newClient)
    }, [newClient])

    // Mettre à jour les clients quand initialClients change
    useEffect(() => {
        setClients(initialClients)
    }, [initialClients])


    const handleClientDeleted = useCallback((clientId: string) => {
        setClients(prev => prev.filter(client => client.id !== clientId))
        onClientDeleted(clientId)
    }, [onClientDeleted])

    // Ouvrir la modal de modification
    const openEditDialog = useCallback((client: ClientWithStats) => {
        setEditingClient(client)
        updateForm.reset({
            id: client.id,
            name: client.name,
            email: client.email,
            phone: client.phone || "",
            address: client.address || "",
            city: client.city || "",
            postalCode: client.postalCode || "",
            country: client.country || "",
            siret: client.siret || "",
            vatNumber: client.vatNumber || "",
        })
    }, [updateForm])

    const handleUpdateSubmit = useCallback((data: UpdateClientFormData) => {
        executeUpdate(data)
    }, [executeUpdate])

    // Filtrage des données avec useMemo
    const filteredData = useMemo(() =>
        clients.filter(client => {
            const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.email.toLowerCase().includes(searchTerm.toLowerCase())

            let matchesFilter = true
            if (filter === "active") {
                matchesFilter = client.totalInvoices > 0 || client.totalQuotes > 0
            } else if (filter === "inactive") {
                matchesFilter = client.totalInvoices === 0 && client.totalQuotes === 0
            }

            return matchesSearch && matchesFilter
        }),
        [clients, searchTerm, filter]
    )

    // Définition des colonnes avec useMemo
    const allColumns: ColumnDef<ClientWithStats>[] = useMemo(() => [
        {
            id: "name",
            header: "Nom",
            accessorKey: "name",
            cell: ({ row }) => (
                <div className="font-medium">{row.getValue("name")}</div>
            ),
            size: 200,
        },
        {
            id: "email",
            header: "Email",
            accessorKey: "email",
            size: 200,
        },
        {
            id: "phone",
            header: "Téléphone",
            accessorKey: "phone",
            cell: ({ row }) => (
                <div>{row.original.phone || "—"}</div>
            ),
            size: 150,
        },
        {
            id: "status",
            header: "Statut",
            accessorKey: "status",
            cell: ({ row }) => {
                const isActive = row.original.totalInvoices > 0 || row.original.totalQuotes > 0
                return (
                    <Badge
                        variant={isActive ? "default" : "destructive"}
                        className={cn(
                            !isActive && "bg-muted-foreground/60 text-primary-foreground"
                        )}
                    >
                        {isActive ? "Actif" : "Inactif"}
                    </Badge>
                )
            },
            size: 100,
        },
        {
            id: "totalInvoices",
            header: "Factures",
            accessorKey: "totalInvoices",
            cell: ({ row }) => (
                <div className="text-center">
                    {row.original.totalInvoices}
                </div>
            ),
            size: 100,
        },
        {
            id: "totalQuotes",
            header: "Devis",
            accessorKey: "totalQuotes",
            cell: ({ row }) => (
                <div className="text-center">
                    {row.original.totalQuotes}
                </div>
            ),
            size: 100,
        },
        {
            id: "totalRevenue",
            header: "CA Total",
            accessorKey: "totalRevenue",
            cell: ({ row }) => {
                const amount = row.original.totalRevenue
                const formatted = new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                }).format(amount)
                return <div className="font-medium">{formatted}</div>
            },
            size: 150,
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const client = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Ouvrir le menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => openEditDialog(client)}
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/invoices/create?clientId=${client.id}`)}
                            >
                                <Receipt className="mr-2 h-4 w-4" />
                                Créer une facture
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/quotes/create?clientId=${client.id}`)}
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                Créer un devis
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/invoices?clientId=${client.id}`)}
                            >
                                <Receipt className="mr-2 h-4 w-4" />
                                Voir les factures
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/quotes?clientId=${client.id}`)}
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                Voir les devis
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                    // TODO: Implémenter la suppression
                                    if (confirm(`Êtes-vous sûr de vouloir supprimer ${client.name} ?`)) {
                                        handleClientDeleted(client.id)
                                    }
                                }}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
            size: 80,
            enableSorting: false,
        },
    ], [openEditDialog, handleClientDeleted, router])

    // Filtrer les colonnes selon la visibilité
    const columns = useMemo(() =>
        allColumns.filter(col => col.id === "actions" || visibleColumns[col.id as string]),
        [allColumns, visibleColumns]
    )

    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        enableSortingRemoval: false,
        getPaginationRowModel: getPaginationRowModel(),
        onPaginationChange: setPagination,
        state: {
            sorting,
            pagination,
        },
    })

    const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
        currentPage: table.getState().pagination.pageIndex + 1,
        totalPages: table.getPageCount(),
        paginationItemsToDisplay: 5,
    })

    return (
        <div className="space-y-4">
            {/* Barre d'outils */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex flex-1 items-center space-x-2 max-w-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher un client..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        <Button
                            variant={filter === "all" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilter("all")}
                        >
                            Tous
                        </Button>
                        <Button
                            variant={filter === "active" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilter("active")}
                        >
                            Actifs
                        </Button>
                        <Button
                            variant={filter === "inactive" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilter("inactive")}
                        >
                            Inactifs
                        </Button>
                    </div>

                    {/* Bouton de personnalisation des colonnes */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Settings className="h-4 w-4 mr-2" />
                                Colonnes
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56" align="end">
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm">Colonnes visibles</h4>
                                {Object.entries(availableColumns).map(([key, config]) => (
                                    <div key={key} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id={key}
                                            checked={visibleColumns[key]}
                                            onChange={(e) =>
                                                setVisibleColumns(prev => ({
                                                    ...prev,
                                                    [key]: e.target.checked
                                                }))
                                            }
                                            className="rounded"
                                        />
                                        <label htmlFor={key} className="text-sm">
                                            {config.label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>

                    <CreateClientButton
                        newClient={newClientUrl}
                        disabled={!canAddNewClient}
                        limitReached={!canAddNewClient}
                        planName={subscriptionLimits.planName}
                        maxClients={subscriptionLimits.maxClients}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-background overflow-hidden rounded-md border">
                <Table className="table-fixed">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            style={{ width: `${header.getSize()}px` }}
                                            className="h-11"
                                        >
                                            {header.isPlaceholder ? null : header.column.getCanSort() ? (
                                                <div
                                                    className={cn(
                                                        header.column.getCanSort() &&
                                                        "flex h-full cursor-pointer items-center justify-between gap-2 select-none"
                                                    )}
                                                    onClick={header.column.getToggleSortingHandler()}
                                                    onKeyDown={(e) => {
                                                        if (
                                                            header.column.getCanSort() &&
                                                            (e.key === "Enter" || e.key === " ")
                                                        ) {
                                                            e.preventDefault()
                                                            header.column.getToggleSortingHandler()?.(e)
                                                        }
                                                    }}
                                                    tabIndex={header.column.getCanSort() ? 0 : undefined}
                                                >
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                    {{
                                                        asc: (
                                                            <ChevronUpIcon
                                                                className="shrink-0 opacity-60"
                                                                size={16}
                                                                aria-hidden="true"
                                                            />
                                                        ),
                                                        desc: (
                                                            <ChevronDownIcon
                                                                className="shrink-0 opacity-60"
                                                                size={16}
                                                                aria-hidden="true"
                                                            />
                                                        ),
                                                    }[header.column.getIsSorted() as string] ?? null}
                                                </div>
                                            ) : (
                                                flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )
                                            )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    {searchTerm ? "Aucun client trouvé" : "Aucun client"}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between gap-3 max-sm:flex-col">
                {/* Page number information */}
                <p
                    className="text-muted-foreground flex-1 text-sm whitespace-nowrap"
                    aria-live="polite"
                >
                    Page{" "}
                    <span className="text-foreground">
                        {table.getState().pagination.pageIndex + 1}
                    </span>{" "}
                    sur <span className="text-foreground">{table.getPageCount()}</span>
                    {" "}({filteredData.length} clients)
                </p>

                {/* Pagination buttons */}
                <div className="grow">
                    <Pagination>
                        <PaginationContent>
                            {/* Previous page button */}
                            <PaginationItem>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="disabled:pointer-events-none disabled:opacity-50"
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    aria-label="Page précédente"
                                >
                                    <ChevronLeftIcon size={16} aria-hidden="true" />
                                </Button>
                            </PaginationItem>

                            {/* Left ellipsis (...) */}
                            {showLeftEllipsis && (
                                <PaginationItem>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            )}

                            {/* Page number buttons */}
                            {pages.map((page: number) => {
                                const isActive =
                                    page === table.getState().pagination.pageIndex + 1
                                return (
                                    <PaginationItem key={page}>
                                        <Button
                                            size="icon"
                                            variant={`${isActive ? "outline" : "ghost"}`}
                                            onClick={() => table.setPageIndex(page - 1)}
                                            aria-current={isActive ? "page" : undefined}
                                        >
                                            {page}
                                        </Button>
                                    </PaginationItem>
                                )
                            })}

                            {/* Right ellipsis (...) */}
                            {showRightEllipsis && (
                                <PaginationItem>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            )}

                            {/* Next page button */}
                            <PaginationItem>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="disabled:pointer-events-none disabled:opacity-50"
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                    aria-label="Page suivante"
                                >
                                    <ChevronRightIcon size={16} aria-hidden="true" />
                                </Button>
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>

                {/* Results per page */}
                <div className="flex flex-1 justify-end">
                    <Select
                        value={table.getState().pagination.pageSize.toString()}
                        onValueChange={(value) => {
                            table.setPageSize(Number(value))
                        }}
                        aria-label="Résultats par page"
                    >
                        <SelectTrigger
                            id="results-per-page"
                            className="w-fit whitespace-nowrap"
                        >
                            <SelectValue placeholder="Sélectionner le nombre de résultats" />
                        </SelectTrigger>
                        <SelectContent>
                            {[5, 10, 25, 50].map((pageSize) => (
                                <SelectItem key={pageSize} value={pageSize.toString()}>
                                    {pageSize} / page
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Modal de modification */}
            <Dialog open={!!editingClient} onOpenChange={() => setEditingClient(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Modifier le client</DialogTitle>
                    </DialogHeader>
                    <Form {...updateForm}>
                        <form onSubmit={updateForm.handleSubmit(handleUpdateSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={updateForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Prénom et nom *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nom du client" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={updateForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email *</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="email@exemple.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={updateForm.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Téléphone</FormLabel>
                                            <FormControl>
                                                <PhoneInput
                                                    placeholder="Numéro de téléphone"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={updateForm.control}
                                    name="country"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Pays</FormLabel>
                                            <FormControl>
                                                <FormSelect
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                >
                                                    <FormSelectTrigger>
                                                        <FormSelectValue placeholder="Sélectionnez un pays" />
                                                    </FormSelectTrigger>
                                                    <FormSelectContent>
                                                        <FormSelectItem value="France">France</FormSelectItem>
                                                        <FormSelectItem value="Suisse">Suisse</FormSelectItem>
                                                    </FormSelectContent>
                                                </FormSelect>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={updateForm.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Adresse</FormLabel>
                                        <FormControl>
                                            <Input placeholder="123 Rue Example" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={updateForm.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ville</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Paris" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={updateForm.control}
                                    name="postalCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Code postal</FormLabel>
                                            <FormControl>
                                                <Input placeholder="75000" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={updateForm.control}
                                    name="siret"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>SIRET</FormLabel>
                                            <FormControl>
                                                <Input placeholder="12345678901234" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={updateForm.control}
                                    name="vatNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Numéro de TVA</FormLabel>
                                            <FormControl>
                                                <Input placeholder="FR12345678901" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setEditingClient(null)}>
                                    Annuler
                                </Button>
                                <Button type="submit" disabled={isUpdating}>
                                    {isUpdating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Modification...
                                        </>
                                    ) : (
                                        "Modifier le client"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

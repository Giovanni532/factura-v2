"use client"

import { useId, useMemo, useRef, useState } from "react"
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
    MoreHorizontal,
    Eye,
    Download,
    Send,
    Trash2,
    Calendar as CalendarIcon,
    Edit,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Pagination,
    PaginationContent,
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import type { DateRange } from "react-day-picker"

// Type générique pour un document (facture ou devis)
export type DocumentRow = {
    id: string
    type: "invoice" | "quote"
    number: string // invoiceNumber ou quoteNumber
    client: { id: string; name: string; email: string }
    date: string // ISO
    status: string
    amount: number
    currency: string
    // ...autres champs utiles
}

// Fonction pour traduire les statuts en français
const translateStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
        // Statuts factures
        'draft': 'Brouillon',
        'sent': 'Envoyée',
        'paid': 'Payée',
        'overdue': 'En retard',
        'cancelled': 'Annulée',
        // Statuts devis
        'accepted': 'Accepté',
        'rejected': 'Refusé',
        'expired': 'Expiré'
    };
    return statusMap[status] || status;
};

const colorStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
        'draft': 'bg-gray-500 text-white',
        'sent': 'bg-blue-500 text-white',
        'paid': 'bg-green-500 text-white',
        'overdue': 'bg-red-500 text-white',
        'cancelled': 'bg-gray-500 text-white',
        'accepted': 'bg-green-500 text-white',
        'rejected': 'bg-red-500 text-white',
        'expired': 'bg-gray-500 text-white',
    };
    return statusMap[status] || status;
}

interface DatagridDocumentsProps {
    documents: DocumentRow[]
    statusOptions: string[]
    filters: {
        search: string
        status: string
        dateRange: DateRange
    }
    onFiltersChange: (filters: DatagridDocumentsProps["filters"]) => void
    onView: (doc: DocumentRow) => void
    onStatusChange: (doc: DocumentRow, status: string) => void
    onDownload: (doc: DocumentRow) => void
    onSend: (doc: DocumentRow, subject: string, message: string) => void
    onDelete: (doc: DocumentRow) => void
    pageSizeOptions?: number[]
    initialPageSize?: number
}

export function DatagridDocuments({
    documents,
    statusOptions,
    filters,
    onFiltersChange,
    onView,
    onStatusChange,
    onDownload,
    onSend,
    onDelete,
    pageSizeOptions = [5, 10, 25, 50],
    initialPageSize = 10,
}: DatagridDocumentsProps) {
    const id = useId()
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: initialPageSize,
    })
    const [sorting, setSorting] = useState<SortingState>([
        { id: "date", desc: true },
    ])
    const [search, setSearch] = useState(filters.search)
    const [status, setStatus] = useState(filters.status)
    const [dateRange, setDateRange] = useState<DateRange | undefined>(filters.dateRange)
    const inputRef = useRef<HTMLInputElement>(null)

    // États pour les modals
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showSendDialog, setShowSendDialog] = useState(false)
    const [showStatusDialog, setShowStatusDialog] = useState(false)
    const [selectedDocument, setSelectedDocument] = useState<DocumentRow | null>(null)
    const [selectedStatus, setSelectedStatus] = useState("")
    const [emailSubject, setEmailSubject] = useState("")
    const [emailMessage, setEmailMessage] = useState("")

    // Filtrage local (peut être remplacé par un filtrage serveur si besoin)
    const filteredData = useMemo(() => {
        return documents.filter((doc) => {
            const matchesSearch =
                !search ||
                doc.number.toLowerCase().includes(search.toLowerCase()) ||
                doc.client.name.toLowerCase().includes(search.toLowerCase())
            const matchesStatus = status === "all" || doc.status === status
            const matchesDate =
                (!dateRange?.from || new Date(doc.date) >= dateRange.from) &&
                (!dateRange?.to || new Date(doc.date) <= dateRange.to)
            return matchesSearch && matchesStatus && matchesDate
        })
    }, [documents, search, status, dateRange])

    // Fonctions de gestion des actions
    const handleView = (doc: DocumentRow) => {
        onView(doc)
    }

    const handleStatusChange = (doc: DocumentRow) => {
        setSelectedDocument(doc)
        setSelectedStatus("")
        setShowStatusDialog(true)
    }

    const handleConfirmStatusChange = () => {
        if (selectedDocument && selectedStatus) {
            onStatusChange(selectedDocument, selectedStatus)
            setShowStatusDialog(false)
            setSelectedDocument(null)
            setSelectedStatus("")
        }
    }

    const handleDownload = (doc: DocumentRow) => {
        onDownload(doc)
    }

    const handleSend = (doc: DocumentRow) => {
        setSelectedDocument(doc)
        const docType = doc.type === "invoice" ? "Facture" : "Devis"
        setEmailSubject(`${docType} ${doc.number} - ${doc.client.name}`)
        setEmailMessage(`Bonjour ${doc.client.name},

Veuillez trouver ci-joint la ${docType.toLowerCase()} ${doc.number} d'un montant de ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: doc.currency }).format(doc.amount)}.

Merci de votre confiance.

Cordialement,
Votre équipe`)
        setShowSendDialog(true)
    }

    const handleConfirmSend = () => {
        if (selectedDocument) {
            onSend(selectedDocument, emailSubject, emailMessage)
            setShowSendDialog(false)
            setSelectedDocument(null)
            setEmailSubject("")
            setEmailMessage("")
        }
    }

    const handleDelete = (doc: DocumentRow) => {
        setSelectedDocument(doc)
        setShowDeleteDialog(true)
    }

    const handleConfirmDelete = () => {
        if (selectedDocument) {
            onDelete(selectedDocument)
            setShowDeleteDialog(false)
            setSelectedDocument(null)
        }
    }

    // Colonnes de la datagrid
    const columns = useMemo<ColumnDef<DocumentRow>[]>(() => [
        {
            id: "number",
            header: "Numéro",
            accessorKey: "number",
            cell: ({ row }) => (
                <Button variant="link" className="p-0 h-auto" onClick={() => handleView(row.original)}>
                    {row.original.number}
                </Button>
            ),
            size: 120,
        },
        {
            id: "client",
            header: "Client",
            accessorKey: "client",
            cell: ({ row }) => row.original.client.name,
            size: 180,
        },
        {
            id: "date",
            header: "Date",
            accessorKey: "date",
            cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
            size: 120,
        },
        {
            id: "status",
            header: "Statut",
            accessorKey: "status",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Badge
                        className={cn(
                            "select-none",
                            row.original.status === 'draft' ? "cursor-default" : "cursor-pointer",
                            colorStatus(row.original.status)
                        )}
                        onClick={() => {
                            if (row.original.status !== 'draft') {
                                handleStatusChange(row.original)
                            }
                        }}
                    >
                        {translateStatus(row.original.status)}
                    </Badge>
                    {row.original.status === 'draft' && (
                        <span className="text-xs text-muted-foreground">(Cliquez sur Envoyer)</span>
                    )}
                </div>
            ),
            size: 150,
        },
        {
            id: "amount",
            header: "Montant",
            accessorKey: "amount",
            cell: ({ row }) =>
                new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: row.original.currency,
                }).format(row.original.amount),
            size: 120,
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(row.original)}>
                            <Eye className="mr-2 h-4 w-4" /> Voir
                        </DropdownMenuItem>
                        {row.original.status !== 'draft' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(row.original)}>
                                <Edit className="mr-2 h-4 w-4" /> Modifier le statut
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleDownload(row.original)}>
                            <Download className="mr-2 h-4 w-4" /> Télécharger
                        </DropdownMenuItem>
                        {row.original.status === 'draft' ? (
                            <DropdownMenuItem onClick={() => handleSend(row.original)}>
                                <Send className="mr-2 h-4 w-4" /> Envoyer
                            </DropdownMenuItem>
                        ) : (row.original.status === 'paid' || row.original.status === 'cancelled' || row.original.status === 'overdue' || row.original.status === 'accepted' || row.original.status === 'rejected' || row.original.status === 'expired') ? (
                            <DropdownMenuItem onClick={() => handleSend(row.original)}>
                                <Send className="mr-2 h-4 w-4" /> Rappel
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem onClick={() => handleSend(row.original)}>
                                <Send className="mr-2 h-4 w-4" /> Renvoyer
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(row.original)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
            size: 80,
            enableSorting: false,
        },
    ], [statusOptions])

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

    // Gestion des filtres
    const handleSearch = (value: string) => {
        setSearch(value)
        onFiltersChange({ ...filters, search: value })
    }
    const handleStatus = (value: string) => {
        setStatus(value)
        onFiltersChange({ ...filters, status: value })
    }
    const handleDateRange = (range: DateRange | undefined) => {
        setDateRange(range)
        onFiltersChange({ ...filters, dateRange: range as any })
    }
    const clearFilters = () => {
        setSearch("")
        setStatus("all")
        setDateRange(undefined)
        onFiltersChange({ search: "", status: "all", dateRange: undefined } as any)
    }

    return (
        <>
            <div className="space-y-4">
                {/* Filtres */}
                <div className="flex flex-wrap items-center gap-3 justify-between">
                    <div className="flex items-center gap-3">
                        {/* Recherche */}
                        <Input
                            ref={inputRef}
                            className="min-w-60"
                            value={search}
                            onChange={e => handleSearch(e.target.value)}
                            placeholder="Rechercher par numéro ou client..."
                            type="text"
                            aria-label="Recherche"
                        />
                        {/* Statut */}
                        <Select value={status} onValueChange={handleStatus}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous</SelectItem>
                                {statusOptions.map(opt => (
                                    <SelectItem key={opt} value={opt}>{translateStatus(opt)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {/* Date */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="flex gap-2 items-center">
                                    <CalendarIcon className="h-4 w-4" />
                                    {dateRange?.from ?
                                        `${dateRange.from.toLocaleDateString()}${dateRange.to ? ` → ${dateRange.to.toLocaleDateString()}` : ""}`
                                        : "Date"
                                    }
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="w-auto p-0">
                                <Calendar
                                    mode="range"
                                    selected={dateRange}
                                    onSelect={handleDateRange}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                        <Button variant="outline" onClick={clearFilters}>
                            Réinitialiser
                        </Button>
                    </div>
                    {/* Ajout d'un document (optionnel) */}
                </div>
                {/* Table */}
                <div className="bg-background overflow-hidden rounded-md border">
                    <Table className="table-fixed">
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                                    {headerGroup.headers.map((header) => (
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
                                    ))}
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
                                        Aucun document trouvé.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                {/* Pagination */}
                <div className="flex items-center justify-between gap-8">
                    {/* Résultats par page */}
                    <div className="flex items-center gap-3">
                        <Select
                            value={table.getState().pagination.pageSize.toString()}
                            onValueChange={(value) => {
                                table.setPageSize(Number(value))
                            }}
                        >
                            <SelectTrigger className="w-fit whitespace-nowrap">
                                <SelectValue placeholder="Résultats par page" />
                            </SelectTrigger>
                            <SelectContent>
                                {pageSizeOptions.map((pageSize) => (
                                    <SelectItem key={pageSize} value={pageSize.toString()}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {/* Infos de page */}
                    <div className="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap">
                        <p className="text-muted-foreground text-sm whitespace-nowrap" aria-live="polite">
                            Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()} ({filteredData.length} documents)
                        </p>
                    </div>
                    {/* Pagination boutons */}
                    <div>
                        <Pagination>
                            <PaginationContent>
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
                </div>
            </div>

            {/* Dialog de modification du statut */}
            <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Modifier le statut du document</DialogTitle>
                        <DialogDescription>
                            Modifiez le statut du {selectedDocument?.type === "invoice" ? "facture" : "devis"} <strong>{selectedDocument?.number}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="status-select">Statut</Label>
                            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={`Statut actuel: ${selectedDocument ? translateStatus(selectedDocument.status) : ''}`} />
                                </SelectTrigger>
                                <SelectContent>
                                    {selectedDocument?.type === "invoice" ? (
                                        // Options pour les factures selon le statut actuel
                                        <>
                                            {selectedDocument?.status === 'sent' && (
                                                <>
                                                    <SelectItem value="paid">Payée</SelectItem>
                                                    <SelectItem value="overdue">En retard</SelectItem>
                                                    <SelectItem value="cancelled">Annulée</SelectItem>
                                                </>
                                            )}
                                            {selectedDocument?.status === 'paid' && (
                                                <>
                                                    <SelectItem value="overdue">En retard</SelectItem>
                                                    <SelectItem value="cancelled">Annulée</SelectItem>
                                                </>
                                            )}
                                            {selectedDocument?.status === 'overdue' && (
                                                <>
                                                    <SelectItem value="paid">Payée</SelectItem>
                                                    <SelectItem value="cancelled">Annulée</SelectItem>
                                                </>
                                            )}
                                            {selectedDocument?.status === 'cancelled' && (
                                                <>
                                                    <SelectItem value="paid">Payée</SelectItem>
                                                    <SelectItem value="overdue">En retard</SelectItem>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        // Options pour les devis selon le statut actuel
                                        <>
                                            {selectedDocument?.status === 'sent' && (
                                                <>
                                                    <SelectItem value="accepted">Accepté</SelectItem>
                                                    <SelectItem value="rejected">Refusé</SelectItem>
                                                    <SelectItem value="expired">Expiré</SelectItem>
                                                </>
                                            )}
                                            {selectedDocument?.status === 'accepted' && (
                                                <>
                                                    <SelectItem value="rejected">Refusé</SelectItem>
                                                    <SelectItem value="expired">Expiré</SelectItem>
                                                </>
                                            )}
                                            {selectedDocument?.status === 'rejected' && (
                                                <>
                                                    <SelectItem value="accepted">Accepté</SelectItem>
                                                    <SelectItem value="expired">Expiré</SelectItem>
                                                </>
                                            )}
                                            {selectedDocument?.status === 'expired' && (
                                                <>
                                                    <SelectItem value="accepted">Accepté</SelectItem>
                                                    <SelectItem value="rejected">Refusé</SelectItem>
                                                </>
                                            )}
                                        </>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowStatusDialog(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleConfirmStatusChange}
                            disabled={!selectedStatus || selectedStatus === selectedDocument?.status}
                        >
                            Mettre à jour
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog de confirmation de suppression */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Supprimer le document</DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer le {selectedDocument?.type === "invoice" ? "facture" : "devis"} {selectedDocument?.number} ?
                            Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDelete}
                        >
                            Supprimer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de confirmation d'envoi */}
            <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Envoyer le document</DialogTitle>
                        <DialogDescription>
                            Le {selectedDocument?.type === "invoice" ? "facture" : "devis"} <strong>{selectedDocument?.number}</strong> sera envoyé à <strong>{selectedDocument?.client.email}</strong> avec le PDF en pièce jointe.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="email-subject">Objet de l&apos;email</Label>
                            <Input
                                id="email-subject"
                                value={emailSubject}
                                onChange={(e) => setEmailSubject(e.target.value)}
                                placeholder="Objet de l'email"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email-message">Message</Label>
                            <Textarea
                                id="email-message"
                                value={emailMessage}
                                onChange={(e) => setEmailMessage(e.target.value)}
                                placeholder="Message de l'email"
                                rows={6}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSendDialog(false)}>
                            Annuler
                        </Button>
                        <Button onClick={handleConfirmSend}>
                            Envoyer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

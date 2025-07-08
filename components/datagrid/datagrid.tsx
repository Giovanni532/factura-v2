"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    Row,
} from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, Eye, Edit, Trash2, Download, Send, Bell, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { InvoiceWithDetails, InvoiceStats } from "@/validation/invoice-schema";
import { QuoteWithDetails, QuoteStats } from "@/validation/quote-schema";
import { deleteInvoiceAction, updateInvoiceStatusAction, downloadInvoiceAction, sendInvoiceAction } from "@/action/invoice-actions";
import { deleteQuoteAction, updateQuoteStatusAction, downloadQuoteAction, sendQuoteAction } from "@/action/quote-actions";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { useInvoicesContext } from "../../hooks/invoices-context";
import { useQuotesContext } from "../../hooks/quotes-context";
import { InvoicePreviewModal } from "../invoices/invoice-preview-modal";
import { QuotePreviewModal } from "../quotes/quote-preview-modal";

type DataGridType = "invoices" | "quotes";

interface DataGridProps {
    type: DataGridType;
    data: InvoiceWithDetails[] | QuoteWithDetails[];
    stats: InvoiceStats | QuoteStats;
    formData?: any;
    subscriptionLimits: any;
    filters: {
        search: string;
        status: string;
        clientId: string;
        new: boolean;
        id: string;
    };
}

export function DataGrid({ type, data, stats, formData, subscriptionLimits, filters: initialFilters }: DataGridProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [search, setSearch] = useState(initialFilters.search);
    const [statusFilter, setStatusFilter] = useState(initialFilters.status);
    const [id, setId] = useState<string | null>(initialFilters.id);

    // Context hooks
    const invoicesContext = type === "invoices" ? useInvoicesContext() : null;
    const quotesContext = type === "quotes" ? useQuotesContext() : null;

    // State for modals
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showSendDialog, setShowSendDialog] = useState(false);
    const [showReminderDialog, setShowReminderDialog] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [wasManuallyClosed, setWasManuallyClosed] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [selectedStatus, setSelectedStatus] = useState<string>("");
    const [emailSubject, setEmailSubject] = useState("");
    const [emailMessage, setEmailMessage] = useState("");
    const [reminderSubject, setReminderSubject] = useState("");
    const [reminderMessage, setReminderMessage] = useState("");

    // Actions
    const { execute: executeDeleteInvoice, isPending: isDeletingInvoice } = useAction(deleteInvoiceAction, {
        onSuccess: (result) => {
            if (result?.data) {
                toast.success(result.data.message);
                setShowDeleteDialog(false);

                // Supprimer la facture de la liste locale
                if (invoicesContext) {
                    const updatedInvoices = invoicesContext.invoices.filter(inv => inv.id !== selectedItem?.id);
                    invoicesContext.setInvoices(updatedInvoices);

                    // Mettre à jour les statistiques
                    const newStats = {
                        ...invoicesContext.stats,
                        totalInvoices: invoicesContext.stats.totalInvoices - 1,
                        totalRevenue: invoicesContext.stats.totalRevenue - (selectedItem?.total || 0),
                    };

                    // Ajuster les statistiques selon le statut
                    if (selectedItem?.status === 'paid') {
                        newStats.totalPaid = Math.max(0, invoicesContext.stats.totalPaid - 1);
                    } else if (selectedItem?.status === 'overdue') {
                        newStats.totalOverdue = Math.max(0, invoicesContext.stats.totalOverdue - 1);
                    }

                    invoicesContext.setStats(newStats);
                }
            }
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de la suppression");
        }
    });

    const { execute: executeStatusUpdateInvoice, isPending: isUpdatingStatusInvoice } = useAction(updateInvoiceStatusAction, {
        onSuccess: (result) => {
            if (result?.data?.invoice) {
                const data = result.data;
                toast.success(data.message);

                // Mettre à jour la facture dans la liste locale
                if (invoicesContext) {
                    const updatedInvoices = invoicesContext.invoices.map(inv => {
                        if (inv.id === selectedItem?.id) {
                            return {
                                ...inv,
                                status: data.invoice.status,
                                updatedAt: data.invoice.updatedAt,
                            };
                        }
                        return inv;
                    });
                    invoicesContext.setInvoices(updatedInvoices);

                    // Mettre à jour les statistiques
                    const newStats = { ...invoicesContext.stats };

                    // Retirer l'ancien statut
                    if (selectedItem?.status === 'paid') {
                        newStats.totalPaid = Math.max(0, newStats.totalPaid - 1);
                        newStats.totalRevenue = Math.max(0, newStats.totalRevenue - (selectedItem?.total || 0));
                    } else if (selectedItem?.status === 'overdue') {
                        newStats.totalOverdue = Math.max(0, newStats.totalOverdue - 1);
                    }

                    // Ajouter le nouveau statut
                    if (data.invoice.status === 'paid') {
                        newStats.totalPaid = newStats.totalPaid + 1;
                        newStats.totalRevenue = newStats.totalRevenue + (selectedItem?.total || 0);
                    } else if (data.invoice.status === 'overdue') {
                        newStats.totalOverdue = newStats.totalOverdue + 1;
                    }

                    invoicesContext.setStats(newStats);
                }
            }
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de la mise à jour du statut");
        }
    });

    const { execute: executeDownloadInvoice, isPending: isDownloadingInvoice } = useAction(downloadInvoiceAction, {
        onSuccess: (result) => {
            if (result?.data) {
                // Créer un blob avec le PDF et télécharger
                const pdfData = atob(result.data.pdf);
                const bytes = new Uint8Array(pdfData.length);
                for (let i = 0; i < pdfData.length; i++) {
                    bytes[i] = pdfData.charCodeAt(i);
                }

                const blob = new Blob([bytes], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = result.data.filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                toast.success("Facture PDF téléchargée avec succès");
            }
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors du téléchargement");
        }
    });

    const { execute: executeSendInvoice, isPending: isSendingInvoice } = useAction(sendInvoiceAction, {
        onSuccess: (result) => {
            if (result?.data) {
                toast.success(result.data.message);
                setShowSendDialog(false);

                // Mettre à jour la facture dans la liste locale
                if (invoicesContext) {
                    const updatedInvoices = invoicesContext.invoices.map(inv => {
                        if (inv.id === selectedItem?.id) {
                            return {
                                ...inv,
                                status: 'sent' as const,
                                updatedAt: new Date(),
                            };
                        }
                        return inv;
                    });
                    invoicesContext.setInvoices(updatedInvoices);
                }
            }
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de l'envoi");
        }
    });

    const { execute: executeDeleteQuote, isPending: isDeletingQuote } = useAction(deleteQuoteAction, {
        onSuccess: (result) => {
            if (result?.data) {
                toast.success(result.data.message);
                setShowDeleteDialog(false);

                // Supprimer le devis de la liste locale
                if (quotesContext) {
                    const updatedQuotes = quotesContext.quotes.filter(q => q.id !== selectedItem?.id);
                    quotesContext.setQuotes(updatedQuotes);

                    // Mettre à jour les statistiques
                    const newStats = {
                        ...quotesContext.stats,
                        totalQuotes: quotesContext.stats.totalQuotes - 1,
                        totalRevenue: quotesContext.stats.totalRevenue - (selectedItem?.total || 0),
                    };

                    // Ajuster les statistiques selon le statut
                    if (selectedItem?.status === 'accepted') {
                        newStats.totalAccepted = Math.max(0, quotesContext.stats.totalAccepted - 1);
                    } else if (selectedItem?.status === 'sent') {
                        newStats.totalPending = Math.max(0, quotesContext.stats.totalPending - 1);
                    }

                    quotesContext.setStats(newStats);
                }
            }
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de la suppression");
        }
    });

    const { execute: executeStatusUpdateQuote, isPending: isUpdatingStatusQuote } = useAction(updateQuoteStatusAction, {
        onSuccess: (result) => {
            if (result?.data?.quote) {
                const data = result.data;
                toast.success(data.message);

                // Mettre à jour le devis dans la liste locale
                if (quotesContext) {
                    const updatedQuotes = quotesContext.quotes.map(q => {
                        if (q.id === selectedItem?.id) {
                            return {
                                ...q,
                                status: data.quote.status,
                                updatedAt: data.quote.updatedAt,
                            };
                        }
                        return q;
                    });
                    quotesContext.setQuotes(updatedQuotes as QuoteWithDetails[]);

                    // Mettre à jour les statistiques
                    const newStats = { ...quotesContext.stats };

                    // Retirer l'ancien statut
                    if (selectedItem?.status === 'accepted') {
                        newStats.totalAccepted = Math.max(0, newStats.totalAccepted - 1);
                        newStats.totalRevenue = Math.max(0, newStats.totalRevenue - (selectedItem?.total || 0));
                    } else if (selectedItem?.status === 'sent') {
                        newStats.totalPending = Math.max(0, newStats.totalPending - 1);
                    }

                    // Ajouter le nouveau statut
                    if (data.quote.status === 'accepted') {
                        newStats.totalAccepted = newStats.totalAccepted + 1;
                        newStats.totalRevenue = newStats.totalRevenue + (selectedItem?.total || 0);
                    } else if (data.quote.status === 'sent') {
                        newStats.totalPending = newStats.totalPending + 1;
                    }

                    quotesContext.setStats(newStats);
                }
            }
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de la mise à jour du statut");
        }
    });

    const { execute: executeDownloadQuote, isPending: isDownloadingQuote } = useAction(downloadQuoteAction, {
        onSuccess: (result) => {
            if (result?.data) {
                // Créer un blob avec le PDF et télécharger
                const pdfData = atob(result.data.pdf);
                const bytes = new Uint8Array(pdfData.length);
                for (let i = 0; i < pdfData.length; i++) {
                    bytes[i] = pdfData.charCodeAt(i);
                }

                const blob = new Blob([bytes], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = result.data.filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                toast.success("Devis PDF téléchargé avec succès");
            }
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors du téléchargement");
        }
    });

    const { execute: executeSendQuote, isPending: isSendingQuote } = useAction(sendQuoteAction, {
        onSuccess: (result) => {
            if (result?.data) {
                toast.success(result.data.message);
                setShowSendDialog(false);

                // Mettre à jour le devis dans la liste locale
                if (quotesContext) {
                    const updatedQuotes = quotesContext.quotes.map(q => {
                        if (q.id === selectedItem?.id) {
                            return {
                                ...q,
                                status: 'sent' as const,
                                updatedAt: new Date(),
                            };
                        }
                        return q;
                    });
                    quotesContext.setQuotes(updatedQuotes);
                }
            }
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de l'envoi");
        }
    });

    // Synchroniser l'ID avec les paramètres de recherche
    useEffect(() => {
        const currentId = searchParams.get('id');
        setId(currentId);
    }, [searchParams]);

    // Ouvrir automatiquement la modal si l'ID correspond
    useEffect(() => {
        if (id && !wasManuallyClosed) {
            const item = data.find(item => item.id === id);
            if (item) {
                setSelectedItem(item);
                setShowPreviewModal(true);
            }
        } else if (id && id !== selectedItem?.id && showPreviewModal) {
            setShowPreviewModal(false);
            setWasManuallyClosed(false);
        } else if (!id) {
            setWasManuallyClosed(false);
        }
    }, [id, data, wasManuallyClosed, selectedItem?.id, showPreviewModal]);

    // Fonctions utilitaires
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(new Date(date));
    };

    const getStatusColor = (status: string) => {
        if (type === "invoices") {
            switch (status) {
                case 'draft': return 'bg-gray-100 text-gray-800';
                case 'sent': return 'bg-blue-100 text-blue-800';
                case 'paid': return 'bg-green-100 text-green-800';
                case 'overdue': return 'bg-red-100 text-red-800';
                case 'cancelled': return 'bg-gray-100 text-gray-800';
                default: return 'bg-gray-100 text-gray-800';
            }
        } else {
            switch (status) {
                case 'draft': return 'bg-gray-100 text-gray-800';
                case 'sent': return 'bg-green-100 text-green-800';
                case 'accepted': return 'bg-blue-100 text-blue-800';
                case 'rejected': return 'bg-red-100 text-red-800';
                case 'expired': return 'bg-orange-100 text-orange-800';
                default: return 'bg-gray-100 text-gray-800';
            }
        }
    };

    const getStatusLabel = (status: string) => {
        if (type === "invoices") {
            switch (status) {
                case 'draft': return 'Brouillon';
                case 'sent': return 'Envoyée';
                case 'paid': return 'Payée';
                case 'overdue': return 'En retard';
                case 'cancelled': return 'Annulée';
                default: return status;
            }
        } else {
            switch (status) {
                case 'draft': return 'Brouillon';
                case 'sent': return 'Envoyé';
                case 'accepted': return 'Accepté';
                case 'rejected': return 'Refusé';
                case 'expired': return 'Expiré';
                default: return status;
            }
        }
    };

    // Handlers
    const handleView = (item: any) => {
        setSelectedItem(item);
        setShowPreviewModal(true);
        const url = new URL(window.location.href);
        url.searchParams.set('id', item.id);
        window.history.replaceState({}, '', url.toString());
    };

    const handleEdit = (item: any) => {
        setSelectedItem(item);
        setSelectedStatus(item.status);
        setShowStatusDialog(true);
    };

    const handleDelete = (item: any) => {
        setSelectedItem(item);
        setShowDeleteDialog(true);
    };

    const handleStatusChange = () => {
        if (!selectedItem) return;

        if (type === "invoices") {
            executeStatusUpdateInvoice({
                invoiceId: selectedItem.id,
                status: selectedStatus as 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
            });
        } else {
            executeStatusUpdateQuote({
                id: selectedItem.id,
                status: selectedStatus as 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
            });
        }
        setShowStatusDialog(false);
    };

    const handleDownload = (item: any) => {
        if (type === "invoices") {
            executeDownloadInvoice({ invoiceId: item.id });
        } else {
            executeDownloadQuote({ quoteId: item.id });
        }
    };

    const handleSend = (item: any) => {
        setSelectedItem(item);
        const subject = type === "invoices"
            ? `Facture ${item.invoiceNumber} - ${item.client.name}`
            : `Devis ${item.quoteNumber} - ${item.client.name}`;
        const message = type === "invoices"
            ? `Bonjour ${item.client.name},

Veuillez trouver ci-joint la facture ${item.invoiceNumber} d'un montant de ${formatCurrency(item.total)}.

Date d'échéance : ${formatDate(item.dueDate)}

Merci de votre confiance.

Cordialement,
Votre équipe`
            : `Bonjour ${item.client.name},

Veuillez trouver ci-joint le devis ${item.quoteNumber} d'un montant de ${formatCurrency(item.total)}.

Date de validité : ${formatDate(item.validUntil)}

Merci de votre confiance.

Cordialement,
Votre équipe`;

        setEmailSubject(subject);
        setEmailMessage(message);
        setShowSendDialog(true);
    };

    const handleConfirmSend = () => {
        if (!selectedItem) return;

        if (type === "invoices") {
            executeSendInvoice({
                invoiceId: selectedItem.id,
                subject: emailSubject,
                message: emailMessage
            });
        } else {
            executeSendQuote({
                quoteId: selectedItem.id,
                subject: emailSubject,
                message: emailMessage
            });
        }
        setShowSendDialog(false);
    };

    const handleReminder = (item: any) => {
        setSelectedItem(item);
        const subject = type === "invoices"
            ? `Rappel - Facture ${item.invoiceNumber} - ${item.client.name}`
            : `Rappel - Devis ${item.quoteNumber} - ${item.client.name}`;
        const message = type === "invoices"
            ? `Bonjour ${item.client.name},

Nous vous rappelons que la facture ${item.invoiceNumber} d'un montant de ${formatCurrency(item.total)} est en retard de paiement.

Date d'échéance : ${formatDate(item.dueDate)}

Merci de procéder au règlement dans les plus brefs délais.

Cordialement,
Votre équipe`
            : `Bonjour ${item.client.name},

Nous vous rappelons que le devis ${item.quoteNumber} d'un montant de ${formatCurrency(item.total)} a expiré.

Date de validité : ${formatDate(item.validUntil)}

Si vous êtes toujours intéressé(e) par cette offre, merci de nous contacter pour la renouveler.

Cordialement,
Votre équipe`;

        setReminderSubject(subject);
        setReminderMessage(message);
        setShowReminderDialog(true);
    };

    const handleConfirmReminder = () => {
        if (!selectedItem) return;

        if (type === "invoices") {
            executeSendInvoice({
                invoiceId: selectedItem.id,
                subject: reminderSubject,
                message: reminderMessage
            });
        } else {
            executeSendQuote({
                quoteId: selectedItem.id,
                subject: reminderSubject,
                message: reminderMessage
            });
        }
        setShowReminderDialog(false);
    };

    const handleConfirmDelete = () => {
        if (!selectedItem) return;

        if (type === "invoices") {
            executeDeleteInvoice({ invoiceId: selectedItem.id });
        } else {
            executeDeleteQuote({ id: selectedItem.id });
        }
        setShowDeleteDialog(false);
    };

    // Définition des colonnes
    const columns: ColumnDef<any>[] = useMemo(() => {
        const baseColumns = [
            {
                accessorKey: type === "invoices" ? "invoiceNumber" : "quoteNumber",
                header: type === "invoices" ? "Numéro" : "Numéro",
                cell: ({ row }: { row: Row<any> }) => {
                    const item = row.original;
                    return (
                        <div className="font-medium">
                            {type === "invoices" ? item.invoiceNumber : item.quoteNumber}
                        </div>
                    );
                },
            },
            {
                accessorKey: "client.name",
                header: "Client",
                cell: ({ row }: { row: Row<any> }) => {
                    const item = row.original;
                    return (
                        <div>
                            <div className="font-medium">{item.client.name}</div>
                            <div className="text-sm text-muted-foreground">{item.client.email}</div>
                        </div>
                    );
                },
            },
            {
                accessorKey: "status",
                header: "Statut",
                cell: ({ row }: { row: Row<any> }) => {
                    const status = row.getValue("status") as string;
                    return (
                        <Badge className={getStatusColor(status)}>
                            {getStatusLabel(status)}
                        </Badge>
                    );
                },
            },
            {
                accessorKey: type === "invoices" ? "issueDate" : "issueDate",
                header: "Date d'émission",
                cell: ({ row }: { row: Row<any> }) => {
                    const item = row.original;
                    return formatDate(item.issueDate);
                },
            },
            {
                accessorKey: type === "invoices" ? "dueDate" : "validUntil",
                header: type === "invoices" ? "Date d'échéance" : "Date de validité",
                cell: ({ row }: { row: Row<any> }) => {
                    const item = row.original;
                    return formatDate(type === "invoices" ? item.dueDate : item.validUntil);
                },
            },
            {
                accessorKey: "total",
                header: "Montant",
                cell: ({ row }: { row: Row<any> }) => {
                    const amount = parseFloat(row.getValue("total"));
                    return (
                        <div className="font-medium">
                            {formatCurrency(amount)}
                        </div>
                    );
                },
            },
            {
                id: "actions",
                enableHiding: false,
                cell: ({ row }: { row: Row<any> }) => {
                    const item = row.original;
                    const canEdit = type === "invoices"
                        ? (item.status !== 'paid' && item.status !== 'cancelled')
                        : (item.status !== 'accepted' && item.status !== 'rejected');
                    const canSendReminder = type === "invoices"
                        ? item.status === 'overdue'
                        : item.status === 'expired';

                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Ouvrir le menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleView(item)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Voir
                                </DropdownMenuItem>
                                {canEdit && (
                                    <DropdownMenuItem onClick={() => handleEdit(item)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Modifier le statut
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handleDownload(item)}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Télécharger
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSend(item)}>
                                    <Send className="mr-2 h-4 w-4" />
                                    Envoyer
                                </DropdownMenuItem>
                                {canSendReminder && (
                                    <DropdownMenuItem onClick={() => handleReminder(item)}>
                                        <Bell className="mr-2 h-4 w-4" />
                                        Envoyer un rappel
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                    onClick={() => handleDelete(item)}
                                    className="text-red-600"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Supprimer
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
            },
        ];

        return baseColumns;
    }, [type]);

    // Configuration de la table
    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    // Mise à jour des filtres
    const updateFilters = (newFilters: Partial<typeof initialFilters>) => {
        const params = new URLSearchParams(searchParams);

        if (newFilters.search !== undefined) {
            if (newFilters.search) {
                params.set('search', newFilters.search);
            } else {
                params.delete('search');
            }
        }

        if (newFilters.status !== undefined) {
            if (newFilters.status !== 'all') {
                params.set('status', newFilters.status);
            } else {
                params.delete('status');
            }
        }

        if (newFilters.clientId !== undefined) {
            if (newFilters.clientId) {
                params.set('client', newFilters.clientId);
            } else {
                params.delete('client');
            }
        }

        router.push(`/dashboard/${type}?${params.toString()}`);
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        updateFilters({ search: value });
    };

    const handleStatusFilter = (value: string) => {
        setStatusFilter(value);
        updateFilters({ status: value });
    };

    const clearFilters = () => {
        setSearch("");
        setStatusFilter("all");
        updateFilters({ search: "", status: "all" });
    };

    return (
        <div className="space-y-6">
            {/* Filtres */}
            <Card>
                <CardHeader>
                    <CardTitle>Filtres</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        <div className="flex-1">
                            <Input
                                placeholder={`Rechercher par numéro ou client...`}
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={handleStatusFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les statuts</SelectItem>
                                {type === "invoices" ? (
                                    <>
                                        <SelectItem value="draft">Brouillon</SelectItem>
                                        <SelectItem value="sent">Envoyée</SelectItem>
                                        <SelectItem value="paid">Payée</SelectItem>
                                        <SelectItem value="overdue">En retard</SelectItem>
                                        <SelectItem value="cancelled">Annulée</SelectItem>
                                    </>
                                ) : (
                                    <>
                                        <SelectItem value="draft">Brouillon</SelectItem>
                                        <SelectItem value="sent">Envoyé</SelectItem>
                                        <SelectItem value="accepted">Accepté</SelectItem>
                                        <SelectItem value="rejected">Refusé</SelectItem>
                                        <SelectItem value="expired">Expiré</SelectItem>
                                    </>
                                )}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            onClick={clearFilters}
                            className="w-full md:w-auto"
                        >
                            Réinitialiser
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        {type === "invoices" ? "Factures" : "Devis"} ({table.getFilteredRowModel().rows.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => {
                                            return (
                                                <TableHead key={header.id}>
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                </TableHead>
                                            );
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
                                            Aucun résultat.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-end space-x-2 py-4">
                        <div className="flex-1 text-sm text-muted-foreground">
                            {table.getFilteredSelectedRowModel().rows.length} sur{" "}
                            {table.getFilteredRowModel().rows.length} ligne(s) sélectionnée(s).
                        </div>
                        <div className="space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Modals */}
            {selectedItem && (
                <>
                    {/* Modal de prévisualisation */}
                    {type === "invoices" ? (
                        <InvoicePreviewModal
                            invoice={selectedItem}
                            isOpen={showPreviewModal}
                            onClose={() => {
                                setShowPreviewModal(false);
                                setWasManuallyClosed(true);
                                if (id === selectedItem.id) {
                                    const url = new URL(window.location.href);
                                    url.searchParams.delete('id');
                                    window.history.replaceState({}, '', url.toString());
                                }
                            }}
                        />
                    ) : (
                        <QuotePreviewModal
                            quote={selectedItem}
                            isOpen={showPreviewModal}
                            onClose={() => {
                                setShowPreviewModal(false);
                                setWasManuallyClosed(true);
                                if (id === selectedItem.id) {
                                    const url = new URL(window.location.href);
                                    url.searchParams.delete('id');
                                    window.history.replaceState({}, '', url.toString());
                                }
                            }}
                        />
                    )}

                    {/* Dialog de modification du statut */}
                    <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>
                                    Modifier le statut du {type === "invoices" ? "facture" : "devis"}
                                </DialogTitle>
                                <DialogDescription>
                                    Modifiez le statut du {type === "invoices" ? "facture" : "devis"} <strong>
                                        {type === "invoices" ? selectedItem.invoiceNumber : selectedItem.quoteNumber}
                                    </strong>.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="status-select">Statut</Label>
                                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner un statut" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {type === "invoices" ? (
                                                <>
                                                    {selectedItem.status === 'draft' && (
                                                        <SelectItem value="draft">Brouillon</SelectItem>
                                                    )}
                                                    <SelectItem value="sent">Envoyée</SelectItem>
                                                    <SelectItem value="paid">Payée</SelectItem>
                                                    <SelectItem value="overdue">En retard</SelectItem>
                                                    <SelectItem value="cancelled">Annulée</SelectItem>
                                                </>
                                            ) : (
                                                <>
                                                    {selectedItem.status === 'draft' && (
                                                        <SelectItem value="draft">Brouillon</SelectItem>
                                                    )}
                                                    <SelectItem value="sent">Envoyé</SelectItem>
                                                    <SelectItem value="accepted">Accepté</SelectItem>
                                                    <SelectItem value="rejected">Refusé</SelectItem>
                                                    <SelectItem value="expired">Expiré</SelectItem>
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
                                    disabled={type === "invoices" ? isUpdatingStatusInvoice : isUpdatingStatusQuote}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    onClick={handleStatusChange}
                                    disabled={(type === "invoices" ? isUpdatingStatusInvoice : isUpdatingStatusQuote) || selectedStatus === selectedItem.status}
                                >
                                    {type === "invoices" ? isUpdatingStatusInvoice : isUpdatingStatusQuote ? "Mise à jour..." : "Mettre à jour"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Dialog de confirmation de suppression */}
                    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    Supprimer le {type === "invoices" ? "facture" : "devis"}
                                </DialogTitle>
                                <DialogDescription>
                                    Êtes-vous sûr de vouloir supprimer le {type === "invoices" ? "facture" : "devis"} {
                                        type === "invoices" ? selectedItem.invoiceNumber : selectedItem.quoteNumber
                                    } ?
                                    Cette action est irréversible.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowDeleteDialog(false)}
                                    disabled={type === "invoices" ? isDeletingInvoice : isDeletingQuote}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleConfirmDelete}
                                    disabled={type === "invoices" ? isDeletingInvoice : isDeletingQuote}
                                >
                                    {type === "invoices" ? isDeletingInvoice : isDeletingQuote ? "Suppression..." : "Supprimer"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Modal de confirmation d'envoi */}
                    <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>
                                    Envoyer le {type === "invoices" ? "facture" : "devis"}
                                </DialogTitle>
                                <DialogDescription>
                                    Le {type === "invoices" ? "facture" : "devis"} <strong>
                                        {type === "invoices" ? selectedItem.invoiceNumber : selectedItem.quoteNumber}
                                    </strong> sera envoyé à <strong>{selectedItem.client.email}</strong> avec le PDF en pièce jointe.
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
                                <Button variant="outline" onClick={() => setShowSendDialog(false)} disabled={type === "invoices" ? isSendingInvoice : isSendingQuote}>
                                    Annuler
                                </Button>
                                <Button onClick={handleConfirmSend} disabled={type === "invoices" ? isSendingInvoice : isSendingQuote}>
                                    {type === "invoices" ? isSendingInvoice : isSendingQuote ? "Envoi en cours..." : "Envoyer"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Modal de confirmation de rappel */}
                    <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Envoyer un rappel</DialogTitle>
                                <DialogDescription>
                                    Un rappel pour le {type === "invoices" ? "facture" : "devis"} <strong>
                                        {type === "invoices" ? selectedItem.invoiceNumber : selectedItem.quoteNumber}
                                    </strong> sera envoyé à <strong>{selectedItem.client.email}</strong> avec le PDF en pièce jointe.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="reminder-subject">Objet de l&apos;email</Label>
                                    <Input
                                        id="reminder-subject"
                                        value={reminderSubject}
                                        onChange={(e) => setReminderSubject(e.target.value)}
                                        placeholder="Objet de l'email de rappel"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reminder-message">Message</Label>
                                    <Textarea
                                        id="reminder-message"
                                        value={reminderMessage}
                                        onChange={(e) => setReminderMessage(e.target.value)}
                                        placeholder="Message de rappel"
                                        rows={8}
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowReminderDialog(false)} disabled={type === "invoices" ? isSendingInvoice : isSendingQuote}>
                                    Annuler
                                </Button>
                                <Button onClick={handleConfirmReminder} disabled={type === "invoices" ? isSendingInvoice : isSendingQuote}>
                                    {type === "invoices" ? isSendingInvoice : isSendingQuote ? "Envoi en cours..." : "Envoyer le rappel"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </>
            )}
        </div>
    );
}

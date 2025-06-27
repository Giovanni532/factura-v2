"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MoreHorizontal, Eye, Edit, Trash2, Download, Send } from "lucide-react";
import { InvoiceWithDetails } from "@/validation/invoice-schema";
import { deleteInvoiceAction, updateInvoiceStatusAction } from "@/action/invoice-actions";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { useInvoicesContext } from "./invoices-context";

interface InvoiceCardProps {
    invoice: InvoiceWithDetails;
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
    const router = useRouter();
    const { invoices, setInvoices, stats, setStats } = useInvoicesContext();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const { execute: executeDelete, isPending: isDeleting } = useAction(deleteInvoiceAction, {
        onSuccess: (result) => {
            if (result?.data) {
                toast.success(result.data.message);
                setShowDeleteDialog(false);

                // Supprimer la facture de la liste locale
                const updatedInvoices = invoices.filter(inv => inv.id !== invoice.id);
                setInvoices(updatedInvoices);

                // Mettre à jour les statistiques
                const newStats = {
                    ...stats,
                    totalInvoices: stats.totalInvoices - 1,
                    totalRevenue: stats.totalRevenue - invoice.total,
                };

                // Ajuster les statistiques selon le statut
                if (invoice.status === 'paid') {
                    newStats.totalPaid = Math.max(0, stats.totalPaid - 1);
                } else if (invoice.status === 'overdue') {
                    newStats.totalOverdue = Math.max(0, stats.totalOverdue - 1);
                }

                setStats(newStats);
            }
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de la suppression");
        }
    });

    const { execute: executeStatusUpdate, isPending: isUpdatingStatus } = useAction(updateInvoiceStatusAction, {
        onSuccess: (result) => {
            if (result?.data?.invoice) {
                const data = result.data;
                toast.success(data.message);

                // Mettre à jour la facture dans la liste locale
                const updatedInvoices = invoices.map(inv => {
                    if (inv.id === invoice.id) {
                        return {
                            ...inv,
                            status: data.invoice.status,
                            updatedAt: data.invoice.updatedAt,
                        };
                    }
                    return inv;
                });
                setInvoices(updatedInvoices);

                // Mettre à jour les statistiques
                const newStats = { ...stats };

                // Retirer l'ancien statut
                if (invoice.status === 'paid') {
                    newStats.totalPaid = Math.max(0, stats.totalPaid - 1);
                } else if (invoice.status === 'overdue') {
                    newStats.totalOverdue = Math.max(0, stats.totalOverdue - 1);
                }

                // Ajouter le nouveau statut
                if (data.invoice.status === 'paid') {
                    newStats.totalPaid = stats.totalPaid + 1;
                } else if (data.invoice.status === 'overdue') {
                    newStats.totalOverdue = stats.totalOverdue + 1;
                }

                setStats(newStats);
            }
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de la mise à jour du statut");
        }
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft': return 'bg-gray-100 text-gray-800';
            case 'sent': return 'bg-blue-100 text-blue-800';
            case 'paid': return 'bg-green-100 text-green-800';
            case 'overdue': return 'bg-red-100 text-red-800';
            case 'cancelled': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'draft': return 'Brouillon';
            case 'sent': return 'Envoyée';
            case 'paid': return 'Payée';
            case 'overdue': return 'En retard';
            case 'cancelled': return 'Annulée';
            default: return status;
        }
    };

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

    const handleView = () => {
        router.push(`/dashboard/invoices/${invoice.id}`);
    };

    const handleEdit = () => {
        router.push(`/dashboard/invoices/${invoice.id}/edit`);
    };

    const handleDelete = () => {
        executeDelete({ invoiceId: invoice.id });
    };

    const handleStatusChange = (newStatus: string) => {
        executeStatusUpdate({
            invoiceId: invoice.id,
            status: newStatus as 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
        });
    };

    const handleDownload = () => {
        // TODO: Implémenter le téléchargement PDF
        toast.info("Fonctionnalité de téléchargement à venir");
    };

    const handleSend = () => {
        // TODO: Implémenter l'envoi par email
        toast.info("Fonctionnalité d'envoi à venir");
    };

    return (
        <>
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CardTitle className="text-lg">{invoice.invoiceNumber}</CardTitle>
                            <Badge className={getStatusColor(invoice.status)}>
                                {getStatusLabel(invoice.status)}
                            </Badge>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleView}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Voir
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleEdit}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleDownload}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Télécharger
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleSend}>
                                    <Send className="mr-2 h-4 w-4" />
                                    Envoyer
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setShowDeleteDialog(true)}
                                    className="text-red-600"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Supprimer
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Client</p>
                            <p className="font-medium">{invoice.client.name}</p>
                            <p className="text-sm text-muted-foreground">{invoice.client.email}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Dates</p>
                            <p className="text-sm">Émission: {formatDate(invoice.issueDate)}</p>
                            <p className="text-sm">Échéance: {formatDate(invoice.dueDate)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Montant</p>
                            <p className="text-lg font-bold">{formatCurrency(invoice.total)}</p>
                            <p className="text-sm text-muted-foreground">
                                {invoice.items.length} article{invoice.items.length > 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>

                    {invoice.status === 'draft' && (
                        <div className="mt-4 flex gap-2">
                            <Button
                                size="sm"
                                onClick={() => handleStatusChange('sent')}
                                disabled={isUpdatingStatus}
                            >
                                Envoyer
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleEdit}
                            >
                                Modifier
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialog de confirmation de suppression */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Supprimer la facture</DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer la facture {invoice.invoiceNumber} ?
                            Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                            disabled={isDeleting}
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Suppression..." : "Supprimer"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
} 
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Crown } from "lucide-react";
import { InvoiceWithDetails, InvoiceStats } from "@/validation/invoice-schema";
import { CreateInvoiceButton } from "./create-invoice-button";
import { InvoicesContext } from "../../hooks/invoices-context";
import { SubscriptionLimits } from "@/db/queries/subscription";
import { DatagridDocuments, DocumentRow } from "../datagrid/datagrid-documents";
import { InvoicePreviewModal } from "./invoice-preview-modal";
import { useAction } from "next-safe-action/hooks";
import {
    updateInvoiceStatusAction,
    deleteInvoiceAction,
    sendInvoiceAction,
    downloadInvoiceAction
} from "@/action/invoice-actions";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";

interface InvoicesPageClientProps {
    invoices: InvoiceWithDetails[];
    stats: InvoiceStats;
    formData?: any;
    subscriptionLimits: SubscriptionLimits;
    filters: {
        search: string;
        status: string;
        clientId: string;
        new: boolean;
        id: string;
    };
}

export function InvoicesPageClient({ invoices: initialInvoices, stats: initialStats, formData, subscriptionLimits, filters: initialFilters }: InvoicesPageClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [invoices, setInvoices] = useState(initialInvoices);
    const [stats, setStats] = useState(initialStats);
    const [newInvoice, setNewInvoice] = useState(initialFilters.new);
    const [id, setId] = useState<string | null>(initialFilters.id);
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithDetails | null>(null);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

    // Fonction pour recalculer les statistiques localement
    const recalculateStats = (updatedInvoices: InvoiceWithDetails[]) => {
        const totalInvoices = updatedInvoices.length;
        const totalPaid = updatedInvoices.filter(inv => inv.status === 'paid').length;
        const totalOverdue = updatedInvoices.filter(inv => inv.status === 'overdue').length;
        const totalDraft = updatedInvoices.filter(inv => inv.status === 'draft').length;
        const totalRevenue = updatedInvoices
            .filter(inv => inv.status === 'paid')
            .reduce((sum, inv) => sum + Number(inv.total), 0);
        const averageInvoiceValue = totalInvoices > 0
            ? updatedInvoices.reduce((sum, inv) => sum + Number(inv.total), 0) / totalInvoices
            : 0;

        setStats({
            totalInvoices,
            totalPaid,
            totalOverdue,
            totalDraft,
            totalRevenue,
            averageInvoiceValue
        });
    };

    // Actions
    const { execute: executeStatusUpdate } = useAction(updateInvoiceStatusAction, {
        onSuccess: (result) => {
            if (result.data) {
                toast.success(result.data.message);
                // Mettre à jour la facture dans la liste et recalculer les stats
                setInvoices((prev: any) => {
                    const updatedInvoices = prev.map((inv: any) =>
                        inv.id === result.data!.invoice.id ? { ...inv, status: result.data!.invoice.status } : inv
                    );
                    recalculateStats(updatedInvoices);
                    return updatedInvoices;
                });
            }
        },
        onError: (error) => {
            toast.error(error.error?.serverError?.message || "Erreur lors de la mise à jour du statut");
        }
    });

    const { execute: executeDelete } = useAction(deleteInvoiceAction, {
        onSuccess: (result) => {
            if (result.data) {
                toast.success(result.data.message);
                // Supprimer la facture de la liste et recalculer les stats
                setInvoices(prev => {
                    const updatedInvoices = prev.filter(inv => inv.id !== selectedInvoice?.id);
                    recalculateStats(updatedInvoices);
                    return updatedInvoices;
                });
                setSelectedInvoice(null);
                setIsPreviewModalOpen(false);
            }
        },
        onError: (error) => {
            toast.error(error.error?.serverError?.message || "Erreur lors de la suppression");
        }
    });

    const { execute: executeSend } = useAction(sendInvoiceAction, {
        onSuccess: (result) => {
            if (result.data) {
                toast.success(result.data.message);
                // Mettre à jour le statut de la facture et recalculer les stats
                setInvoices((prev: any) => {
                    const updatedInvoices = prev.map((inv: any) =>
                        inv.id === selectedInvoice?.id ? { ...inv, status: 'sent' } : inv
                    );
                    recalculateStats(updatedInvoices);
                    return updatedInvoices;
                });
            }
        },
        onError: (error) => {
            toast.error(error.error?.serverError?.message || "Erreur lors de l'envoi");
        }
    });

    const { execute: executeDownload } = useAction(downloadInvoiceAction, {
        onSuccess: (result) => {
            if (result.data?.success && result.data.pdf) {
                try {
                    // Créer un blob et télécharger le PDF
                    const pdfData = atob(result.data.pdf);
                    const bytes = new Uint8Array(pdfData.length);
                    for (let i = 0; i < pdfData.length; i++) {
                        bytes[i] = pdfData.charCodeAt(i);
                    }

                    const blob = new Blob([bytes], { type: 'application/pdf' });
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = result.data.filename || 'facture.pdf';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                    toast.success("Facture téléchargée avec succès");
                } catch (error) {
                    toast.error("Erreur lors du téléchargement du PDF");
                }
            }
        },
        onError: (error) => {
            toast.error(error.error?.serverError?.message || "Erreur lors du téléchargement");
        }
    });

    // Vérifier si on peut ajouter une nouvelle facture (basé sur les documents combinés)
    const canAddNewInvoice = subscriptionLimits.maxInvoices === -1 ||
        subscriptionLimits.currentDocuments < subscriptionLimits.maxInvoices;

    // Calculer le pourcentage d'utilisation des documents (devis + factures)
    const usagePercentage = subscriptionLimits.maxInvoices === -1 ? 0 :
        (subscriptionLimits.currentDocuments / subscriptionLimits.maxInvoices) * 100;

    // Déterminer si on doit afficher l'alerte
    const shouldShowAlert = subscriptionLimits.maxInvoices !== -1 &&
        (usagePercentage >= 80 || !canAddNewInvoice);

    // Synchroniser l'ID avec les paramètres de recherche
    useEffect(() => {
        const currentId = searchParams.get('id');
        setId(currentId);

        // Si un ID est spécifié, ouvrir automatiquement la prévisualisation du document
        if (currentId) {
            const targetInvoice = invoices.find(inv => inv.id === currentId);
            if (targetInvoice) {
                setSelectedInvoice(targetInvoice);
                setIsPreviewModalOpen(true);
            }
        }
    }, [searchParams, invoices]);

    // Transformer les factures en DocumentRow
    const documentRows: DocumentRow[] = useMemo(() => {
        return invoices.map(invoice => ({
            id: invoice.id,
            type: "invoice" as const,
            number: invoice.invoiceNumber,
            client: { id: invoice.client.id, name: invoice.client.name, email: invoice.client.email },
            date: new Date(invoice.issueDate).toISOString(),
            status: invoice.status,
            amount: invoice.total,
            currency: "EUR",
        }));
    }, [invoices]);

    // Options de statut pour le filtre
    const statusOptions = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];

    // Callbacks pour la datagrid
    const handleView = (doc: DocumentRow) => {
        const invoice = invoices.find(inv => inv.id === doc.id);
        if (invoice) {
            setSelectedInvoice(invoice);
            setIsPreviewModalOpen(true);
        }
    };

    const handleStatusChange = (doc: DocumentRow, status: string) => {
        executeStatusUpdate({ invoiceId: doc.id, status: status as any });
    };

    const handleDownload = (doc: DocumentRow) => {
        executeDownload({ invoiceId: doc.id });
    };

    const handleSend = (doc: DocumentRow, subject: string, message: string) => {
        executeSend({
            invoiceId: doc.id,
            subject,
            message
        });
    };

    const handleDelete = (doc: DocumentRow) => {
        const invoice = invoices.find(inv => inv.id === doc.id);
        if (invoice) {
            setSelectedInvoice(invoice);
            executeDelete({ invoiceId: doc.id });
            // Mettre à jour immédiatement la liste et recalculer les stats
            setInvoices(prev => {
                const updatedInvoices = prev.filter(inv => inv.id !== doc.id);
                recalculateStats(updatedInvoices);
                return updatedInvoices;
            });
        }
    };

    const handleFiltersChange = (filters: { search: string; status: string; dateRange: DateRange }) => {
        const params = new URLSearchParams(searchParams);

        if (filters.search) {
            params.set('search', filters.search);
        } else {
            params.delete('search');
        }

        if (filters.status !== 'all') {
            params.set('status', filters.status);
        } else {
            params.delete('status');
        }

        router.push(`/dashboard/invoices?${params.toString()}`);
    };

    const handleClosePreview = () => {
        setIsPreviewModalOpen(false);
        setSelectedInvoice(null);

        // Nettoyer l'ID de l'URL
        const params = new URLSearchParams(searchParams);
        params.delete('id');
        router.replace(`/dashboard/invoices?${params.toString()}`);
    };

    return (
        <InvoicesContext.Provider value={{ invoices, setInvoices, stats, setStats }}>
            <div className="space-y-6">
                {/* En-tête */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Factures</h1>
                        <p className="text-muted-foreground">
                            Gérez vos factures et suivez vos paiements
                        </p>
                    </div>
                    <CreateInvoiceButton
                        formData={formData}
                        newInvoice={newInvoice}
                        disabled={!canAddNewInvoice}
                        limitReached={!canAddNewInvoice}
                        planName={subscriptionLimits.planName}
                        maxInvoices={subscriptionLimits.maxInvoices}
                    />
                </div>

                {/* Alerte de limite d'abonnement */}
                {shouldShowAlert && (
                    <Alert className={!canAddNewInvoice ? "border-red-200 bg-red-50" : "border-yellow-200 bg-yellow-50"}>
                        <AlertCircle className={`h-4 w-4 ${!canAddNewInvoice ? "text-red-600" : "text-yellow-600"}`} />
                        <AlertDescription className={!canAddNewInvoice ? "text-red-800" : "text-yellow-800"}>
                            {!canAddNewInvoice ? (
                                <div className="flex items-center justify-between">
                                    <span>
                                        <strong>Limite atteinte !</strong> Vous avez atteint la limite de {subscriptionLimits.maxInvoices} documents
                                        (devis + factures) pour le plan {subscriptionLimits.planName}.
                                    </span>
                                    <Button size="sm" className="ml-4">
                                        <Crown className="h-4 w-4 mr-2" />
                                        Upgrader
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <span>
                                        <strong>Attention !</strong> Vous utilisez {subscriptionLimits.currentDocuments}/{subscriptionLimits.maxInvoices} documents
                                        (devis + factures) de votre plan {subscriptionLimits.planName}.
                                    </span>
                                    <Button size="sm" variant="outline" className="ml-4">
                                        <Crown className="h-4 w-4 mr-2" />
                                        Voir les plans
                                    </Button>
                                </div>
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Statistiques */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Factures</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalInvoices}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Payées</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.totalPaid}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">En retard</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.totalOverdue}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Revenus</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {new Intl.NumberFormat('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR'
                                }).format(stats.totalRevenue)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Datagrid */}
                <DatagridDocuments
                    documents={documentRows}
                    statusOptions={statusOptions}
                    filters={{
                        search: initialFilters.search,
                        status: initialFilters.status || "all",
                        dateRange: undefined as any
                    }}
                    onFiltersChange={handleFiltersChange}
                    onView={handleView}
                    onStatusChange={handleStatusChange}
                    onDownload={handleDownload}
                    onSend={handleSend}
                    onDelete={handleDelete}
                />

                {/* Modale de prévisualisation */}
                {selectedInvoice && (
                    <InvoicePreviewModal
                        invoice={selectedInvoice}
                        isOpen={isPreviewModalOpen}
                        onClose={handleClosePreview}
                    />
                )}
            </div>
        </InvoicesContext.Provider>
    );
} 
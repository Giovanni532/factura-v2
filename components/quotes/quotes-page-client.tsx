"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuoteWithDetails, QuoteStats } from "@/validation/quote-schema";
import { CreateQuoteButton } from "@/components/quotes/create-quote-button";
import { QuotesContext } from "@/hooks/quotes-context";
import { SubscriptionLimits } from "@/db/queries/subscription";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Crown } from "lucide-react";
import { DatagridDocuments, DocumentRow } from "../datagrid/datagrid-documents";
import { QuotePreviewModal } from "./quote-preview-modal";
import { useAction } from "next-safe-action/hooks";
import {
    updateQuoteStatusAction,
    deleteQuoteAction,
    sendQuoteAction,
    downloadQuoteAction
} from "@/action/quote-actions";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";

interface QuotesPageClientProps {
    quotes: QuoteWithDetails[];
    stats: QuoteStats;
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

export function QuotesPageClient({ quotes: initialQuotes, stats: initialStats, formData, subscriptionLimits, filters: initialFilters }: QuotesPageClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [quotes, setQuotes] = useState(initialQuotes);
    const [stats, setStats] = useState(initialStats);
    const [newQuote, setNewQuote] = useState(initialFilters.new);
    const [id, setId] = useState<string | null>(initialFilters.id);
    const [selectedQuote, setSelectedQuote] = useState<QuoteWithDetails | null>(null);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

    // Fonction pour recalculer les statistiques localement
    const recalculateStats = (updatedQuotes: QuoteWithDetails[]) => {
        const totalQuotes = updatedQuotes.length;
        const totalAccepted = updatedQuotes.filter(quote => quote.status === 'accepted').length;
        const totalRejected = updatedQuotes.filter(quote => quote.status === 'rejected').length;
        const totalPending = updatedQuotes.filter(quote => quote.status === 'sent').length;
        const totalRevenue = updatedQuotes
            .filter(quote => quote.status === 'accepted')
            .reduce((sum, quote) => sum + Number(quote.total), 0);
        const averageQuoteValue = totalQuotes > 0
            ? updatedQuotes.reduce((sum, quote) => sum + Number(quote.total), 0) / totalQuotes
            : 0;

        setStats({
            totalQuotes,
            totalAccepted,
            totalRejected,
            totalPending,
            totalRevenue,
            averageQuoteValue
        });
    };

    // Actions
    const { execute: executeStatusUpdate } = useAction(updateQuoteStatusAction, {
        onSuccess: (result) => {
            if (result.data) {
                toast.success(result.data.message);
                // Mettre à jour le devis dans la liste et recalculer les stats
                setQuotes((prev: any) => {
                    const updatedQuotes = prev.map((quote: any) =>
                        quote.id === result.data!.quote.id ? { ...quote, status: result.data!.quote.status } : quote
                    );
                    recalculateStats(updatedQuotes);
                    return updatedQuotes;
                });
            }
        },
        onError: (error) => {
            toast.error(error.error?.serverError?.message || "Erreur lors de la mise à jour du statut");
        }
    });

    const { execute: executeDelete } = useAction(deleteQuoteAction, {
        onSuccess: (result) => {
            if (result.data) {
                toast.success(result.data.message);
                // Supprimer le devis de la liste et recalculer les stats
                setQuotes(prev => {
                    const updatedQuotes = prev.filter(quote => quote.id !== selectedQuote?.id);
                    recalculateStats(updatedQuotes);
                    return updatedQuotes;
                });
                setSelectedQuote(null);
                setIsPreviewModalOpen(false);
            }
        },
        onError: (error) => {
            toast.error(error.error?.serverError?.message || "Erreur lors de la suppression");
        }
    });

    const { execute: executeSend } = useAction(sendQuoteAction, {
        onSuccess: (result) => {
            if (result.data) {
                toast.success(result.data.message);
                // Mettre à jour le statut du devis et recalculer les stats
                setQuotes((prev: any) => {
                    const updatedQuotes = prev.map((quote: any) =>
                        quote.id === selectedQuote?.id ? { ...quote, status: 'sent' } : quote
                    );
                    recalculateStats(updatedQuotes);
                    return updatedQuotes;
                });
            }
        },
        onError: (error) => {
            toast.error(error.error?.serverError?.message || "Erreur lors de l'envoi");
        }
    });

    const { execute: executeDownload } = useAction(downloadQuoteAction, {
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
                    link.download = result.data.filename || 'devis.pdf';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                    toast.success("Devis téléchargé avec succès");
                } catch (error) {
                    toast.error("Erreur lors du téléchargement du PDF");
                }
            }
        },
        onError: (error) => {
            toast.error(error.error?.serverError?.message || "Erreur lors du téléchargement");
        }
    });

    // Vérifier si on peut ajouter un nouveau devis (basé sur les documents combinés)
    const canAddNewQuote = subscriptionLimits.maxInvoices === -1 ||
        subscriptionLimits.currentDocuments < subscriptionLimits.maxInvoices;

    // Calculer le pourcentage d'utilisation des documents (devis + factures)
    const usagePercentage = subscriptionLimits.maxInvoices === -1 ? 0 :
        (subscriptionLimits.currentDocuments / subscriptionLimits.maxInvoices) * 100;

    // Déterminer si on doit afficher l'alerte
    const shouldShowAlert = subscriptionLimits.maxInvoices !== -1 &&
        (usagePercentage >= 80 || !canAddNewQuote);

    // Synchroniser l'ID avec les paramètres de recherche
    useEffect(() => {
        const currentId = searchParams.get('id');
        setId(currentId);

        // Si un ID est spécifié, ouvrir automatiquement la prévisualisation du document
        if (currentId) {
            const targetQuote = quotes.find(q => q.id === currentId);
            if (targetQuote) {
                setSelectedQuote(targetQuote);
                setIsPreviewModalOpen(true);
            }
        }
    }, [searchParams, quotes]);

    // Transformer les devis en DocumentRow
    const documentRows: DocumentRow[] = useMemo(() => {
        return quotes.map(quote => ({
            id: quote.id,
            type: "quote" as const,
            number: quote.quoteNumber,
            client: { id: quote.client.id, name: quote.client.name, email: quote.client.email },
            date: new Date(quote.issueDate).toISOString(),
            status: quote.status,
            amount: quote.total,
            currency: "EUR",
        }));
    }, [quotes]);

    // Options de statut pour le filtre
    const statusOptions = ['draft', 'sent', 'accepted', 'rejected', 'expired'];

    // Callbacks pour la datagrid
    const handleView = (doc: DocumentRow) => {
        const quote = quotes.find(q => q.id === doc.id);
        if (quote) {
            setSelectedQuote(quote);
            setIsPreviewModalOpen(true);
        }
    };

    const handleStatusChange = (doc: DocumentRow, status: string) => {
        executeStatusUpdate({ id: doc.id, status: status as any });
    };

    const handleDownload = (doc: DocumentRow) => {
        executeDownload({ quoteId: doc.id });
    };

    const handleSend = (doc: DocumentRow, subject: string, message: string) => {
        executeSend({
            quoteId: doc.id,
            subject,
            message
        });
    };

    const handleDelete = (doc: DocumentRow) => {
        const quote = quotes.find(q => q.id === doc.id);
        if (quote) {
            setSelectedQuote(quote);
            executeDelete({ id: doc.id });
            // Mettre à jour immédiatement la liste et recalculer les stats
            setQuotes(prev => {
                const updatedQuotes = prev.filter(q => q.id !== doc.id);
                recalculateStats(updatedQuotes);
                return updatedQuotes;
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

        router.push(`/dashboard/quotes?${params.toString()}`);
    };

    const handleClosePreview = () => {
        setIsPreviewModalOpen(false);
        setSelectedQuote(null);

        // Nettoyer l'ID de l'URL
        const params = new URLSearchParams(searchParams);
        params.delete('id');
        router.replace(`/dashboard/quotes?${params.toString()}`);
    };

    return (
        <QuotesContext.Provider value={{ quotes, setQuotes, stats, setStats }}>
            <div className="space-y-6">
                {/* En-tête */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Devis</h1>
                        <p className="text-muted-foreground">
                            Gérez vos devis et suivez vos conversions
                        </p>
                    </div>
                    <CreateQuoteButton
                        formData={formData}
                        newQuote={newQuote}
                        disabled={!canAddNewQuote}
                        limitReached={!canAddNewQuote}
                        planName={subscriptionLimits.planName}
                        maxDocuments={subscriptionLimits.maxInvoices}
                        currentDocuments={subscriptionLimits.currentDocuments}
                    />
                </div>

                {/* Alerte de limite d'abonnement */}
                {shouldShowAlert && (
                    <Alert className={!canAddNewQuote ? "border-red-200 bg-red-50" : "border-yellow-200 bg-yellow-50"}>
                        <AlertCircle className={`h-4 w-4 ${!canAddNewQuote ? "text-red-600" : "text-yellow-600"}`} />
                        <AlertDescription className={!canAddNewQuote ? "text-red-800" : "text-yellow-800"}>
                            {!canAddNewQuote ? (
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
                            <CardTitle className="text-sm font-medium">Total Devis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalQuotes}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Acceptés</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.totalAccepted}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">En attente</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.totalPending}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Valeur moyenne</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {new Intl.NumberFormat('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR'
                                }).format(stats.averageQuoteValue)}
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
                {selectedQuote && (
                    <QuotePreviewModal
                        quote={selectedQuote}
                        isOpen={isPreviewModalOpen}
                        onClose={handleClosePreview}
                    />
                )}
            </div>
        </QuotesContext.Provider>
    );
} 
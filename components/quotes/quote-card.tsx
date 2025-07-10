"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal, Eye, Edit, Trash2, Download, Send, Bell } from "lucide-react";
import { QuoteWithDetails } from "@/validation/quote-schema";
import { deleteQuoteAction, updateQuoteStatusAction, downloadQuoteAction, sendQuoteAction, remindQuoteAction } from "@/action/quote-actions";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { useQuotesContext } from "../../hooks/quotes-context";
import { QuotePreviewModal } from "./quote-preview-modal";

interface QuoteCardProps {
    quote: QuoteWithDetails;
    idToOpen: string | null;
}

export function QuoteCard({ quote, idToOpen }: QuoteCardProps) {
    const router = useRouter();
    const { quotes, setQuotes, stats, setStats } = useQuotesContext();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showSendDialog, setShowSendDialog] = useState(false);
    const [showReminderDialog, setShowReminderDialog] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [wasManuallyClosed, setWasManuallyClosed] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(quote.status);
    const [emailSubject, setEmailSubject] = useState(`Devis ${quote.quoteNumber} - ${quote.client.name}`);
    const [reminderSubject, setReminderSubject] = useState(`Rappel - Devis ${quote.quoteNumber} - ${quote.client.name}`);
    const [emailMessage, setEmailMessage] = useState(`Bonjour ${quote.client.name},

Veuillez trouver ci-joint le devis ${quote.quoteNumber} d'un montant de ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(quote.total)}.

Date de validité : ${new Intl.DateTimeFormat('fr-FR').format(quote.validUntil)}

Merci de votre confiance.

Cordialement,
Votre équipe`);
    const [reminderMessage, setReminderMessage] = useState(`Bonjour ${quote.client.name},

Nous vous rappelons que le devis ${quote.quoteNumber} d'un montant de ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(quote.total)} a expiré.

Date de validité : ${new Intl.DateTimeFormat('fr-FR').format(quote.validUntil)}

Si vous êtes toujours intéressé(e) par cette offre, merci de nous contacter pour la renouveler.

Cordialement,
Votre équipe`);

    // Ouvrir automatiquement la modal si l'ID correspond à ce devis
    useEffect(() => {
        if (idToOpen && idToOpen === quote.id && !wasManuallyClosed) {
            setShowPreviewModal(true);
        } else if (idToOpen && idToOpen !== quote.id && showPreviewModal) {
            // Fermer la modal si l'ID change et ne correspond plus à ce devis
            setShowPreviewModal(false);
            setWasManuallyClosed(false);
        } else if (!idToOpen) {
            // Réinitialiser wasManuallyClosed quand il n'y a plus d'ID
            setWasManuallyClosed(false);
        }
    }, [idToOpen, quote.id, wasManuallyClosed]);

    const { execute: executeDelete, isPending: isDeleting } = useAction(deleteQuoteAction, {
        onSuccess: (result) => {
            if (result?.data) {
                toast.success(result.data.message);
                setShowDeleteDialog(false);

                // Supprimer le devis de la liste locale
                const updatedQuotes = quotes.filter(q => q.id !== quote.id);
                setQuotes(updatedQuotes);

                // Mettre à jour les statistiques
                const newStats = {
                    ...stats,
                    totalQuotes: stats.totalQuotes - 1,
                    totalRevenue: stats.totalRevenue - quote.total,
                };

                // Ajuster les statistiques selon le statut
                if (quote.status === 'accepted') {
                    newStats.totalAccepted = Math.max(0, stats.totalAccepted - 1);
                } else if (quote.status === 'sent') {
                    newStats.totalPending = Math.max(0, stats.totalPending - 1);
                }

                setStats(newStats);
            }
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de la suppression");
        }
    });

    const { execute: executeStatusUpdate, isPending: isUpdatingStatus } = useAction(updateQuoteStatusAction, {
        onSuccess: (result) => {
            if (result?.data?.quote) {
                const data = result.data;
                toast.success(data.message);

                // Mettre à jour le devis dans la liste locale
                const updatedQuotes = quotes.map(q => {
                    if (q.id === quote.id) {
                        return {
                            ...q,
                            status: data.quote.status,
                            updatedAt: data.quote.updatedAt,
                        };
                    }
                    return q;
                });
                setQuotes(updatedQuotes as QuoteWithDetails[]);

                // Mettre à jour les statistiques
                const newStats = { ...stats };

                // Retirer l'ancien statut
                if (quote.status === 'accepted') {
                    newStats.totalAccepted = Math.max(0, newStats.totalAccepted - 1);
                    newStats.totalRevenue = Math.max(0, newStats.totalRevenue - quote.total);
                } else if (quote.status === 'sent') {
                    newStats.totalPending = Math.max(0, newStats.totalPending - 1);
                }

                // Ajouter le nouveau statut
                if (data.quote.status === 'accepted') {
                    newStats.totalAccepted = newStats.totalAccepted + 1;
                    newStats.totalRevenue = newStats.totalRevenue + quote.total;
                } else if (data.quote.status === 'sent') {
                    newStats.totalPending = newStats.totalPending + 1;
                }

                setStats(newStats);
            }
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de la mise à jour du statut");
        }
    });

    const { execute: executeDownload, isPending: isDownloading } = useAction(downloadQuoteAction, {
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

    const { execute: executeSend, isPending: isSending } = useAction(sendQuoteAction, {
        onSuccess: (result) => {
            if (result?.data) {
                toast.success(result.data.message);
                setShowSendDialog(false);

                // Mettre à jour le devis dans la liste locale
                const updatedQuotes = quotes.map(q => {
                    if (q.id === quote.id) {
                        return {
                            ...q,
                            status: 'sent' as const,
                            updatedAt: new Date(),
                        };
                    }
                    return q;
                });
                setQuotes(updatedQuotes);
            }
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de l'envoi");
        }
    });

    const { execute: executeReminder, isPending: isReminding } = useAction(remindQuoteAction, {
        onSuccess: (result) => {
            if (result?.data) {
                toast.success(result.data.message);
                setShowReminderDialog(false);
            }
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de l'envoi du rappel");
        }
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft': return 'bg-gray-100 text-gray-800';
            case 'sent': return 'bg-green-100 text-green-800';
            case 'accepted': return 'bg-blue-100 text-blue-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'expired': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'draft': return 'Brouillon';
            case 'sent': return 'Envoyé';
            case 'accepted': return 'Accepté';
            case 'rejected': return 'Refusé';
            case 'expired': return 'Expiré';
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
        setShowPreviewModal(true);
        // Ajouter l'ID à l'URL pour permettre le partage
        const url = new URL(window.location.href);
        url.searchParams.set('id', quote.id);
        window.history.replaceState({}, '', url.toString());
    };

    const handleEdit = () => {
        setShowStatusDialog(true);
    };

    const handleDelete = () => {
        executeDelete({ id: quote.id });
    };

    const handleStatusChange = () => {
        executeStatusUpdate({
            id: quote.id,
            status: selectedStatus as 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
        });
        setShowStatusDialog(false);
    };

    const handleDownload = () => {
        executeDownload({ quoteId: quote.id });
    };

    const handleSend = () => {
        setShowSendDialog(true);
    };

    const handleConfirmSend = () => {
        executeSend({
            quoteId: quote.id,
            subject: emailSubject,
            message: emailMessage
        });
    };

    const handleReminder = () => {
        setShowReminderDialog(true);
    };

    const handleConfirmReminder = () => {
        executeReminder({
            quoteId: quote.id,
            subject: reminderSubject,
            message: reminderMessage
        });
    };

    return (
        <>
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CardTitle className="text-lg">{quote.quoteNumber}</CardTitle>
                            <Badge className={getStatusColor(quote.status)}>
                                {getStatusLabel(quote.status)}
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
                                {(quote.status !== 'accepted' && quote.status !== 'rejected') && (
                                    <DropdownMenuItem onClick={handleEdit}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Modifier le statut
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={handleDownload} disabled={isDownloading}>
                                    <Download className="mr-2 h-4 w-4" />
                                    {isDownloading ? "Téléchargement..." : "Télécharger"}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleSend} disabled={isSending}>
                                    <Send className="mr-2 h-4 w-4" />
                                    {isSending ? "Envoi..." : "Envoyer"}
                                </DropdownMenuItem>
                                {quote.status === 'expired' && (
                                    <DropdownMenuItem onClick={handleReminder} disabled={isReminding}>
                                        <Bell className="mr-2 h-4 w-4" />
                                        {isReminding ? "Envoi du rappel..." : "Envoyer un rappel"}
                                    </DropdownMenuItem>
                                )}
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
                            <p className="font-medium">{quote.client.name}</p>
                            <p className="text-sm text-muted-foreground">{quote.client.email}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Dates</p>
                            <p className="text-sm">Émission: {formatDate(quote.issueDate)}</p>
                            <p className="text-sm">Validité: {formatDate(quote.validUntil)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Montant</p>
                            <p className="text-lg font-bold">{formatCurrency(quote.total)}</p>
                            <p className="text-sm text-muted-foreground">
                                {quote.items.length} prestation{quote.items.length > 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>

                    {quote.status === 'draft' && (
                        <div className="mt-4 flex gap-2">
                            <Button
                                size="sm"
                                onClick={handleSend}
                                disabled={isSending}
                            >
                                {isSending ? "Envoi..." : "Envoyer"}
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleEdit}
                            >
                                Modifier le statut
                            </Button>
                        </div>
                    )}
                    {(quote.status === 'sent' || quote.status === 'expired') && (
                        <div className="mt-4 flex gap-2">
                            {quote.status === 'expired' && (
                                <Button
                                    size="sm"
                                    onClick={handleReminder}
                                    disabled={isReminding}
                                >
                                    <Bell className="mr-2 h-4 w-4" />
                                    {isReminding ? "Envoi du rappel..." : "Envoyer un rappel"}
                                </Button>
                            )}
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleEdit}
                            >
                                Modifier le statut
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal de prévisualisation du devis */}
            <QuotePreviewModal
                quote={quote}
                isOpen={showPreviewModal}
                onClose={() => {
                    setShowPreviewModal(false);
                    setWasManuallyClosed(true);
                    // Nettoyer l'URL si la modal était ouverte via l'ID
                    if (idToOpen === quote.id) {
                        const url = new URL(window.location.href);
                        url.searchParams.delete('id');
                        window.history.replaceState({}, '', url.toString());
                    }
                }}
            />

            {/* Dialog de modification du statut */}
            <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Modifier le statut du devis</DialogTitle>
                        <DialogDescription>
                            Modifiez le statut du devis <strong>{quote.quoteNumber}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="status-select">Statut</Label>
                            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired')}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* On ne peut pas revenir à "draft" si le statut est "sent" ou plus */}
                                    {quote.status === 'draft' && (
                                        <SelectItem value="draft">Brouillon</SelectItem>
                                    )}
                                    <SelectItem value="sent">Envoyé</SelectItem>
                                    <SelectItem value="accepted">Accepté</SelectItem>
                                    <SelectItem value="rejected">Refusé</SelectItem>
                                    <SelectItem value="expired">Expiré</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowStatusDialog(false)}
                            disabled={isUpdatingStatus}
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleStatusChange}
                            disabled={isUpdatingStatus || selectedStatus === quote.status}
                        >
                            {isUpdatingStatus ? "Mise à jour..." : "Mettre à jour"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog de confirmation de suppression */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Supprimer le devis</DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer le devis {quote.quoteNumber} ?
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

            {/* Modal de confirmation d'envoi */}
            <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Envoyer le devis</DialogTitle>
                        <DialogDescription>
                            Le devis <strong>{quote.quoteNumber}</strong> sera envoyé à <strong>{quote.client.email}</strong> avec le PDF en pièce jointe.
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
                        <Button variant="outline" onClick={() => setShowSendDialog(false)} disabled={isSending}>
                            Annuler
                        </Button>
                        <Button onClick={handleConfirmSend} disabled={isSending}>
                            {isSending ? "Envoi en cours..." : "Envoyer"}
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
                            Un rappel pour le devis <strong>{quote.quoteNumber}</strong> sera envoyé à <strong>{quote.client.email}</strong> avec le PDF en pièce jointe.
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
                        <Button variant="outline" onClick={() => setShowReminderDialog(false)} disabled={isReminding}>
                            Annuler
                        </Button>
                        <Button onClick={handleConfirmReminder} disabled={isReminding}>
                            {isReminding ? "Envoi en cours..." : "Envoyer le rappel"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
} 
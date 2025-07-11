"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Send, Download, Trash2, X } from "lucide-react";
import { QuoteWithDetails } from "@/validation/quote-schema";
import { useAction } from "next-safe-action/hooks";
import { sendQuoteAction, downloadQuoteAction } from "@/action/quote-actions";
import { toast } from "sonner";

interface QuotePreviewModalProps {
    quote: QuoteWithDetails;
    isOpen: boolean;
    onClose: () => void;
}

export function QuotePreviewModal({ quote, isOpen, onClose }: QuotePreviewModalProps) {
    const [isSendModalOpen, setIsSendModalOpen] = useState(false);
    const [emailSubject, setEmailSubject] = useState(`Devis ${quote.quoteNumber}`);
    const [emailMessage, setEmailMessage] = useState("");

    const { execute: executeSend, isPending: isSending } = useAction(sendQuoteAction, {
        onSuccess: (result) => {
            if (result.data) {
                toast.success(result.data.message);
                setIsSendModalOpen(false);
                setEmailSubject(`Devis ${quote.quoteNumber}`);
                setEmailMessage("");
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

    const handleSend = () => {
        executeSend({
            quoteId: quote.id,
            subject: emailSubject,
            message: emailMessage
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'accepted': return 'bg-green-100 text-green-800';
            case 'sent': return 'bg-blue-100 text-blue-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'expired': return 'bg-orange-100 text-orange-800';
            case 'draft': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const translateStatus = (status: string): string => {
        const statusMap: Record<string, string> = {
            'draft': 'Brouillon',
            'sent': 'Envoyé',
            'accepted': 'Accepté',
            'rejected': 'Refusé',
            'expired': 'Expiré'
        };
        return statusMap[status] || status;
    };

    return (
        <>
            {/* Modale principale de prévisualisation */}
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span>Devis {quote.quoteNumber}</span>
                            <div className="flex items-center gap-2">
                                <Badge className={getStatusColor(quote.status)}>
                                    {translateStatus(quote.status)}
                                </Badge>
                                <Button variant="ghost" size="icon" onClick={onClose}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Informations client */}
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Client</h3>
                            <div className="bg-muted p-4 rounded-lg">
                                <p className="font-medium">{quote.client.name}</p>
                                <p className="text-sm text-muted-foreground">{quote.client.email}</p>
                                {quote.client.address && (
                                    <p className="text-sm text-muted-foreground">{quote.client.address}</p>
                                )}
                                {(quote.client.city || quote.client.postalCode) && (
                                    <p className="text-sm text-muted-foreground">
                                        {quote.client.postalCode} {quote.client.city}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Détails du devis */}
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Détails</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium">Date d'émission</Label>
                                    <p className="text-sm">{quote.issueDate.toLocaleDateString('fr-FR')}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Valide jusqu'au</Label>
                                    <p className="text-sm">{quote.validUntil.toLocaleDateString('fr-FR')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Articles */}
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Articles</h3>
                            <div className="border rounded-lg">
                                <div className="grid grid-cols-4 gap-4 p-3 bg-muted font-medium text-sm">
                                    <div>Description</div>
                                    <div>Quantité</div>
                                    <div>Prix unitaire</div>
                                    <div>Total</div>
                                </div>
                                {quote.items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-4 gap-4 p-3 border-t">
                                        <div className="text-sm">{item.description}</div>
                                        <div className="text-sm">{item.quantity}</div>
                                        <div className="text-sm">{formatCurrency(item.unitPrice)}</div>
                                        <div className="text-sm font-medium">{formatCurrency(item.total)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Totaux */}
                        <div className="flex justify-end">
                            <div className="w-64 space-y-2">
                                <div className="flex justify-between">
                                    <span>Sous-total:</span>
                                    <span>{formatCurrency(quote.subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>TVA:</span>
                                    <span>{formatCurrency(quote.vatAmount)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total:</span>
                                    <span>{formatCurrency(quote.total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {quote.notes && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Notes</h3>
                                <p className="text-sm bg-muted p-3 rounded-lg">{quote.notes}</p>
                            </div>
                        )}

                        {/* Conditions */}
                        {quote.terms && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Conditions</h3>
                                <p className="text-sm bg-muted p-3 rounded-lg">{quote.terms}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button
                                variant="outline"
                                onClick={() => setIsSendModalOpen(true)}
                                disabled={quote.status === 'accepted' || quote.status === 'rejected' || quote.status === 'expired'}
                            >
                                <Send className="h-4 w-4 mr-2" />
                                Envoyer
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => executeDownload({ quoteId: quote.id })}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Télécharger
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modale d'envoi d'email */}
            <Dialog open={isSendModalOpen} onOpenChange={setIsSendModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Envoyer le devis par email</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="email-subject">Objet</Label>
                            <Input
                                id="email-subject"
                                value={emailSubject}
                                onChange={(e) => setEmailSubject(e.target.value)}
                                placeholder="Objet de l'email"
                            />
                        </div>

                        <div>
                            <Label htmlFor="email-message">Message</Label>
                            <Textarea
                                id="email-message"
                                value={emailMessage}
                                onChange={(e) => setEmailMessage(e.target.value)}
                                placeholder="Message personnalisé..."
                                rows={4}
                            />
                        </div>

                        <div className="text-sm text-muted-foreground">
                            <p>Le devis sera envoyé à : <strong>{quote.client.email}</strong></p>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsSendModalOpen(false)}
                            >
                                Annuler
                            </Button>
                            <Button
                                onClick={handleSend}
                                disabled={isSending || !emailSubject.trim() || !emailMessage.trim()}
                            >
                                {isSending ? "Envoi..." : "Envoyer"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
} 
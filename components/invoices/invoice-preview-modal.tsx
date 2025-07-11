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
import { InvoiceWithDetails } from "@/validation/invoice-schema";
import { useAction } from "next-safe-action/hooks";
import { sendInvoiceAction, downloadInvoiceAction } from "@/action/invoice-actions";
import { toast } from "sonner";

interface InvoicePreviewModalProps {
    invoice: InvoiceWithDetails;
    isOpen: boolean;
    onClose: () => void;
}

export function InvoicePreviewModal({ invoice, isOpen, onClose }: InvoicePreviewModalProps) {
    const [isSendModalOpen, setIsSendModalOpen] = useState(false);
    const [emailSubject, setEmailSubject] = useState(`Facture ${invoice.invoiceNumber}`);
    const [emailMessage, setEmailMessage] = useState("");

    const { execute: executeSend, isPending: isSending } = useAction(sendInvoiceAction, {
        onSuccess: (result) => {
            if (result.data) {
                toast.success(result.data.message);
                setIsSendModalOpen(false);
                setEmailSubject(`Facture ${invoice.invoiceNumber}`);
                setEmailMessage("");
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

    const handleSend = () => {
        executeSend({
            invoiceId: invoice.id,
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
            case 'paid': return 'bg-green-100 text-green-800';
            case 'sent': return 'bg-blue-100 text-blue-800';
            case 'overdue': return 'bg-red-100 text-red-800';
            case 'draft': return 'bg-gray-100 text-gray-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const translateStatus = (status: string): string => {
        const statusMap: Record<string, string> = {
            'draft': 'Brouillon',
            'sent': 'Envoyée',
            'paid': 'Payée',
            'overdue': 'En retard',
            'cancelled': 'Annulée'
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
                            <span>Facture {invoice.invoiceNumber}</span>
                            <div className="flex items-center gap-2">
                                <Badge className={getStatusColor(invoice.status)}>
                                    {translateStatus(invoice.status)}
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
                                <p className="font-medium">{invoice.client.name}</p>
                                <p className="text-sm text-muted-foreground">{invoice.client.email}</p>
                                {invoice.client.address && (
                                    <p className="text-sm text-muted-foreground">{invoice.client.address}</p>
                                )}
                                {(invoice.client.city || invoice.client.postalCode) && (
                                    <p className="text-sm text-muted-foreground">
                                        {invoice.client.postalCode} {invoice.client.city}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Détails de la facture */}
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Détails</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium">Date d&apos;émission</Label>
                                    <p className="text-sm">{invoice.issueDate.toLocaleDateString('fr-FR')}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Date d&apos;échéance</Label>
                                    <p className="text-sm">{invoice.dueDate.toLocaleDateString('fr-FR')}</p>
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
                                {invoice.items.map((item, index) => (
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
                                    <span>{formatCurrency(invoice.subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>TVA:</span>
                                    <span>{formatCurrency(invoice.vatAmount)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total:</span>
                                    <span>{formatCurrency(invoice.total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {invoice.notes && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Notes</h3>
                                <p className="text-sm bg-muted p-3 rounded-lg">{invoice.notes}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button
                                variant="outline"
                                onClick={() => setIsSendModalOpen(true)}
                                disabled={invoice.status === 'paid' || invoice.status === 'cancelled'}
                            >
                                <Send className="h-4 w-4 mr-2" />
                                Envoyer
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => executeDownload({ invoiceId: invoice.id })}
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
                        <DialogTitle>Envoyer la facture par email</DialogTitle>
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
                            <p>La facture sera envoyée à : <strong>{invoice.client.email}</strong></p>
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
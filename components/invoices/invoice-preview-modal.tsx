"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Download, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InvoiceWithDetails } from "@/validation/invoice-schema";
import { getInvoicePreviewAction, downloadInvoiceAction, sendInvoiceAction } from "@/action/invoice-actions";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

interface InvoicePreviewModalProps {
    invoice: InvoiceWithDetails;
    isOpen: boolean;
    onClose: () => void;
}

export function InvoicePreviewModal({ invoice, isOpen, onClose }: InvoicePreviewModalProps) {
    const [previewHtml, setPreviewHtml] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    const { execute: executePreview, isPending: isPreviewLoading } = useAction(getInvoicePreviewAction, {
        onSuccess: (result) => {
            if (result?.data?.html) {
                setPreviewHtml(result.data.html);
            }
            setIsLoading(false);
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors du chargement de la prévisualisation");
            setIsLoading(false);
        }
    });

    const { execute: executeDownload, isPending: isDownloading } = useAction(downloadInvoiceAction, {
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

    const { execute: executeSend, isPending: isSending } = useAction(sendInvoiceAction, {
        onSuccess: (result) => {
            if (result?.data) {
                toast.success(result.data.message);
                onClose();
            }
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de l'envoi");
        }
    });

    useEffect(() => {
        if (isOpen && invoice) {
            setIsLoading(true);
            executePreview({ invoiceId: invoice.id });
        }
    }, [isOpen, invoice, executePreview]);

    const openInNewTab = () => {
        const newWindow = window.open();
        if (newWindow) {
            newWindow.document.write(previewHtml);
            newWindow.document.close();
        }
    };

    const handleDownload = () => {
        executeDownload({ invoiceId: invoice.id });
    };

    const handleSend = () => {
        // Utiliser les valeurs par défaut pour l'envoi rapide
        const defaultSubject = `Facture ${invoice.invoiceNumber} - ${invoice.client.name}`;
        const defaultMessage = `Bonjour ${invoice.client.name},

Veuillez trouver ci-joint la facture ${invoice.invoiceNumber} d'un montant de ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(invoice.total)}.

Date d'échéance : ${new Intl.DateTimeFormat('fr-FR').format(invoice.dueDate)}

Merci de votre confiance.

Cordialement,
Votre équipe`;

        executeSend({
            invoiceId: invoice.id,
            subject: defaultSubject,
            message: defaultMessage
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl min-w-[90vw] min-h-[90vh] max-h-[90vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl">
                            Aperçu : {invoice.invoiceNumber}
                        </DialogTitle>
                        <div className="flex gap-2 pr-6">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={openInNewTab}
                                className="flex items-center gap-2"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Ouvrir dans un nouvel onglet
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className="flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                {isDownloading ? "Téléchargement..." : "Télécharger"}
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSend}
                                disabled={isSending}
                                className="flex items-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                {isSending ? "Envoi..." : "Envoyer"}
                            </Button>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Prévisualisation de la facture {invoice.invoiceNumber} pour {invoice.client.name}
                    </p>
                </DialogHeader>

                <div className="flex-1 min-h-0">
                    <div className="h-full border rounded-lg overflow-hidden bg-white">
                        {isLoading || isPreviewLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                                    <p className="text-sm text-muted-foreground">Chargement de la prévisualisation...</p>
                                </div>
                            </div>
                        ) : (
                            <iframe
                                srcDoc={previewHtml}
                                className="w-full min-w-[90vw] min-h-[75vh] h-full border-0"
                                title={`Aperçu ${invoice.invoiceNumber}`}
                                sandbox="allow-same-origin"
                            />
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 
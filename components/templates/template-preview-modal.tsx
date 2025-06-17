"use client";

import { useState, useEffect } from "react";
import { X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TemplateWithFavorite } from "@/validation/template-schema";

interface TemplatePreviewModalProps {
    template: TemplateWithFavorite;
    isOpen: boolean;
    onClose: () => void;
}

export function TemplatePreviewModal({ template, isOpen, onClose }: TemplatePreviewModalProps) {
    const [previewHtml, setPreviewHtml] = useState<string>("");

    useEffect(() => {
        if (isOpen && template) {
            // Données d'exemple pour la prévisualisation
            const sampleData = {
                company: {
                    name: "Votre Entreprise SARL",
                    address: "123 Rue de l'Exemple",
                    city: "Paris",
                    postalCode: "75000",
                    country: "France",
                    email: "contact@votre-entreprise.fr",
                    phone: "01 23 45 67 89",
                    siret: "12345678901234",
                    vatNumber: "FR12345678901",
                    logo: null
                },
                client: {
                    name: "Client Exemple SAS",
                    address: "456 Avenue du Client",
                    city: "Lyon",
                    postalCode: "69000",
                    country: "France",
                    email: "client@exemple.fr",
                    siret: "98765432109876",
                    vatNumber: "FR98765432109"
                },
                invoice: {
                    number: "FACT-2024-001",
                    issueDate: "15/01/2024",
                    dueDate: "15/02/2024",
                    subtotal: "1000,00",
                    taxRate: "20",
                    taxAmount: "200,00",
                    total: "1200,00",
                    notes: "Merci pour votre confiance. Paiement sous 30 jours."
                },
                items: [
                    {
                        description: "Prestation de conseil",
                        quantity: "10",
                        unitPrice: "80,00",
                        total: "800,00"
                    },
                    {
                        description: "Formation personnalisée",
                        quantity: "1",
                        unitPrice: "200,00",
                        total: "200,00"
                    }
                ]
            };

            // Remplacer les placeholders Handlebars par les données d'exemple
            let html = template.html;

            // Remplacer les données de l'entreprise
            html = html.replace(/\{\{company\.name\}\}/g, sampleData.company.name);
            html = html.replace(/\{\{company\.address\}\}/g, sampleData.company.address);
            html = html.replace(/\{\{company\.city\}\}/g, sampleData.company.city);
            html = html.replace(/\{\{company\.postalCode\}\}/g, sampleData.company.postalCode);
            html = html.replace(/\{\{company\.country\}\}/g, sampleData.company.country);
            html = html.replace(/\{\{company\.email\}\}/g, sampleData.company.email);
            html = html.replace(/\{\{company\.phone\}\}/g, sampleData.company.phone);
            html = html.replace(/\{\{company\.siret\}\}/g, sampleData.company.siret);
            html = html.replace(/\{\{company\.vatNumber\}\}/g, sampleData.company.vatNumber);

            // Remplacer les données du client
            html = html.replace(/\{\{client\.name\}\}/g, sampleData.client.name);
            html = html.replace(/\{\{client\.address\}\}/g, sampleData.client.address);
            html = html.replace(/\{\{client\.city\}\}/g, sampleData.client.city);
            html = html.replace(/\{\{client\.postalCode\}\}/g, sampleData.client.postalCode);
            html = html.replace(/\{\{client\.country\}\}/g, sampleData.client.country);
            html = html.replace(/\{\{client\.email\}\}/g, sampleData.client.email);
            html = html.replace(/\{\{client\.siret\}\}/g, sampleData.client.siret);
            html = html.replace(/\{\{client\.vatNumber\}\}/g, sampleData.client.vatNumber);

            // Remplacer les données de la facture
            html = html.replace(/\{\{invoice\.number\}\}/g, sampleData.invoice.number);
            html = html.replace(/\{\{invoice\.issueDate\}\}/g, sampleData.invoice.issueDate);
            html = html.replace(/\{\{invoice\.dueDate\}\}/g, sampleData.invoice.dueDate);
            html = html.replace(/\{\{invoice\.subtotal\}\}/g, sampleData.invoice.subtotal);
            html = html.replace(/\{\{invoice\.taxRate\}\}/g, sampleData.invoice.taxRate);
            html = html.replace(/\{\{invoice\.taxAmount\}\}/g, sampleData.invoice.taxAmount);
            html = html.replace(/\{\{invoice\.total\}\}/g, sampleData.invoice.total);
            html = html.replace(/\{\{invoice\.notes\}\}/g, sampleData.invoice.notes);

            // Remplacer les boucles d'items (version simple)
            const itemsHtml = sampleData.items.map(item => `
                <tr>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>${item.unitPrice} €</td>
                    <td>${item.total} €</td>
                </tr>
            `).join('');

            html = html.replace(/\{\{#each items\}\}[\s\S]*?\{\{\/each\}\}/g, itemsHtml);

            // Remplacer les conditions (version simple)
            html = html.replace(/\{\{#if company\.logo\}\}[\s\S]*?\{\{\/if\}\}/g, '');
            html = html.replace(/\{\{#if company\.siret\}\}/g, '');
            html = html.replace(/\{\{\/if\}\}/g, '');
            html = html.replace(/\{\{#if invoice\.notes\}\}/g, '');

            // Remplacer le CSS
            html = html.replace(/\{\{CSS\}\}/g, template.css || '');

            setPreviewHtml(html);
        }
    }, [isOpen, template]);

    const openInNewTab = () => {
        const newWindow = window.open();
        if (newWindow) {
            newWindow.document.write(previewHtml);
            newWindow.document.close();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl min-w-[90vw] min-h-[90vh] max-h-[90vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl">
                            Aperçu : {template.name}
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
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Ceci est un aperçu avec des données d'exemple
                    </p>
                </DialogHeader>

                <div className="flex-1 min-h-0">
                    <div className="h-full border rounded-lg overflow-hidden bg-white">
                        <iframe
                            srcDoc={previewHtml}
                            className="w-full min-w-[90vw] min-h-[75vh] h-full border-0"
                            title={`Aperçu ${template.name}`}
                            sandbox="allow-same-origin"
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 
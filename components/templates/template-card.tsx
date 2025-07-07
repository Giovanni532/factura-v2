"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { Heart, Star, Eye, Settings, Trash2, CheckCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { toggleFavoriteAction, setDefaultTemplateAction, deleteTemplateAction } from "@/action/template-actions";
import { TemplateWithFavorite } from "@/validation/template-schema";
import { TemplatePreviewModal } from "./template-preview-modal";
import { useTemplatesContext } from "../../hooks/templates-context";

interface TemplateCardProps {
    template: TemplateWithFavorite;
    type: "predefined" | "company";
}

export function TemplateCard({ template, type }: TemplateCardProps) {
    const router = useRouter();
    const { defaultTemplateId, setDefaultTemplateId } = useTemplatesContext();
    const [isFavorite, setIsFavorite] = useState(!!template.isFavorite);
    const [showPreview, setShowPreview] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [previewHtml, setPreviewHtml] = useState<string>("");

    // Vérifier si ce template est par défaut en utilisant le contexte
    const isDefault = defaultTemplateId === template.id;

    // Générer le HTML de prévisualisation au chargement
    useEffect(() => {
        // Données d'exemple simplifiées pour le mini-aperçu
        const sampleData = {
            company: {
                name: "Entreprise",
                address: "123 Rue Example",
                city: "Paris",
                postalCode: "75000",
                country: "France",
                email: "contact@entreprise.fr",
                phone: "01 23 45 67 89",
                siret: "12345678901234",
                vatNumber: "FR12345678901"
            },
            client: {
                name: "Client Example",
                address: "456 Avenue Client",
                city: "Lyon",
                postalCode: "69000",
                country: "France",
                email: "client@example.fr"
            },
            invoice: {
                number: "FACT-001",
                issueDate: "15/01/2024",
                dueDate: "15/02/2024",
                subtotal: "1000,00",
                taxRate: "20",
                taxAmount: "200,00",
                total: "1200,00",
                notes: "Notes de la facture"
            },
            items: [
                {
                    description: "Prestation",
                    quantity: "5",
                    unitPrice: "100,00",
                    total: "500,00"
                },
                {
                    description: "Service",
                    quantity: "2",
                    unitPrice: "250,00",
                    total: "500,00"
                }
            ]
        };

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

        // Remplacer les données de la facture
        html = html.replace(/\{\{invoice\.number\}\}/g, sampleData.invoice.number);
        html = html.replace(/\{\{invoice\.issueDate\}\}/g, sampleData.invoice.issueDate);
        html = html.replace(/\{\{invoice\.dueDate\}\}/g, sampleData.invoice.dueDate);
        html = html.replace(/\{\{invoice\.subtotal\}\}/g, sampleData.invoice.subtotal);
        html = html.replace(/\{\{invoice\.taxRate\}\}/g, sampleData.invoice.taxRate);
        html = html.replace(/\{\{invoice\.taxAmount\}\}/g, sampleData.invoice.taxAmount);
        html = html.replace(/\{\{invoice\.total\}\}/g, sampleData.invoice.total);
        html = html.replace(/\{\{invoice\.notes\}\}/g, sampleData.invoice.notes);

        // Remplacer les boucles d'items
        const itemsHtml = sampleData.items.map(item => `
            <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>${item.unitPrice} €</td>
                <td>${item.total} €</td>
            </tr>
        `).join('');

        html = html.replace(/\{\{#each items\}\}[\s\S]*?\{\{\/each\}\}/g, itemsHtml);

        // Remplacer les conditions
        html = html.replace(/\{\{#if company\.logo\}\}[\s\S]*?\{\{\/if\}\}/g, '');
        html = html.replace(/\{\{#if company\.siret\}\}/g, '');
        html = html.replace(/\{\{\/if\}\}/g, '');
        html = html.replace(/\{\{#if invoice\.notes\}\}/g, '');

        // Remplacer le CSS avec zoom pour s'adapter au mini-aperçu
        const scaledCss = `
            ${template.css || ''}
            body { 
                transform: scale(0.25); 
                transform-origin: top left; 
                width: 400%; 
                height: 400%; 
                overflow: hidden;
                margin: 0;
                padding: 0;
            }
        `;
        html = html.replace(/\{\{CSS\}\}/g, scaledCss);

        setPreviewHtml(html);
    }, [template]);

    // Actions
    const { execute: toggleFavorite, isPending: isFavoriteLoading } = useAction(toggleFavoriteAction, {
        onSuccess: (result) => {
            if (result?.data) {
                setIsFavorite(result.data.action === "added");
                toast.success(result.data.message);
                router.refresh();
            }
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de la mise à jour des favoris");
        }
    });

    const { execute: setDefault, isPending: isDefaultLoading } = useAction(setDefaultTemplateAction, {
        onSuccess: (result) => {
            if (result?.data) {
                setDefaultTemplateId(template.id);
                toast.success(result.data.message);
            }
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de la définition du template par défaut");
        }
    });

    const { execute: deleteTemplate, isPending: isDeleteLoading } = useAction(deleteTemplateAction, {
        onSuccess: (result) => {
            if (result?.data) {
                toast.success(result.data.message);
                setShowDeleteDialog(false);
                // Recharger la page pour supprimer le template de la liste
                router.refresh()
            }
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de la suppression du template");
        }
    });

    const handleToggleFavorite = () => {
        toggleFavorite({ templateId: template.id });
    };

    const handleSetDefault = () => {
        setDefault({ templateId: template.id });
    };

    const handleDelete = () => {
        setShowDeleteDialog(true);
    };

    const handleConfirmDelete = () => {
        deleteTemplate({ templateId: template.id });
    };

    const handlePreview = () => {
        setShowPreview(true);
    };

    const handleUse = () => {
        // Rediriger vers la page de création appropriée selon le type de template
        if (template.type === 'invoice') {
            router.push(`/dashboard/invoices/create?template=${template.id}`);
        } else {
            router.push(`/dashboard/quotes/create?template=${template.id}`);
        }
    };

    return (
        <Card className="group relative transition-all duration-200 hover:shadow-lg">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg leading-tight">{template.name}</CardTitle>
                            {isDefault && (
                                <Badge variant="default" className="text-xs">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Par défaut
                                </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                                {template.type === 'invoice' ? 'Facture' : 'Devis'}
                            </Badge>
                        </div>
                        {template.description && (
                            <CardDescription className="text-sm line-clamp-2">
                                {template.description}
                            </CardDescription>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        {/* Bouton favori */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleToggleFavorite}
                            disabled={isFavoriteLoading}
                            className={`p-2 ${isFavorite ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'}`}
                        >
                            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                        </Button>

                        {/* Menu d'actions */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="p-2">
                                    <Settings className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handlePreview}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Prévisualiser
                                </DropdownMenuItem>

                                {!isDefault && (
                                    <DropdownMenuItem
                                        onClick={handleSetDefault}
                                        disabled={isDefaultLoading}
                                    >
                                        <Star className="w-4 h-4 mr-2" />
                                        Définir par défaut
                                    </DropdownMenuItem>
                                )}

                                {type === "company" && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={handleDelete}
                                            disabled={isDeleteLoading}
                                            className="text-red-600 focus:text-red-600"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Supprimer
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                {/* Mini-aperçu du template */}
                <div className="w-full h-32 bg-white rounded-md mb-4 border overflow-hidden relative">
                    {previewHtml ? (
                        <iframe
                            srcDoc={previewHtml}
                            className="w-full h-full border-0 pointer-events-none"
                            title={`Mini-aperçu ${template.name}`}
                            sandbox="allow-same-origin"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <div className="text-gray-400 text-sm">Génération de l&apos;aperçu...</div>
                        </div>
                    )}
                    {/* Overlay pour éviter les interactions avec l'iframe */}
                    <div className="absolute inset-0 bg-transparent" onClick={handlePreview} />
                </div>

                {/* Actions principales */}
                <div className="flex gap-2">
                    <Button onClick={handleUse} className="flex-1">
                        Utiliser ce template
                    </Button>
                    <Button variant="outline" onClick={handlePreview}>
                        <Eye className="w-4 h-4" />
                    </Button>
                </div>

                {/* Informations additionnelles */}
                <div className="mt-3 text-xs text-muted-foreground">
                    Créé le {template.createdAt.toLocaleDateString('fr-FR')}
                </div>
            </CardContent>

            {/* Modal de prévisualisation */}
            <TemplatePreviewModal
                template={template}
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
            />

            {/* Dialog de confirmation de suppression */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                                <AlertTriangle className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <DialogTitle>Supprimer ce template</DialogTitle>
                                <DialogDescription>
                                    Cette action est irréversible. Le template sera définitivement supprimé.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="py-4">
                        <div className="bg-muted/50 rounded-lg p-4">
                            <h4 className="font-medium text-sm mb-2">Template à supprimer :</h4>
                            <div className="space-y-1 text-sm">
                                <p><span className="font-medium">Nom :</span> {template.name}</p>
                                <p><span className="font-medium">Type :</span> {template.type === 'invoice' ? 'Facture' : 'Devis'}</p>
                                {template.description && (
                                    <p><span className="font-medium">Description :</span> {template.description}</p>
                                )}
                                <p><span className="font-medium">Créé le :</span> {template.createdAt.toLocaleDateString('fr-FR')}</p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                            disabled={isDeleteLoading}
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDelete}
                            disabled={isDeleteLoading}
                        >
                            {isDeleteLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    Suppression...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Supprimer définitivement
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
} 
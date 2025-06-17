"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { Heart, Star, Eye, Settings, Trash2, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface TemplateCardProps {
    template: TemplateWithFavorite;
    type: "predefined" | "company";
}

export function TemplateCard({ template, type }: TemplateCardProps) {
    const router = useRouter();
    const [isFavorite, setIsFavorite] = useState(!!template.isFavorite);
    const [isDefault, setIsDefault] = useState(template.isDefault);
    const [showPreview, setShowPreview] = useState(false);

    // Actions
    const { execute: toggleFavorite, isPending: isFavoriteLoading } = useAction(toggleFavoriteAction, {
        onSuccess: (result) => {
            if (result?.data) {
                setIsFavorite(result.data.action === "added");
                toast.success(result.data.message);
            }
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de la mise à jour des favoris");
        }
    });

    const { execute: setDefault, isPending: isDefaultLoading } = useAction(setDefaultTemplateAction, {
        onSuccess: (result) => {
            if (result?.data) {
                setIsDefault(true);
                toast.success(result.data.message);
                // Recharger la page pour mettre à jour les autres templates
                router.refresh()
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
        if (confirm("Êtes-vous sûr de vouloir supprimer ce template ?")) {
            deleteTemplate({ templateId: template.id });
        }
    };

    const handlePreview = () => {
        setShowPreview(true);
    };

    const handleUse = () => {
        // Rediriger vers la page de création de facture avec le template pré-sélectionné
        router.push(`/dashboard/invoices/new?template=${template.id}`);
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
                            {type === "predefined" && (
                                <Badge variant="secondary" className="text-xs">
                                    Factura
                                </Badge>
                            )}
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
                {/* Aperçu du template */}
                <div className="w-full h-32 bg-gray-100 rounded-md mb-4 flex items-center justify-center border">
                    {template.preview ? (
                        <img
                            src={template.preview}
                            alt={`Aperçu ${template.name}`}
                            className="w-full h-full object-cover rounded-md"
                        />
                    ) : (
                        <div className="text-gray-400 text-sm">Aucun aperçu</div>
                    )}
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
        </Card>
    );
} 
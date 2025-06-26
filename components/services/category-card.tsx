"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { Tag, Package, Edit, Trash2, AlertTriangle } from "lucide-react";
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
import { deleteServiceCategoryAction } from "@/action/service-actions";
import { ServiceCategory } from "@/validation/service-schema";
import { useServicesContext } from "./services-context";

interface CategoryCardProps {
    category: ServiceCategory;
}

export function CategoryCard({ category }: CategoryCardProps) {
    const { onCategoryDeleted } = useServicesContext();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const { execute: deleteCategory, isPending: isDeleteLoading } = useAction(deleteServiceCategoryAction, {
        onSuccess: (result) => {
            if (result?.data) {
                toast.success(result.data.message);
                setShowDeleteDialog(false);
                onCategoryDeleted(category.id);
            }
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de la suppression de la catégorie");
        }
    });

    const handleDelete = () => {
        setShowDeleteDialog(true);
    };

    const handleConfirmDelete = () => {
        deleteCategory({ categoryId: category.id });
    };

    return (
        <Card className="group relative transition-all duration-200 hover:shadow-lg">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <div
                                className="w-4 h-4 rounded-full border-2"
                                style={{
                                    backgroundColor: category.color || '#3b82f6',
                                    borderColor: category.color || '#3b82f6'
                                }}
                            />
                            <CardTitle className="text-lg leading-tight">{category.name}</CardTitle>
                            <Badge variant="outline" className="text-xs">
                                <Package className="w-3 h-3 mr-1" />
                                {category.serviceCount} prestation{category.serviceCount > 1 ? 's' : ''}
                            </Badge>
                        </div>
                        {category.description && (
                            <CardDescription className="text-sm line-clamp-2">
                                {category.description}
                            </CardDescription>
                        )}
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="p-2">
                                <Edit className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={handleDelete}
                                className="text-red-600 focus:text-red-600"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Supprimer
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                {/* Statistiques */}
                <div className="text-center p-4 bg-muted/50 rounded-lg mb-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Tag className="w-5 h-5" style={{ color: category.color || '#3b82f6' }} />
                        <div className="text-2xl font-bold" style={{ color: category.color || '#3b82f6' }}>
                            {category.serviceCount}
                        </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {category.serviceCount === 0
                            ? "Aucune prestation"
                            : category.serviceCount === 1
                                ? "1 prestation"
                                : `${category.serviceCount} prestations`
                        }
                    </div>
                </div>

                {/* Couleur */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color || '#3b82f6' }}
                        />
                        <span>Couleur : {category.color || '#3b82f6'}</span>
                    </div>
                </div>

                {/* Informations additionnelles */}
                <div className="text-xs text-muted-foreground">
                    Créée le {category.createdAt.toLocaleDateString('fr-FR')}
                </div>
            </CardContent>

            {/* Dialog de confirmation de suppression */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Supprimer cette catégorie</DialogTitle>
                        <DialogDescription>
                            {category.serviceCount > 0
                                ? "Impossible de supprimer cette catégorie car elle contient des prestations."
                                : "Cette action est irréversible. La catégorie sera définitivement supprimée."
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <div className="bg-muted/50 rounded-lg p-4">
                            <h4 className="font-medium text-sm mb-2">Catégorie à supprimer :</h4>
                            <div className="space-y-1 text-sm">
                                <p><span className="font-medium">Nom :</span> {category.name}</p>
                                {category.description && (
                                    <p><span className="font-medium">Description :</span> {category.description}</p>
                                )}
                                <p><span className="font-medium">Prestations :</span> {category.serviceCount}</p>
                                <p><span className="font-medium">Couleur :</span> {category.color || '#3b82f6'}</p>
                            </div>
                        </div>

                        {category.serviceCount > 0 && (
                            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span className="text-sm font-medium">Attention</span>
                                </div>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                    Vous devez d'abord supprimer ou déplacer toutes les prestations de cette catégorie.
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                        >
                            Annuler
                        </Button>
                        {category.serviceCount === 0 && (
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
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
} 
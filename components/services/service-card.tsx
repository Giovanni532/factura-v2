"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { Euro, Package, Calendar, Edit, Trash2, Tag } from "lucide-react";
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
import { deleteServiceAction } from "@/action/service-actions";
import { ServiceWithStats } from "@/validation/service-schema";
import { useServicesContext } from "./services-context";

interface ServiceCardProps {
    service: ServiceWithStats;
}

export function ServiceCard({ service }: ServiceCardProps) {
    const { onServiceDeleted } = useServicesContext();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const { execute: deleteService, isPending: isDeleteLoading } = useAction(deleteServiceAction, {
        onSuccess: (result) => {
            if (result?.data) {
                toast.success(result.data.message);
                setShowDeleteDialog(false);
                onServiceDeleted(service.id);
            }
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de la suppression du service");
        }
    });

    const handleDelete = () => {
        setShowDeleteDialog(true);
    };

    const handleConfirmDelete = () => {
        deleteService({ serviceId: service.id });
    };

    const getUnitLabel = (unit: string) => {
        switch (unit) {
            case 'hour': return 'heure';
            case 'day': return 'jour';
            case 'piece': return 'pièce';
            case 'service': return 'prestation';
            default: return unit;
        }
    };

    const getCurrencySymbol = (currency: string) => {
        switch (currency) {
            case 'EUR': return '€';
            case 'CHF': return 'CHF';
            default: return currency;
        }
    };

    return (
        <Card className="group relative transition-all duration-200 hover:shadow-lg">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg leading-tight">{service.name}</CardTitle>
                            <Badge variant={service.isActive ? "default" : "secondary"} className="text-xs">
                                {service.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {service.category && (
                                <Badge variant="outline" className="text-xs">
                                    <Tag className="w-3 h-3 mr-1" />
                                    {service.category}
                                </Badge>
                            )}
                        </div>
                        {service.description && (
                            <CardDescription className="text-sm line-clamp-2">
                                {service.description}
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
                {/* Prix et unité */}
                <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">Prix unitaire</div>
                        <div className="text-lg font-bold text-green-600">
                            {service.unitPrice.toLocaleString('fr-FR')} {getCurrencySymbol(service.currency)}
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                        <div className="text-sm text-muted-foreground">Unité</div>
                        <div className="text-sm font-medium">
                            {getUnitLabel(service.unit)}
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                        <div className="text-sm text-muted-foreground">TVA</div>
                        <div className="text-sm font-medium">
                            {service.taxRate}%
                        </div>
                    </div>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Package className="w-4 h-4 text-blue-600" />
                            <div className="text-lg font-bold text-blue-600">{service.totalUsage}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">Utilisations</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Euro className="w-4 h-4 text-green-600" />
                            <div className="text-lg font-bold text-green-600">
                                {service.totalRevenue.toLocaleString('fr-FR')} €
                            </div>
                        </div>
                        <div className="text-xs text-muted-foreground">CA généré</div>
                    </div>
                </div>

                {/* Dernière utilisation */}
                {service.lastUsed && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Calendar className="w-3 h-3" />
                        Dernière utilisation : {new Date(service.lastUsed).toLocaleDateString('fr-FR')}
                    </div>
                )}

                {/* Informations additionnelles */}
                <div className="text-xs text-muted-foreground">
                    Créé le {service.createdAt.toLocaleDateString('fr-FR')}
                </div>
            </CardContent>

            {/* Dialog de confirmation de suppression */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Supprimer cette prestation</DialogTitle>
                        <DialogDescription>
                            Cette action est irréversible. La prestation sera définitivement supprimée.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <div className="bg-muted/50 rounded-lg p-4">
                            <h4 className="font-medium text-sm mb-2">Prestation à supprimer :</h4>
                            <div className="space-y-1 text-sm">
                                <p><span className="font-medium">Nom :</span> {service.name}</p>
                                <p><span className="font-medium">Prix :</span> {service.unitPrice.toLocaleString('fr-FR')} {getCurrencySymbol(service.currency)}</p>
                                <p><span className="font-medium">Utilisations :</span> {service.totalUsage}</p>
                                <p><span className="font-medium">CA généré :</span> {service.totalRevenue.toLocaleString('fr-FR')} €</p>
                                {service.category && (
                                    <p><span className="font-medium">Catégorie :</span> {service.category}</p>
                                )}
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
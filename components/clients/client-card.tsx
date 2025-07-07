"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { Mail, Phone, MapPin, Building, Trash2, Edit, Eye, FileText, Receipt } from "lucide-react";
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
import { deleteClientAction } from "@/action/client-actions";
import { ClientWithStats } from "@/validation/client-schema";
import { useClientsContext } from "../../hooks/clients-context";

interface ClientCardProps {
    client: ClientWithStats;
}

export function ClientCard({ client }: ClientCardProps) {
    const router = useRouter();
    const { onClientDeleted } = useClientsContext();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const { execute: deleteClient, isPending: isDeleteLoading } = useAction(deleteClientAction, {
        onSuccess: (result) => {
            if (result?.data) {
                toast.success(result.data.message);
                setShowDeleteDialog(false);
                onClientDeleted(client.id);
            }
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de la suppression du client");
        }
    });

    const handleDelete = () => {
        setShowDeleteDialog(true);
    };

    const handleConfirmDelete = () => {
        deleteClient({ clientId: client.id });
    };

    const handleViewInvoices = () => {
        router.push(`/dashboard/invoices?client=${client.id}`);
    };

    const handleViewQuotes = () => {
        router.push(`/dashboard/quotes?client=${client.id}`);
    };

    const handleCreateInvoice = () => {
        router.push(`/dashboard/invoices?create=true&client=${client.id}`);
    };

    const handleCreateQuote = () => {
        router.push(`/dashboard/quotes?create=true&client=${client.id}`);
    };

    const isActive = client.totalInvoices > 0 || client.totalQuotes > 0;

    return (
        <Card className="group relative transition-all duration-200 hover:shadow-lg">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg leading-tight">{client.name}</CardTitle>
                            <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
                                {isActive ? "Actif" : "Inactif"}
                            </Badge>
                        </div>
                        <CardDescription className="text-sm">
                            {client.email}
                        </CardDescription>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="p-2">
                                <Edit className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleCreateInvoice}>
                                <FileText className="w-4 h-4 mr-2" />
                                Créer une facture
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleCreateQuote}>
                                <Receipt className="w-4 h-4 mr-2" />
                                Créer un devis
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleViewInvoices}>
                                <Eye className="w-4 h-4 mr-2" />
                                Voir les factures
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleViewQuotes}>
                                <Eye className="w-4 h-4 mr-2" />
                                Voir les devis
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
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
                {/* Informations de contact */}
                <div className="space-y-2 mb-4">
                    {client.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {client.phone}
                        </div>
                    )}
                    {(client.address || client.city || client.postalCode) && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <div>
                                {client.address && <div>{client.address}</div>}
                                {(client.city || client.postalCode) && (
                                    <div>{[client.postalCode, client.city].filter(Boolean).join(" ")}</div>
                                )}
                            </div>
                        </div>
                    )}
                    {(client.siret || client.vatNumber) && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Building className="w-3 h-3" />
                            {client.siret && <span>SIRET: {client.siret}</span>}
                            {client.vatNumber && <span>TVA: {client.vatNumber}</span>}
                        </div>
                    )}
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{client.totalInvoices}</div>
                        <div className="text-xs text-muted-foreground">Factures</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">{client.totalQuotes}</div>
                        <div className="text-xs text-muted-foreground">Devis</div>
                    </div>
                </div>

                {client.totalRevenue > 0 && (
                    <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg mb-4">
                        <div className="text-lg font-bold text-green-600">
                            {client.totalRevenue.toLocaleString('fr-FR')} €
                        </div>
                        <div className="text-xs text-muted-foreground">Chiffre d'affaires</div>
                    </div>
                )}

                {/* Actions principales */}
                <div className="flex gap-2">
                    <Button onClick={handleCreateInvoice} className="flex-1" size="sm">
                        <FileText className="w-4 h-4 mr-2" />
                        Facture
                    </Button>
                    <Button onClick={handleCreateQuote} variant="outline" size="sm">
                        <Receipt className="w-4 h-4 mr-2" />
                        Devis
                    </Button>
                </div>

                {/* Informations additionnelles */}
                <div className="mt-3 text-xs text-muted-foreground">
                    Client depuis le {client.createdAt.toLocaleDateString('fr-FR')}
                </div>
            </CardContent>

            {/* Dialog de confirmation de suppression */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Supprimer ce client</DialogTitle>
                        <DialogDescription>
                            Cette action est irréversible. Le client et toutes ses données seront définitivement supprimés.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <div className="bg-muted/50 rounded-lg p-4">
                            <h4 className="font-medium text-sm mb-2">Client à supprimer :</h4>
                            <div className="space-y-1 text-sm">
                                <p><span className="font-medium">Nom :</span> {client.name}</p>
                                <p><span className="font-medium">Email :</span> {client.email}</p>
                                <p><span className="font-medium">Factures :</span> {client.totalInvoices}</p>
                                <p><span className="font-medium">Devis :</span> {client.totalQuotes}</p>
                                <p><span className="font-medium">CA :</span> {client.totalRevenue.toLocaleString('fr-FR')} €</p>
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
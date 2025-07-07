"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Crown } from "lucide-react";
import { InvoiceWithDetails, InvoiceStats } from "@/validation/invoice-schema";
import { InvoiceCard } from "./invoice-card";
import { CreateInvoiceButton } from "./create-invoice-button";
import { InvoicesContext } from "../../hooks/invoices-context";
import { SubscriptionLimits } from "@/db/queries/subscription";

interface InvoicesPageClientProps {
    invoices: InvoiceWithDetails[];
    stats: InvoiceStats;
    formData?: any;
    subscriptionLimits: SubscriptionLimits;
    filters: {
        search: string;
        status: string;
        clientId: string;
        new: boolean;
        id: string;
    };
}

export function InvoicesPageClient({ invoices: initialInvoices, stats: initialStats, formData, subscriptionLimits, filters: initialFilters }: InvoicesPageClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState(initialFilters.search);
    const [statusFilter, setStatusFilter] = useState(initialFilters.status);
    const [invoices, setInvoices] = useState(initialInvoices);
    const [stats, setStats] = useState(initialStats);
    const [newInvoice, setNewInvoice] = useState(initialFilters.new);
    const [id, setId] = useState<string | null>(initialFilters.id);

    // Vérifier si on peut ajouter une nouvelle facture (basé sur les documents combinés)
    const canAddNewInvoice = subscriptionLimits.maxInvoices === -1 ||
        subscriptionLimits.currentDocuments < subscriptionLimits.maxInvoices;

    // Calculer le pourcentage d'utilisation des documents (devis + factures)
    const usagePercentage = subscriptionLimits.maxInvoices === -1 ? 0 :
        (subscriptionLimits.currentDocuments / subscriptionLimits.maxInvoices) * 100;

    // Déterminer si on doit afficher l'alerte
    const shouldShowAlert = subscriptionLimits.maxInvoices !== -1 &&
        (usagePercentage >= 80 || !canAddNewInvoice);

    // Synchroniser l'ID avec les paramètres de recherche
    useEffect(() => {
        const currentId = searchParams.get('id');
        setId(currentId);
    }, [searchParams]);

    // Filtrer les factures
    const filteredInvoices = useMemo(() => {
        return invoices.filter(invoice => {
            const matchesSearch = !search ||
                invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
                invoice.client.name.toLowerCase().includes(search.toLowerCase());

            const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [invoices, search, statusFilter]);

    const updateFilters = (newFilters: Partial<typeof initialFilters>) => {
        const params = new URLSearchParams(searchParams);

        if (newFilters.search !== undefined) {
            if (newFilters.search) {
                params.set('search', newFilters.search);
            } else {
                params.delete('search');
            }
        }

        if (newFilters.status !== undefined) {
            if (newFilters.status !== 'all') {
                params.set('status', newFilters.status);
            } else {
                params.delete('status');
            }
        }

        if (newFilters.clientId !== undefined) {
            if (newFilters.clientId) {
                params.set('client', newFilters.clientId);
            } else {
                params.delete('client');
            }
        }

        if (newFilters.new !== undefined) {
            if (newFilters.new) {
                setNewInvoice(true);
            } else {
                setNewInvoice(false);
            }
        }

        if (newFilters.id !== undefined) {
            if (newFilters.id) {
                setId(newFilters.id);
            } else {
                setId(null);
            }
        }

        router.push(`/dashboard/invoices?${params.toString()}`);
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        updateFilters({ search: value });
    };

    const handleStatusFilter = (value: string) => {
        setStatusFilter(value);
        updateFilters({ status: value });
    };

    const clearFilters = () => {
        setSearch("");
        setStatusFilter("all");
        updateFilters({ search: "", status: "all" });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    };

    return (
        <InvoicesContext.Provider value={{ invoices, setInvoices, stats, setStats }}>
            <div className="space-y-6">
                {/* En-tête */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Factures</h1>
                        <p className="text-muted-foreground">
                            Gérez vos factures et suivez vos paiements
                        </p>
                    </div>
                    <CreateInvoiceButton
                        formData={formData}
                        newInvoice={newInvoice}
                        disabled={!canAddNewInvoice}
                        limitReached={!canAddNewInvoice}
                        planName={subscriptionLimits.planName}
                        maxInvoices={subscriptionLimits.maxInvoices}
                    />
                </div>

                {/* Alerte de limite d'abonnement */}
                {shouldShowAlert && (
                    <Alert className={!canAddNewInvoice ? "border-red-200 bg-red-50" : "border-yellow-200 bg-yellow-50"}>
                        <AlertCircle className={`h-4 w-4 ${!canAddNewInvoice ? "text-red-600" : "text-yellow-600"}`} />
                        <AlertDescription className={!canAddNewInvoice ? "text-red-800" : "text-yellow-800"}>
                            {!canAddNewInvoice ? (
                                <div className="flex items-center justify-between">
                                    <span>
                                        <strong>Limite atteinte !</strong> Vous avez atteint la limite de {subscriptionLimits.maxInvoices} documents
                                        (devis + factures) pour le plan {subscriptionLimits.planName}.
                                    </span>
                                    <Button size="sm" className="ml-4">
                                        <Crown className="h-4 w-4 mr-2" />
                                        Upgrader
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <span>
                                        <strong>Attention !</strong> Vous utilisez {subscriptionLimits.currentDocuments}/{subscriptionLimits.maxInvoices} documents
                                        (devis + factures) de votre plan {subscriptionLimits.planName}.
                                    </span>
                                    <Button size="sm" variant="outline" className="ml-4">
                                        <Crown className="h-4 w-4 mr-2" />
                                        Voir les plans
                                    </Button>
                                </div>
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Statistiques */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {subscriptionLimits.currentDocuments}
                                {subscriptionLimits.maxInvoices !== -1 && (
                                    <span className="text-sm text-muted-foreground">
                                        /{subscriptionLimits.maxInvoices}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.totalInvoices} factures + {subscriptionLimits.currentQuotes} devis
                                {subscriptionLimits.maxInvoices !== -1 && (
                                    <span className="block">
                                        Plan {subscriptionLimits.planName}
                                    </span>
                                )}
                            </p>
                            {/* Barre de progression */}
                            {subscriptionLimits.maxInvoices !== -1 && (
                                <div className="mt-2">
                                    <div className="w-full bg-muted rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all ${usagePercentage >= 100 ? 'bg-red-500' :
                                                usagePercentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                                                }`}
                                            style={{ width: `${Math.min(100, usagePercentage)}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Payées</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.totalPaid}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">En retard</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.totalOverdue}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Chiffre d&apos;affaires</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filtres */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filtres</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                            <div className="flex-1">
                                <Input
                                    placeholder="Rechercher par numéro ou client..."
                                    value={search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={handleStatusFilter}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les statuts</SelectItem>
                                    <SelectItem value="draft">Brouillon</SelectItem>
                                    <SelectItem value="sent">Envoyée</SelectItem>
                                    <SelectItem value="paid">Payée</SelectItem>
                                    <SelectItem value="overdue">En retard</SelectItem>
                                    <SelectItem value="cancelled">Annulée</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                onClick={clearFilters}
                                className="w-full md:w-auto"
                            >
                                Réinitialiser
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Liste des factures */}
                {filteredInvoices.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <div className="text-muted-foreground mb-4">
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Aucune facture trouvée</h3>
                            <p className="text-muted-foreground text-center">
                                {search || statusFilter !== 'all'
                                    ? "Aucune facture ne correspond à vos critères de recherche."
                                    : "Commencez par créer votre première facture."
                                }
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {filteredInvoices.map((invoice) => (
                            <InvoiceCard key={invoice.id} invoice={invoice} idToOpen={id} />
                        ))}
                    </div>
                )}
            </div>
        </InvoicesContext.Provider>
    );
} 
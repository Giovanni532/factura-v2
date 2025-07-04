"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

    // Vérifier si on peut ajouter une nouvelle facture
    const canAddNewInvoice = subscriptionLimits.maxInvoices === -1 ||
        invoices.length < subscriptionLimits.maxInvoices;

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

                {/* Statistiques */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Factures</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.totalInvoices}
                                {subscriptionLimits.maxInvoices !== -1 && (
                                    <span className="text-sm text-muted-foreground">
                                        /{subscriptionLimits.maxInvoices}
                                    </span>
                                )}
                            </div>
                            {subscriptionLimits.maxInvoices !== -1 && (
                                <p className="text-xs text-muted-foreground">
                                    Plan {subscriptionLimits.planName}
                                </p>
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
                            <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
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
                            <Button variant="outline" onClick={clearFilters}>
                                Effacer
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Liste des factures */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Factures ({filteredInvoices.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {filteredInvoices.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground pb-4">
                                    {search || statusFilter !== 'all'
                                        ? "Aucune facture ne correspond aux filtres"
                                        : "Aucune facture trouvée"}
                                </p>
                                {search || statusFilter !== 'all' ? (
                                    <Button variant="outline" onClick={clearFilters} className="mt-2">
                                        Effacer les filtres
                                    </Button>
                                ) : (
                                    <CreateInvoiceButton formData={formData} newInvoice={newInvoice} />
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredInvoices.map((invoice) => (
                                    <InvoiceCard key={invoice.id} invoice={invoice} idToOpen={id} />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </InvoicesContext.Provider>
    );
} 
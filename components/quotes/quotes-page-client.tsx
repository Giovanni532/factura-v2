"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuoteWithDetails, QuoteStats } from "@/validation/quote-schema";
import { QuoteCard } from "@/components/quotes/quote-card";
import { CreateQuoteButton } from "@/components/quotes/create-quote-button";
import { QuotesContext } from "@/components/quotes/quotes-context";

interface QuotesPageClientProps {
    quotes: QuoteWithDetails[];
    stats: QuoteStats;
    formData?: any;
    filters: {
        search: string;
        status: string;
        clientId: string;
        new: boolean;
    };
}

export function QuotesPageClient({ quotes: initialQuotes, stats: initialStats, formData, filters: initialFilters }: QuotesPageClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(initialFilters.search);
    const [statusFilter, setStatusFilter] = useState(initialFilters.status);
    const [quotes, setQuotes] = useState(initialQuotes);
    const [stats, setStats] = useState(initialStats);
    const [newQuote, setNewQuote] = useState(initialFilters.new);
    // Filtrer les devis
    const filteredQuotes = useMemo(() => {
        return quotes.filter(quote => {
            const matchesSearch = !search ||
                quote.quoteNumber.toLowerCase().includes(search.toLowerCase()) ||
                quote.client.name.toLowerCase().includes(search.toLowerCase());

            const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [quotes, search, statusFilter]);

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
                setNewQuote(true);
            } else {
                setNewQuote(false);
            }
        }

        router.push(`/dashboard/quotes?${params.toString()}`);
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
        <QuotesContext.Provider value={{ quotes, setQuotes, stats, setStats }}>
            <div className="space-y-6">
                {/* En-tête */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Devis</h1>
                        <p className="text-muted-foreground">
                            Gérez vos devis et suivez vos conversions
                        </p>
                    </div>
                    <CreateQuoteButton formData={formData} newQuote={newQuote} />
                </div>

                {/* Statistiques */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Devis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalQuotes}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Acceptés</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.totalAccepted}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">En attente</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.totalPending}</div>
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
                                    <SelectItem value="sent">Envoyé</SelectItem>
                                    <SelectItem value="accepted">Accepté</SelectItem>
                                    <SelectItem value="rejected">Refusé</SelectItem>
                                    <SelectItem value="expired">Expiré</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" onClick={clearFilters}>
                                Effacer
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Liste des devis */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Devis ({filteredQuotes.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {filteredQuotes.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground pb-4">
                                    {search || statusFilter !== 'all'
                                        ? "Aucun devis ne correspond aux filtres"
                                        : "Aucun devis trouvé"}
                                </p>
                                {search || statusFilter !== 'all' ? (
                                    <Button variant="outline" onClick={clearFilters} className="mt-2">
                                        Effacer les filtres
                                    </Button>
                                ) : (
                                    <CreateQuoteButton formData={formData} newQuote={newQuote} />
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredQuotes.map((quote) => (
                                    <QuoteCard key={quote.id} quote={quote} />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </QuotesContext.Provider>
    );
} 
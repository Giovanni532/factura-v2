"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter, Users, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientWithStats } from "@/validation/client-schema";
import { ClientCard } from "@/components/clients/client-card";
import { CreateClientButton } from "@/components/clients/create-client-button";
import { ClientsContext } from "@/components/clients/clients-context";

interface ClientsPageClientProps {
    initialClients: ClientWithStats[];
}

export function ClientsPageClient({ initialClients }: ClientsPageClientProps) {
    const router = useRouter();
    const [clients, setClients] = useState<ClientWithStats[]>(initialClients);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

    // Filtrer les clients
    const filteredClients = clients.filter(client => {
        const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.email.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesFilter = true;
        if (filter === "active") {
            matchesFilter = client.totalInvoices > 0 || client.totalQuotes > 0;
        } else if (filter === "inactive") {
            matchesFilter = client.totalInvoices === 0 && client.totalQuotes === 0;
        }

        return matchesSearch && matchesFilter;
    });

    // Statistiques globales
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.totalInvoices > 0 || c.totalQuotes > 0).length;
    const totalRevenue = clients.reduce((sum, client) => sum + client.totalRevenue, 0);

    const handleClientCreated = (newClient: ClientWithStats) => {
        setClients(prev => [newClient, ...prev]);
    };

    const handleClientUpdated = (updatedClient: ClientWithStats) => {
        setClients(prev => prev.map(client =>
            client.id === updatedClient.id ? updatedClient : client
        ));
    };

    const handleClientDeleted = (clientId: string) => {
        setClients(prev => prev.filter(client => client.id !== clientId));
    };

    return (
        <ClientsContext.Provider value={{
            clients,
            setClients,
            onClientCreated: handleClientCreated,
            onClientUpdated: handleClientUpdated,
            onClientDeleted: handleClientDeleted,
        }}>
            <div className="space-y-6">
                {/* Statistiques */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalClients}</div>
                            <p className="text-xs text-muted-foreground">
                                {activeClients} clients actifs
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Chiffre d'Affaires</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalRevenue.toLocaleString('fr-FR')} €</div>
                            <p className="text-xs text-muted-foreground">
                                Total des factures payées
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Moyenne par Client</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {totalClients > 0 ? (totalRevenue / totalClients).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) : 0} €
                            </div>
                            <p className="text-xs text-muted-foreground">
                                CA moyen par client
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Barre d'outils */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-1 items-center space-x-2 max-w-sm">
                        <div className="relative flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher un client..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            <Button
                                variant={filter === "all" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilter("all")}
                            >
                                Tous
                            </Button>
                            <Button
                                variant={filter === "active" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilter("active")}
                            >
                                Actifs
                            </Button>
                            <Button
                                variant={filter === "inactive" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilter("inactive")}
                            >
                                Inactifs
                            </Button>
                        </div>
                        <CreateClientButton />
                    </div>
                </div>

                {/* Liste des clients */}
                {filteredClients.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Users className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">
                                {searchTerm ? "Aucun client trouvé" : "Aucun client"}
                            </h3>
                            <p className="text-muted-foreground text-center mb-4">
                                {searchTerm
                                    ? "Aucun client ne correspond à votre recherche."
                                    : "Commencez par ajouter votre premier client."
                                }
                            </p>
                            {!searchTerm && <CreateClientButton />}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredClients.map((client) => (
                            <ClientCard key={client.id} client={client} />
                        ))}
                    </div>
                )}
            </div>
        </ClientsContext.Provider>
    );
} 
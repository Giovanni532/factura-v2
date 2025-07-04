"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter, Users, TrendingUp, Calendar, AlertCircle, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ClientWithStats } from "@/validation/client-schema";
import { ClientCard } from "@/components/clients/client-card";
import { CreateClientButton } from "@/components/clients/create-client-button";
import { ClientsContext } from "@/hooks/clients-context";
import { SubscriptionLimits } from "@/db/queries/subscription";

interface ClientsPageClientProps {
    initialClients: ClientWithStats[];
    newClient: boolean;
    subscriptionLimits: SubscriptionLimits;
}

export function ClientsPageClient({ initialClients, newClient, subscriptionLimits }: ClientsPageClientProps) {
    const [clients, setClients] = useState<ClientWithStats[]>(initialClients);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
    const [newClientUrl, setNewClientUrl] = useState(newClient);

    // Vérifier si on peut ajouter un nouveau client
    const canAddNewClient = subscriptionLimits.maxClients === -1 ||
        clients.length < subscriptionLimits.maxClients;

    // Calculer le pourcentage d'utilisation
    const usagePercentage = subscriptionLimits.maxClients === -1 ? 0 :
        (clients.length / subscriptionLimits.maxClients) * 100;

    // Déterminer si on doit afficher l'alerte
    const shouldShowAlert = subscriptionLimits.maxClients !== -1 &&
        (usagePercentage >= 80 || !canAddNewClient);

    useEffect(() => {
        setNewClientUrl(newClient);
    }, [newClient]);

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
                {/* Alerte de limite d'abonnement */}
                {shouldShowAlert && (
                    <Alert className={!canAddNewClient ? "border-red-200 bg-red-50" : "border-yellow-200 bg-yellow-50"}>
                        <AlertCircle className={`h-4 w-4 ${!canAddNewClient ? "text-red-600" : "text-yellow-600"}`} />
                        <AlertDescription className={!canAddNewClient ? "text-red-800" : "text-yellow-800"}>
                            {!canAddNewClient ? (
                                <div className="flex items-center justify-between">
                                    <span>
                                        <strong>Limite atteinte !</strong> Vous avez atteint la limite de {subscriptionLimits.maxClients} clients
                                        pour le plan {subscriptionLimits.planName}.
                                    </span>
                                    <Button size="sm" className="ml-4">
                                        <Crown className="h-4 w-4 mr-2" />
                                        Upgrader
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <span>
                                        <strong>Attention !</strong> Vous utilisez {clients.length}/{subscriptionLimits.maxClients} clients
                                        de votre plan {subscriptionLimits.planName}.
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
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {totalClients}
                                {subscriptionLimits.maxClients !== -1 && (
                                    <span className="text-sm text-muted-foreground">
                                        /{subscriptionLimits.maxClients}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {activeClients} clients actifs
                                {subscriptionLimits.maxClients !== -1 && (
                                    <span className="block">
                                        Plan {subscriptionLimits.planName}
                                    </span>
                                )}
                            </p>
                            {/* Barre de progression */}
                            {subscriptionLimits.maxClients !== -1 && (
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
                        <CreateClientButton
                            newClient={newClientUrl}
                            disabled={!canAddNewClient}
                            limitReached={!canAddNewClient}
                            planName={subscriptionLimits.planName}
                            maxClients={subscriptionLimits.maxClients}
                        />
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
                            {!searchTerm && (
                                <CreateClientButton
                                    newClient={newClientUrl}
                                    disabled={!canAddNewClient}
                                    limitReached={!canAddNewClient}
                                    planName={subscriptionLimits.planName}
                                    maxClients={subscriptionLimits.maxClients}
                                />
                            )}
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
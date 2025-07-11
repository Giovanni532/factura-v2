"use client";

import { useEffect, useState } from "react";
import { Users, TrendingUp, Calendar, AlertCircle, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ClientWithStats } from "@/validation/client-schema";
import { ClientsContext } from "@/hooks/clients-context";
import { SubscriptionLimits } from "@/db/queries/subscription";
import { ClientsDataGrid } from "@/components/datagrid/datagrid-client";

interface ClientsPageClientProps {
    initialClients: ClientWithStats[];
    newClient: boolean;
    subscriptionLimits: SubscriptionLimits;
    searchParams: { [key: string]: string };
}

export function ClientsPageClient({ initialClients, newClient, subscriptionLimits, searchParams }: ClientsPageClientProps) {
    const [clients, setClients] = useState<ClientWithStats[]>(initialClients);
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

    // Mettre à jour les clients quand initialClients change
    useEffect(() => {
        setClients(initialClients);
    }, [initialClients]);

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
                            <CardTitle className="text-sm font-medium">Chiffre d&apos;Affaires</CardTitle>
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

                {/* Datagrid des clients */}
                <ClientsDataGrid
                    initialClients={clients}
                    newClient={newClientUrl}
                    subscriptionLimits={subscriptionLimits}
                    searchParams={searchParams}
                    onClientCreated={handleClientCreated}
                    onClientUpdated={handleClientUpdated}
                    onClientDeleted={handleClientDeleted}
                />
            </div>
        </ClientsContext.Provider>
    );
} 
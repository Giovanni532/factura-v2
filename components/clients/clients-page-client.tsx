"use client";

import { useEffect, useState } from "react";
import { Users, TrendingUp, Calendar, AlertCircle, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LedgerStats } from "@/components/ledger";
import { formatCurrency } from "@/lib/utils";
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
                    <Alert className={!canAddNewClient ? "border-destructive/25 bg-destructive/[0.06]" : "border-warning/25 bg-warning/[0.06]"}>
                        <AlertCircle className={`h-4 w-4 ${!canAddNewClient ? "text-destructive" : "text-warning"}`} />
                        <AlertDescription className={!canAddNewClient ? "text-destructive" : "text-warning"}>
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
                <LedgerStats
                    items={[
                        {
                            label: "Clients",
                            value: subscriptionLimits.maxClients !== -1 ? `${totalClients} / ${subscriptionLimits.maxClients}` : totalClients,
                            detail: subscriptionLimits.maxClients !== -1
                                ? `${activeClients} actifs · plan ${subscriptionLimits.planName} (${Math.min(100, Math.round(usagePercentage))} % utilisé)`
                                : `${activeClients} actifs`,
                            icon: Users,
                        },
                        {
                            label: "Chiffre d'affaires",
                            value: formatCurrency(totalRevenue, "EUR"),
                            detail: "Total des factures payées",
                            icon: TrendingUp,
                        },
                        {
                            label: "Moyenne par client",
                            value: formatCurrency(totalClients > 0 ? totalRevenue / totalClients : 0, "EUR"),
                            detail: "Chiffre d'affaires moyen",
                            icon: Calendar,
                        },
                    ]}
                />

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
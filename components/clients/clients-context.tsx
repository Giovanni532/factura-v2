"use client";

import { createContext, useContext } from "react";
import { ClientWithStats } from "@/validation/client-schema";

interface ClientsContextType {
    clients: ClientWithStats[];
    setClients: (clients: ClientWithStats[]) => void;
    onClientCreated: (client: ClientWithStats) => void;
    onClientUpdated: (client: ClientWithStats) => void;
    onClientDeleted: (clientId: string) => void;
}

export const ClientsContext = createContext<ClientsContextType | undefined>(undefined);

export function useClientsContext() {
    const context = useContext(ClientsContext);
    if (context === undefined) {
        throw new Error("useClientsContext must be used within a ClientsContextProvider");
    }
    return context;
} 
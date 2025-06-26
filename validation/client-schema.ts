import { z } from "zod";

// Schéma pour créer un nouveau client
export const createClientSchema = z.object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100, "Le nom est trop long"),
    email: z.string().email("Email invalide"),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
    siret: z.string().optional(),
    vatNumber: z.string().optional(),
});

// Schéma pour modifier un client existant
export const updateClientSchema = z.object({
    id: z.string().min(1, "ID du client requis"),
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100, "Le nom est trop long"),
    email: z.string().email("Email invalide"),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
    siret: z.string().optional(),
    vatNumber: z.string().optional(),
});

// Schéma pour supprimer un client
export const deleteClientSchema = z.object({
    clientId: z.string().min(1, "ID du client requis"),
});

// Type pour les clients avec informations complètes
export type ClientWithStats = {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    city: string | null;
    postalCode: string | null;
    country: string | null;
    siret: string | null;
    vatNumber: string | null;
    companyId: string;
    createdAt: Date;
    updatedAt: Date;
    // Statistiques
    totalInvoices: number;
    totalQuotes: number;
    totalRevenue: number;
    lastInvoiceDate: Date | null;
    lastQuoteDate: Date | null;
}; 
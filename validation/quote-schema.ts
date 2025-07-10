import { z } from "zod";

// Schéma pour un article de devis
export const quoteItemSchema = z.object({
    description: z.string().min(1, "Description requise"),
    quantity: z.number().min(0.01, "Quantité doit être supérieure à 0"),
    unitPrice: z.number().min(0, "Prix unitaire doit être positif"),
    total: z.number().min(0, "Total doit être positif"),
});

// Schéma pour créer un devis
export const createQuoteSchema = z.object({
    quoteNumber: z.string().optional(),
    status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired']).default('draft'),
    issueDate: z.string().min(1, "Date d'émission requise"),
    validUntil: z.string().min(1, "Date de validité requise"),
    subtotal: z.number().min(0, "Sous-total doit être positif"),
    vatAmount: z.number().min(0, "Montant TVA doit être positif"),
    total: z.number().min(0, "Total doit être positif"),
    notes: z.string().optional(),
    terms: z.string().optional(),
    clientId: z.string().min(1, "Client requis"),
    templateId: z.string().optional(),
    items: z.array(quoteItemSchema).min(1, "Au moins un article requis"),
});

// Schéma pour mettre à jour un devis
export const updateQuoteSchema = z.object({
    id: z.string().min(1, "ID du devis requis"),
    quoteNumber: z.string().optional(),
    status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired']).optional(),
    issueDate: z.string().optional(),
    validUntil: z.string().optional(),
    subtotal: z.number().min(0).optional(),
    vatAmount: z.number().min(0).optional(),
    total: z.number().min(0).optional(),
    notes: z.string().optional(),
    terms: z.string().optional(),
    clientId: z.string().min(1).optional(),
    templateId: z.string().optional(),
    items: z.array(quoteItemSchema).optional(),
});

// Schéma pour supprimer un devis
export const deleteQuoteSchema = z.object({
    id: z.string().min(1, "ID du devis requis"),
});

// Schéma pour mettre à jour le statut d'un devis
export const updateQuoteStatusSchema = z.object({
    id: z.string().min(1, "ID du devis requis"),
    status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired'], {
        required_error: "Statut requis",
    }),
});

// Schéma pour envoyer un devis
export const sendQuoteSchema = z.object({
    quoteId: z.string().min(1, "ID du devis requis"),
    subject: z.string().min(1, "Objet requis"),
    message: z.string().min(1, "Message requis"),
});

// Schéma pour envoyer un rappel de devis
export const remindQuoteSchema = z.object({
    quoteId: z.string().min(1, "ID du devis requis"),
    subject: z.string().min(1, "Objet requis"),
    message: z.string().min(1, "Message requis"),
});

// Types TypeScript
export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export type UpdateQuoteInput = z.infer<typeof updateQuoteSchema>;
export type DeleteQuoteInput = z.infer<typeof deleteQuoteSchema>;
export type UpdateQuoteStatusInput = z.infer<typeof updateQuoteStatusSchema>;
export type SendQuoteInput = z.infer<typeof sendQuoteSchema>;
export type QuoteItem = z.infer<typeof quoteItemSchema>;

// Interface pour un devis avec détails
export interface QuoteWithDetails {
    id: string;
    quoteNumber: string;
    issueDate: Date;
    validUntil: Date;
    status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
    subtotal: number;
    vatAmount: number;
    total: number;
    notes: string | null;
    terms: string | null;
    companyId: string;
    clientId: string;
    templateId: string | null;
    createdAt: Date;
    updatedAt: Date;
    client: {
        id: string;
        name: string;
        email: string;
        address: string | null;
        city: string | null;
        postalCode: string | null;
        country: string | null;
        siret: string | null;
        vatNumber: string | null;
    };
    template: {
        id: string;
        name: string;
        type: 'quote';
    };
    items: QuoteItem[];
}

// Interface pour les statistiques des devis
export interface QuoteStats {
    totalQuotes: number;
    totalAccepted: number;
    totalRejected: number;
    totalPending: number;
    totalRevenue: number;
    averageQuoteValue: number;
} 
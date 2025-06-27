import { z } from "zod";

// Schéma pour créer une nouvelle facture
export const createInvoiceSchema = z.object({
    clientId: z.string().min(1, "Client requis"),
    templateId: z.string().min(1, "Template requis"),
    invoiceNumber: z.string().min(1, "Numéro de facture requis"),
    issueDate: z.string().min(1, "Date d'émission requise"),
    dueDate: z.string().min(1, "Date d'échéance requise"),
    status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).default('draft'),
    items: z.array(z.object({
        description: z.string().min(1, "Description requise"),
        quantity: z.number().min(0.01, "Quantité doit être supérieure à 0"),
        unitPrice: z.number().min(0, "Prix unitaire doit être positif"),
        unit: z.string().min(1, "Unité requise"),
        vatRate: z.number().min(0, "Taux de TVA doit être positif"),
    })).min(1, "Au moins un article requis"),
    notes: z.string().optional(),
    terms: z.string().optional(),
    subtotal: z.number().min(0, "Sous-total doit être positif"),
    vatAmount: z.number().min(0, "Montant TVA doit être positif"),
    total: z.number().min(0, "Total doit être positif"),
});

// Schéma pour modifier une facture existante
export const updateInvoiceSchema = z.object({
    id: z.string().min(1, "ID de la facture requis"),
    clientId: z.string().min(1, "Client requis"),
    templateId: z.string().min(1, "Template requis"),
    invoiceNumber: z.string().min(1, "Numéro de facture requis"),
    issueDate: z.string().min(1, "Date d'émission requise"),
    dueDate: z.string().min(1, "Date d'échéance requise"),
    status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']),
    items: z.array(z.object({
        description: z.string().min(1, "Description requise"),
        quantity: z.number().min(0.01, "Quantité doit être supérieure à 0"),
        unitPrice: z.number().min(0, "Prix unitaire doit être positif"),
        unit: z.string().min(1, "Unité requise"),
        vatRate: z.number().min(0, "Taux de TVA doit être positif"),
    })).min(1, "Au moins un article requis"),
    notes: z.string().optional(),
    terms: z.string().optional(),
    subtotal: z.number().min(0, "Sous-total doit être positif"),
    vatAmount: z.number().min(0, "Montant TVA doit être positif"),
    total: z.number().min(0, "Total doit être positif"),
});

// Schéma pour supprimer une facture
export const deleteInvoiceSchema = z.object({
    invoiceId: z.string().min(1, "ID de la facture requis"),
});

// Schéma pour changer le statut d'une facture
export const updateInvoiceStatusSchema = z.object({
    invoiceId: z.string().min(1, "ID de la facture requis"),
    status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']),
});

// Type pour les factures avec informations complètes
export type InvoiceWithDetails = {
    id: string;
    invoiceNumber: string;
    issueDate: Date;
    dueDate: Date;
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
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
    // Relations
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
        type: 'invoice' | 'quote';
    } | null;
    items: Array<{
        id: string;
        description: string;
        quantity: number;
        unitPrice: number;
        unit: string;
        vatRate: number;
        total: number;
    }>;
};

// Type pour les statistiques des factures
export type InvoiceStats = {
    totalInvoices: number;
    totalPaid: number;
    totalOverdue: number;
    totalDraft: number;
    totalRevenue: number;
    averageInvoiceValue: number;
}; 
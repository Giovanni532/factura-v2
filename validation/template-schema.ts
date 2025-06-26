import { z } from "zod";

// Schéma pour ajouter/retirer un favori
export const toggleFavoriteSchema = z.object({
    templateId: z.string().min(1, "ID du template requis"),
});

// Schéma pour sélectionner un template par défaut
export const setDefaultTemplateSchema = z.object({
    templateId: z.string().min(1, "ID du template requis"),
});

// Schéma pour créer un nouveau template
export const createTemplateSchema = z.object({
    name: z.string().min(1, "Le nom du template est requis").max(100, "Le nom est trop long"),
    description: z.string().optional(),
    html: z.string().min(1, "Le contenu HTML est requis"),
    css: z.string().optional(),
    preview: z.string().optional(),
    type: z.enum(['invoice', 'quote']),
});

// Schéma pour modifier un template existant
export const updateTemplateSchema = z.object({
    id: z.string().min(1, "ID du template requis"),
    name: z.string().min(1, "Le nom du template est requis").max(100, "Le nom est trop long"),
    description: z.string().optional(),
    html: z.string().min(1, "Le contenu HTML est requis"),
    css: z.string().optional(),
    preview: z.string().optional(),
    type: z.enum(['invoice', 'quote']),
});

// Schéma pour supprimer un template
export const deleteTemplateSchema = z.object({
    templateId: z.string().min(1, "ID du template requis"),
});

// Type pour les templates avec informations de favoris
export type TemplateWithFavorite = {
    id: string;
    name: string;
    description: string | null;
    html: string;
    css: string | null;
    preview: string | null;
    type: 'invoice' | 'quote';
    isDefault: boolean;
    isPredefined: boolean;
    companyId: string | null;
    createdAt: Date;
    updatedAt: Date;
    isFavorite: string | null; // ID du favori ou null
    isCompanyDefault: string | null; // ID de la relation company_default_template ou null
};
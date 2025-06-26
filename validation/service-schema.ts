import { z } from "zod";

// Schéma pour créer une catégorie de service
export const createServiceCategorySchema = z.object({
    name: z.string().min(1, "Le nom de la catégorie est requis").max(100, "Le nom est trop long"),
    description: z.string().optional(),
    color: z.string().optional(),
});

// Schéma pour modifier une catégorie de service
export const updateServiceCategorySchema = z.object({
    id: z.string().min(1, "ID de la catégorie requis"),
    name: z.string().min(1, "Le nom de la catégorie est requis").max(100, "Le nom est trop long"),
    description: z.string().optional(),
    color: z.string().optional(),
});

// Schéma pour supprimer une catégorie de service
export const deleteServiceCategorySchema = z.object({
    categoryId: z.string().min(1, "ID de la catégorie requis"),
});

// Schéma pour créer un service
export const createServiceSchema = z.object({
    name: z.string().min(1, "Le nom du service est requis").max(100, "Le nom est trop long"),
    description: z.string().optional(),
    unitPrice: z.number().min(0, "Le prix doit être positif"),
    currency: z.enum(['EUR', 'CHF']),
    unit: z.enum(['hour', 'day', 'piece', 'service', 'other']),
    taxRate: z.number().min(0).max(100, "Le taux de TVA doit être entre 0 et 100"),
    category: z.string().optional(),
});

// Schéma pour modifier un service
export const updateServiceSchema = z.object({
    id: z.string().min(1, "ID du service requis"),
    name: z.string().min(1, "Le nom du service est requis").max(100, "Le nom est trop long"),
    description: z.string().optional(),
    unitPrice: z.number().min(0, "Le prix doit être positif"),
    currency: z.enum(['EUR', 'CHF']),
    unit: z.enum(['hour', 'day', 'piece', 'service', 'other']),
    taxRate: z.number().min(0).max(100, "Le taux de TVA doit être entre 0 et 100"),
    category: z.string().optional(),
});

// Schéma pour supprimer un service
export const deleteServiceSchema = z.object({
    serviceId: z.string().min(1, "ID du service requis"),
});

// Type pour les services avec statistiques
export type ServiceWithStats = {
    id: string;
    name: string;
    description: string | null;
    unitPrice: number;
    currency: 'EUR' | 'CHF';
    unit: 'hour' | 'day' | 'piece' | 'service' | 'other';
    taxRate: number;
    isActive: boolean;
    category: string | null;
    companyId: string;
    createdAt: Date;
    updatedAt: Date;
    // Statistiques
    totalUsage: number;
    totalRevenue: number;
    lastUsed: Date | null;
};

// Type pour les catégories de services
export type ServiceCategory = {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
    companyId: string;
    createdAt: Date;
    updatedAt: Date;
    // Statistiques
    serviceCount: number;
}; 
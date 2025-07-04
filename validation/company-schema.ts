import { z } from "zod";

export const createCompanySchema = z.object({
    name: z.string().min(2, "Le nom de l'entreprise doit contenir au moins 2 caractères"),
    email: z.string().email("Email invalide"),
    phone: z.string().optional()
        .refine((phone) => {
            if (!phone) return true; // Optionnel, donc valide si vide
            // Validation basique pour numéros français et suisses
            const phoneRegex = /^(\+33|0)[1-9](\d{8})$|^(\+41|0)[1-9](\d{8})$/;
            return phoneRegex.test(phone.replace(/\s/g, ''));
        }, "Format de téléphone invalide"),
    address: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.enum(['France', 'Suisse'], {
        errorMap: () => ({ message: "Le pays doit être 'France' ou 'Suisse'" })
    }).optional(),
    siret: z.string().optional(),
    vatNumber: z.string().optional(),
});

export const updateCompanySchema = z.object({
    name: z.string().min(2, "Le nom de l'entreprise doit contenir au moins 2 caractères"),
    email: z.string().email("Email invalide"),
    phone: z.string().optional()
        .refine((phone) => {
            if (!phone) return true; // Optionnel, donc valide si vide
            // Validation basique pour numéros français et suisses
            const phoneRegex = /^(\+33|0)[1-9](\d{8})$|^(\+41|0)[1-9](\d{8})$/;
            return phoneRegex.test(phone.replace(/\s/g, ''));
        }, "Format de téléphone invalide"),
    address: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.enum(['France', 'Suisse'], {
        errorMap: () => ({ message: "Le pays doit être 'France' ou 'Suisse'" })
    }).optional(),
    siret: z.string().optional(),
    vatNumber: z.string().optional(),
});

export const updateCompanyLogoSchema = z.object({
    logo: z.string().min(1, "Le logo est requis"),
});

export const inviteUserSchema = z.object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Email invalide"),
    role: z.enum(['admin', 'user'], {
        errorMap: () => ({ message: "Le rôle doit être 'admin' ou 'user'" })
    }),
});

// Types pour les données de l'entreprise
export type CompanyWithDetails = {
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
    logo: string | null;
    createdAt: Date;
    updatedAt: Date;
    subscription: {
        plan: string;
        maxUsers: number;
        currentUsers: number;
        status: 'active' | 'cancelled' | 'past_due' | 'unpaid';
        features: string[];
    };
    members: Array<{
        id: string;
        name: string;
        email: string;
        image: string | null;
        role: 'owner' | 'admin' | 'user';
        createdAt: Date;
    }>;
};

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type UpdateCompanyLogoInput = z.infer<typeof updateCompanyLogoSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>; 
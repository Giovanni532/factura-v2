import { z } from "zod";

export const createCompanySchema = z.object({
    name: z.string().min(2, "Le nom de l'entreprise doit contenir au moins 2 caractères"),
    email: z.string().email("Email invalide"),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
    siret: z.string().optional(),
    vatNumber: z.string().optional(),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>; 
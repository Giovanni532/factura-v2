import { z } from "zod";

// Schéma pour mettre à jour le profil utilisateur
export const updateProfileSchema = z.object({
    name: z.string().min(2, "Le prénom et nom doivent contenir au moins 2 caractères").max(100, "Le prénom et nom sont trop longs"),
});

// Schéma pour changer le mot de passe
export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
    newPassword: z.string().min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères").max(128, "Le mot de passe est trop long"),
    confirmPassword: z.string().min(1, "Confirmez le nouveau mot de passe"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});

// Type pour les données du profil utilisateur
export type UserProfile = {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    role: 'owner' | 'admin' | 'user';
    createdAt: Date;
    updatedAt: Date;
    companyId: string | null;
}; 
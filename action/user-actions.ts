"use server"

import { useMutation } from "@/lib/safe-action";
import { updateProfileSchema, changePasswordSchema } from "@/validation/user-schema";
import { ActionError } from "@/lib/safe-action";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Action pour mettre à jour le profil utilisateur
export const updateProfileAction = useMutation(
    updateProfileSchema,
    async (input, { userId }) => {
        try {
            // Utiliser l'API Better Auth pour mettre à jour l'utilisateur
            const result = await auth.api.updateUser({
                body: {
                    name: input.name,
                },
                headers: await headers()
            });

            return {
                success: true,
                user: result,
                message: "Profil mis à jour avec succès"
            };
        } catch (error: any) {
            console.error("Erreur lors de la mise à jour du profil:", error);
            throw new ActionError("Erreur lors de la mise à jour du profil");
        }
    }
);

// Action pour changer le mot de passe  
export const changePasswordAction = useMutation(
    changePasswordSchema,
    async (input, { userId }) => {
        try {
            // Utiliser l'API Better Auth pour changer le mot de passe
            await auth.api.changePassword({
                body: {
                    newPassword: input.newPassword,
                    currentPassword: input.currentPassword,
                    revokeOtherSessions: false, // Optionnel: révoquer les autres sessions
                },
                headers: await headers()
            });

            return {
                success: true,
                message: "Mot de passe changé avec succès"
            };
        } catch (error: any) {
            console.error("Erreur lors du changement de mot de passe:", error);
            // Gérer les erreurs spécifiques de Better Auth
            if (error.message?.includes("Current password") || error.message?.includes("Invalid password")) {
                throw new ActionError("Mot de passe actuel incorrect");
            }
            throw new ActionError("Erreur lors du changement de mot de passe");
        }
    }
); 
"use server"

import { useMutation } from "@/lib/safe-action";
import { createCompanySchema } from "@/validation/company-schema";
import { db } from "@/lib/drizzle";
import { company, user } from "@/db/schema";
import { eq } from "drizzle-orm";

export const createCompanyAction = useMutation(
    createCompanySchema,
    async (input, { userId }) => {
        try {
            // Vérifier si l'utilisateur a déjà une compagnie
            const existingUser = await db.select().from(user).where(eq(user.id, userId)).limit(1);

            if (existingUser[0]?.companyId) {
                throw new Error("Vous avez déjà une compagnie associée à votre compte");
            }

            // Créer la nouvelle compagnie
            const newCompany = await db.insert(company).values({
                name: input.name,
                email: input.email,
                phone: input.phone,
                address: input.address,
                city: input.city,
                postalCode: input.postalCode,
                country: input.country,
                siret: input.siret,
                vatNumber: input.vatNumber,
                ownerId: userId,
                createdAt: new Date(),
                updatedAt: new Date(),
            }).returning();

            // Mettre à jour l'utilisateur avec l'ID de la compagnie et le rôle owner
            await db.update(user)
                .set({
                    companyId: newCompany[0].id,
                    role: 'owner',
                    updatedAt: new Date()
                })
                .where(eq(user.id, userId));

            return {
                success: true,
                company: newCompany[0],
                message: "Compagnie créée avec succès"
            };
        } catch (error) {
            console.error("Erreur lors de la création de la compagnie:", error);
            throw new Error(error instanceof Error ? error.message : "Erreur lors de la création de la compagnie");
        }
    }
); 
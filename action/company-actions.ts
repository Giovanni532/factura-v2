"use server"

import { useMutation } from "@/lib/safe-action";
import { createCompanySchema, updateCompanySchema, updateCompanyLogoSchema, inviteUserSchema } from "@/validation/company-schema";
import { db } from "@/lib/drizzle";
import { company, user, subscription, billingPlan } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { paths } from "@/paths";
import { ActionError } from "@/lib/safe-action";
import { sendInvitationEmail } from "@/lib/email";

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

export const updateCompanyLogoAction = useMutation(
    updateCompanyLogoSchema,
    async (input, { userId }) => {
        try {
            // Récupérer l'utilisateur et sa compagnie
            const existingUser = await db.select().from(user).where(eq(user.id, userId)).limit(1);

            if (!existingUser[0]?.companyId) {
                throw new Error("Aucune compagnie associée à votre compte");
            }

            // Mettre à jour le logo de la compagnie
            const updatedCompany = await db.update(company)
                .set({
                    logo: input.logo,
                    updatedAt: new Date()
                })
                .where(eq(company.id, existingUser[0].companyId))
                .returning();

            return {
                success: true,
                company: updatedCompany[0],
                message: "Logo mis à jour avec succès"
            };
        } catch (error) {
            console.error("Erreur lors de la mise à jour du logo:", error);
            throw new Error(error instanceof Error ? error.message : "Erreur lors de la mise à jour du logo");
        }
    }
);

// Action pour mettre à jour les informations de l'entreprise
export const updateCompanyAction = useMutation(
    updateCompanySchema,
    async (input, { userId }) => {
        try {
            // Récupérer l'utilisateur et vérifier qu'il est owner
            const existingUser = await db.select().from(user).where(eq(user.id, userId)).limit(1);

            if (!existingUser[0]?.companyId) {
                throw new ActionError("Aucune entreprise associée à votre compte");
            }

            if (existingUser[0].role !== 'owner') {
                throw new ActionError("Seul le propriétaire peut modifier les informations de l'entreprise");
            }

            // Mettre à jour les informations de l'entreprise
            const updatedCompany = await db.update(company)
                .set({
                    name: input.name,
                    email: input.email,
                    phone: input.phone,
                    address: input.address,
                    city: input.city,
                    postalCode: input.postalCode,
                    country: input.country,
                    siret: input.siret,
                    vatNumber: input.vatNumber,
                    updatedAt: new Date()
                })
                .where(eq(company.id, existingUser[0].companyId))
                .returning();

            // Revalider les pages nécessaires
            revalidatePath(paths.dashboard);

            return {
                success: true,
                company: updatedCompany[0],
                message: "Informations de l'entreprise mises à jour avec succès"
            };
        } catch (error) {
            console.error("Erreur lors de la mise à jour de l'entreprise:", error);
            if (error instanceof ActionError) {
                throw error;
            }
            throw new ActionError("Erreur lors de la mise à jour de l'entreprise");
        }
    }
);

// Action pour inviter un nouvel utilisateur
export const inviteUserAction = useMutation(
    inviteUserSchema,
    async (input, { userId }) => {
        try {
            // Récupérer l'utilisateur et vérifier qu'il est owner
            const existingUser = await db.select().from(user).where(eq(user.id, userId)).limit(1);

            if (!existingUser[0]?.companyId) {
                throw new ActionError("Aucune entreprise associée à votre compte");
            }

            if (existingUser[0].role !== 'owner') {
                throw new ActionError("Seul le propriétaire peut inviter de nouveaux membres");
            }

            // Vérifier si l'email existe déjà
            const existingUserWithEmail = await db.select().from(user).where(eq(user.email, input.email)).limit(1);

            if (existingUserWithEmail.length > 0) {
                throw new ActionError("Un utilisateur avec cet email existe déjà");
            }

            // Vérifier le nombre d'utilisateurs actuels selon l'abonnement
            const currentUsers = await db.select().from(user).where(eq(user.companyId, existingUser[0].companyId));

            // Récupérer les limites d'abonnement
            const subscriptionData = await db
                .select({
                    maxUsers: billingPlan.maxUsers,
                    planName: billingPlan.name,
                })
                .from(subscription)
                .leftJoin(billingPlan, eq(subscription.billingPlanId, billingPlan.id))
                .where(eq(subscription.companyId, existingUser[0].companyId))
                .limit(1);

            // Si pas d'abonnement, utiliser les limites du plan gratuit
            let maxUsers = 1;
            let planName = "Gratuit";

            if (subscriptionData.length === 0) {
                // Récupérer le plan gratuit par défaut
                const freePlan = await db
                    .select({ maxUsers: billingPlan.maxUsers, name: billingPlan.name })
                    .from(billingPlan)
                    .where(eq(billingPlan.id, 'free-plan'))
                    .limit(1);

                maxUsers = freePlan[0]?.maxUsers || 1;
                planName = freePlan[0]?.name || "Gratuit";
            } else {
                maxUsers = subscriptionData[0].maxUsers || 1;
                planName = subscriptionData[0].planName || "Gratuit";
            }

            if (currentUsers.length >= maxUsers) {
                throw new ActionError(`Limite d'utilisateurs atteinte pour le plan ${planName} (${maxUsers} maximum)`);
            }

            // Récupérer les informations de la compagnie
            const companyData = await db.select().from(company).where(eq(company.id, existingUser[0].companyId)).limit(1);

            // Créer le nouvel utilisateur
            const newUser = await db.insert(user).values({
                id: crypto.randomUUID(),
                name: input.name,
                email: input.email,
                role: input.role,
                companyId: existingUser[0].companyId,
                emailVerified: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            }).returning();

            // Générer un lien d'invitation (dans un vrai cas, ce serait un token sécurisé)
            const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL}/invitation?token=${newUser[0].id}&email=${encodeURIComponent(input.email)}`;

            // Envoyer l'email d'invitation
            const emailResult = await sendInvitationEmail({
                to: input.email,
                companyName: companyData[0].name,
                inviterName: existingUser[0].name,
                inviteeName: input.name,
                inviteeEmail: input.email,
                role: input.role,
                invitationLink,
            });

            if (!emailResult.success) {
                console.error('Erreur lors de l\'envoi de l\'email d\'invitation:', emailResult.error);
                // On continue même si l'email échoue, mais on le note
            }

            // Revalider les pages nécessaires
            revalidatePath(paths.dashboard);

            return {
                success: true,
                user: newUser[0],
                message: `Utilisateur ${input.name} invité avec succès${emailResult.success ? '' : ' (email non envoyé)'}`
            };
        } catch (error) {
            console.error("Erreur lors de l'invitation de l'utilisateur:", error);
            if (error instanceof ActionError) {
                throw error;
            }
            throw new ActionError("Erreur lors de l'invitation de l'utilisateur");
        }
    }
); 
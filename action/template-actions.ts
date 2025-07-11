"use server"

import { useMutation } from "@/lib/safe-action";
import { db } from "@/lib/drizzle";
import { template, userFavoriteTemplate, companyDefaultTemplate, user } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import {
    toggleFavoriteSchema,
    setDefaultTemplateSchema,
    createTemplateSchema,
    updateTemplateSchema,
    deleteTemplateSchema
} from "@/validation/template-schema";
import { z } from "zod";
import { ActionError } from "@/lib/safe-action";
import { canUserPerformAction } from "@/db/queries/subscription";

// Action pour ajouter/retirer un template des favoris
export const toggleFavoriteAction = useMutation(
    toggleFavoriteSchema,
    async (input, { userId }) => {
        const { templateId } = input;

        // Vérifier si le template existe
        const templateExists = await db.select()
            .from(template)
            .where(eq(template.id, templateId))
            .limit(1);

        if (templateExists.length === 0) {
            throw new ActionError("Template non trouvé");
        }

        // Vérifier si déjà en favori
        const existingFavorite = await db.select()
            .from(userFavoriteTemplate)
            .where(and(
                eq(userFavoriteTemplate.userId, userId),
                eq(userFavoriteTemplate.templateId, templateId)
            ))
            .limit(1);

        if (existingFavorite.length > 0) {
            // Retirer des favoris
            await db.delete(userFavoriteTemplate)
                .where(and(
                    eq(userFavoriteTemplate.userId, userId),
                    eq(userFavoriteTemplate.templateId, templateId)
                ));

            return {
                success: true,
                action: "removed",
                message: "Template retiré des favoris"
            };
        } else {
            // Ajouter aux favoris
            await db.insert(userFavoriteTemplate).values({
                userId,
                templateId,
            });

            return {
                success: true,
                action: "added",
                message: "Template ajouté aux favoris"
            };
        }
    }
);

// Action pour définir un template par défaut pour l'entreprise
export const setDefaultTemplateAction = useMutation(
    setDefaultTemplateSchema,
    async (input, { userId }) => {
        const { templateId } = input;

        // Récupérer l'utilisateur avec son companyId
        const currentUser = await db.select()
            .from(user)
            .where(eq(user.id, userId))
            .limit(1);

        if (currentUser.length === 0 || !currentUser[0].companyId) {
            throw new ActionError("Utilisateur ou entreprise non trouvé");
        }

        const companyId = currentUser[0].companyId;

        // Vérifier si le template existe et appartient à l'entreprise ou est prédéfini
        const templateExists = await db.select()
            .from(template)
            .where(eq(template.id, templateId))
            .limit(1);

        if (templateExists.length === 0) {
            throw new ActionError("Template non trouvé");
        }

        const templateData = templateExists[0];

        // Vérifier que l'utilisateur a le droit de définir ce template par défaut
        if (!templateData.isPredefined && templateData.companyId !== companyId) {
            throw new ActionError("Vous n'avez pas le droit de définir ce template par défaut");
        }

        // Supprimer l'ancien template par défaut de l'entreprise (s'il existe)
        await db.delete(companyDefaultTemplate)
            .where(eq(companyDefaultTemplate.companyId, companyId));

        // Retirer le statut par défaut de tous les templates de l'entreprise (seulement pour les templates créés)
        await db.update(template)
            .set({ isDefault: false })
            .where(eq(template.companyId, companyId));

        // Ajouter le nouveau template par défaut dans la table de liaison
        await db.insert(companyDefaultTemplate).values({
            companyId: companyId,
            templateId: templateId,
        });

        // Si c'est un template d'entreprise (pas prédéfini), le marquer comme par défaut aussi
        if (!templateData.isPredefined) {
            await db.update(template)
                .set({ isDefault: true })
                .where(eq(template.id, templateId));
        }

        return {
            success: true,
            message: "Template défini par défaut"
        };
    }
);

// Action pour créer un nouveau template
export const createTemplateAction = useMutation(
    createTemplateSchema,
    async (input, { userId }) => {
        // Récupérer l'utilisateur avec son companyId
        const currentUser = await db.select()
            .from(user)
            .where(eq(user.id, userId))
            .limit(1);

        if (currentUser.length === 0 || !currentUser[0].companyId) {
            throw new ActionError("Utilisateur ou entreprise non trouvé");
        }

        const companyId = currentUser[0].companyId;

        // Vérifier si l'utilisateur peut effectuer des actions selon son rôle et l'abonnement
        const { canPerform, reason } = await canUserPerformAction(companyId, currentUser[0].role);
        if (!canPerform) {
            throw new ActionError(reason || "Action non autorisée");
        }

        // Créer le template
        const newTemplate = await db.insert(template).values({
            name: input.name,
            description: input.description || null,
            html: input.html,
            css: input.css || null,
            preview: input.preview || null,
            type: input.type,
            isDefault: false,
            isPredefined: false,
            companyId: companyId,
        }).returning();

        return {
            success: true,
            template: newTemplate[0],
            message: "Template créé avec succès"
        };
    }
);

// Action pour modifier un template existant
export const updateTemplateAction = useMutation(
    updateTemplateSchema,
    async (input, { userId }) => {
        const { id, ...updateData } = input;

        // Récupérer l'utilisateur avec son companyId
        const currentUser = await db.select()
            .from(user)
            .where(eq(user.id, userId))
            .limit(1);

        if (currentUser.length === 0 || !currentUser[0].companyId) {
            throw new ActionError("Utilisateur ou entreprise non trouvé");
        }

        const companyId = currentUser[0].companyId;

        // Vérifier si l'utilisateur peut effectuer des actions selon son rôle et l'abonnement
        const { canPerform, reason } = await canUserPerformAction(companyId, currentUser[0].role);
        if (!canPerform) {
            throw new ActionError(reason || "Action non autorisée");
        }

        // Vérifier que le template existe et appartient à l'entreprise
        const templateExists = await db.select()
            .from(template)
            .where(eq(template.id, id))
            .limit(1);

        if (templateExists.length === 0) {
            throw new ActionError("Template non trouvé");
        }

        const templateData = templateExists[0];

        // Vérifier que l'utilisateur a le droit de modifier ce template
        if (templateData.isPredefined || templateData.companyId !== companyId) {
            throw new ActionError("Vous n'avez pas le droit de modifier ce template");
        }

        // Mettre à jour le template
        const updatedTemplate = await db.update(template)
            .set({
                ...updateData,
                updatedAt: new Date(),
            })
            .where(eq(template.id, id))
            .returning();

        return {
            success: true,
            template: updatedTemplate[0],
            message: "Template modifié avec succès"
        };
    }
);

// Action pour supprimer un template
export const deleteTemplateAction = useMutation(
    deleteTemplateSchema,
    async (input, { userId }) => {
        const { templateId } = input;

        // Récupérer l'utilisateur avec son companyId
        const currentUser = await db.select()
            .from(user)
            .where(eq(user.id, userId))
            .limit(1);

        if (currentUser.length === 0 || !currentUser[0].companyId) {
            throw new ActionError("Utilisateur ou entreprise non trouvé");
        }

        const companyId = currentUser[0].companyId;

        // Vérifier si l'utilisateur peut effectuer des actions selon son rôle et l'abonnement
        const { canPerform, reason } = await canUserPerformAction(companyId, currentUser[0].role);
        if (!canPerform) {
            throw new ActionError(reason || "Action non autorisée");
        }

        // Vérifier que le template existe et appartient à l'entreprise
        const templateExists = await db.select()
            .from(template)
            .where(eq(template.id, templateId))
            .limit(1);

        if (templateExists.length === 0) {
            throw new ActionError("Template non trouvé");
        }

        const templateData = templateExists[0];

        // Vérifier que l'utilisateur a le droit de supprimer ce template
        if (templateData.isPredefined || templateData.companyId !== companyId) {
            throw new ActionError("Vous n'avez pas le droit de supprimer ce template");
        }

        // Supprimer les favoris associés
        await db.delete(userFavoriteTemplate)
            .where(eq(userFavoriteTemplate.templateId, templateId));

        // Supprimer le template
        await db.delete(template)
            .where(eq(template.id, templateId));

        return {
            success: true,
            message: "Template supprimé avec succès"
        };
    }
);

// Action pour récupérer un template par ID
export const getTemplateByIdAction = useMutation(
    z.object({ templateId: z.string().min(1, "ID du template requis") }),
    async (input, { userId }) => {
        const { templateId } = input;

        // Récupérer l'utilisateur avec son companyId
        const currentUser = await db.select()
            .from(user)
            .where(eq(user.id, userId))
            .limit(1);

        if (currentUser.length === 0 || !currentUser[0].companyId) {
            throw new ActionError("Utilisateur ou entreprise non trouvé");
        }

        const companyId = currentUser[0].companyId;

        // Récupérer le template avec vérification des permissions
        const templateData = await db.select()
            .from(template)
            .where(and(
                eq(template.id, templateId),
                // L'utilisateur peut accéder aux templates prédéfinis ou aux templates de son entreprise
                eq(template.isPredefined, true) // TODO: Corriger cette logique
            ))
            .limit(1);

        if (templateData.length === 0) {
            throw new ActionError("Template non trouvé ou accès non autorisé");
        }

        return {
            success: true,
            template: templateData[0]
        };
    }
); 
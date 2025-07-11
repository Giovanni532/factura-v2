"use server"

import { useMutation } from "@/lib/safe-action";
import { db } from "@/lib/drizzle";
import { service, serviceCategory, user } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
    createServiceSchema,
    updateServiceSchema,
    deleteServiceSchema,
    createServiceCategorySchema,
    updateServiceCategorySchema,
    deleteServiceCategorySchema
} from "@/validation/service-schema";
import { ActionError } from "@/lib/safe-action";
import { checkServiceNameExists, checkCategoryNameExists } from "@/db/queries/service";
import { canUserPerformAction } from "@/db/queries/subscription";

// ===== ACTIONS POUR LES SERVICES =====

// Action pour créer un nouveau service
export const createServiceAction = useMutation(
    createServiceSchema,
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

        // Vérifier si le nom existe déjà
        const nameExists = await checkServiceNameExists(input.name, companyId);
        if (nameExists) {
            throw new ActionError("Un service avec ce nom existe déjà");
        }

        // Créer le service
        const newService = await db.insert(service).values({
            name: input.name,
            description: input.description || null,
            unitPrice: input.unitPrice,
            currency: input.currency,
            unit: input.unit,
            taxRate: input.taxRate,
            category: input.category || null,
            companyId: companyId,
        }).returning();

        return {
            success: true,
            service: newService[0],
            message: "Service créé avec succès"
        };
    }
);

// Action pour modifier un service existant
export const updateServiceAction = useMutation(
    updateServiceSchema,
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

        // Vérifier que le service existe et appartient à l'entreprise
        const serviceExists = await db.select()
            .from(service)
            .where(and(
                eq(service.id, id),
                eq(service.companyId, companyId)
            ))
            .limit(1);

        if (serviceExists.length === 0) {
            throw new ActionError("Service non trouvé");
        }

        // Vérifier si le nom existe déjà (en excluant le service actuel)
        const nameExists = await checkServiceNameExists(updateData.name, companyId, id);
        if (nameExists) {
            throw new ActionError("Un autre service avec ce nom existe déjà");
        }

        // Mettre à jour le service
        const updatedService = await db.update(service)
            .set({
                ...updateData,
                updatedAt: new Date(),
            })
            .where(eq(service.id, id))
            .returning();

        return {
            success: true,
            service: updatedService[0],
            message: "Service modifié avec succès"
        };
    }
);

// Action pour supprimer un service
export const deleteServiceAction = useMutation(
    deleteServiceSchema,
    async (input, { userId }) => {
        const { serviceId } = input;

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

        // Vérifier que le service existe et appartient à l'entreprise
        const serviceExists = await db.select()
            .from(service)
            .where(and(
                eq(service.id, serviceId),
                eq(service.companyId, companyId)
            ))
            .limit(1);

        if (serviceExists.length === 0) {
            throw new ActionError("Service non trouvé");
        }

        // Supprimer le service
        await db.delete(service)
            .where(eq(service.id, serviceId));

        return {
            success: true,
            message: "Service supprimé avec succès"
        };
    }
);

// ===== ACTIONS POUR LES CATÉGORIES =====

// Action pour créer une nouvelle catégorie
export const createServiceCategoryAction = useMutation(
    createServiceCategorySchema,
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

        // Vérifier si le nom existe déjà
        const nameExists = await checkCategoryNameExists(input.name, companyId);
        if (nameExists) {
            throw new ActionError("Une catégorie avec ce nom existe déjà");
        }

        // Créer la catégorie
        const newCategory = await db.insert(serviceCategory).values({
            name: input.name,
            description: input.description || null,
            color: input.color || null,
            companyId: companyId,
        }).returning();

        return {
            success: true,
            category: newCategory[0],
            message: "Catégorie créée avec succès"
        };
    }
);

// Action pour modifier une catégorie existante
export const updateServiceCategoryAction = useMutation(
    updateServiceCategorySchema,
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

        // Vérifier que la catégorie existe et appartient à l'entreprise
        const categoryExists = await db.select()
            .from(serviceCategory)
            .where(and(
                eq(serviceCategory.id, id),
                eq(serviceCategory.companyId, companyId)
            ))
            .limit(1);

        if (categoryExists.length === 0) {
            throw new ActionError("Catégorie non trouvée");
        }

        // Vérifier si le nom existe déjà (en excluant la catégorie actuelle)
        const nameExists = await checkCategoryNameExists(updateData.name, companyId, id);
        if (nameExists) {
            throw new ActionError("Une autre catégorie avec ce nom existe déjà");
        }

        // Mettre à jour la catégorie
        const updatedCategory = await db.update(serviceCategory)
            .set({
                ...updateData,
                updatedAt: new Date(),
            })
            .where(eq(serviceCategory.id, id))
            .returning();

        return {
            success: true,
            category: updatedCategory[0],
            message: "Catégorie modifiée avec succès"
        };
    }
);

// Action pour supprimer une catégorie
export const deleteServiceCategoryAction = useMutation(
    deleteServiceCategorySchema,
    async (input, { userId }) => {
        const { categoryId } = input;

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

        // Vérifier que la catégorie existe et appartient à l'entreprise
        const categoryExists = await db.select()
            .from(serviceCategory)
            .where(and(
                eq(serviceCategory.id, categoryId),
                eq(serviceCategory.companyId, companyId)
            ))
            .limit(1);

        if (categoryExists.length === 0) {
            throw new ActionError("Catégorie non trouvée");
        }

        // Vérifier s'il y a des services dans cette catégorie
        const servicesInCategory = await db.select()
            .from(service)
            .where(and(
                eq(service.category, categoryExists[0].name),
                eq(service.companyId, companyId)
            ));

        if (servicesInCategory.length > 0) {
            throw new ActionError("Impossible de supprimer cette catégorie car elle contient des services");
        }

        // Supprimer la catégorie
        await db.delete(serviceCategory)
            .where(eq(serviceCategory.id, categoryId));

        return {
            success: true,
            message: "Catégorie supprimée avec succès"
        };
    }
); 
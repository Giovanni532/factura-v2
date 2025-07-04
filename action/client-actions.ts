"use server"

import { useMutation } from "@/lib/safe-action";
import { db } from "@/lib/drizzle";
import { client, user } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
    createClientSchema,
    updateClientSchema,
    deleteClientSchema
} from "@/validation/client-schema";
import { ActionError } from "@/lib/safe-action";
import { checkClientEmailExists } from "@/db/queries/client";
import { canAddClient } from "@/db/queries/subscription";
import { revalidatePath } from "next/cache";
import { paths } from "@/paths";

// Action pour créer un nouveau client
export const createClientAction = useMutation(
    createClientSchema,
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

        // Vérifier les limites d'abonnement
        const { canAdd, reason } = await canAddClient(companyId);
        if (!canAdd) {
            throw new ActionError(reason || "Limite de clients atteinte");
        }

        // Vérifier si l'email existe déjà
        const emailExists = await checkClientEmailExists(input.email, companyId);
        if (emailExists) {
            throw new ActionError("Un client avec cet email existe déjà");
        }

        // Créer le client
        const newClient = await db.insert(client).values({
            name: input.name,
            email: input.email,
            phone: input.phone || null,
            address: input.address || null,
            city: input.city || null,
            postalCode: input.postalCode || null,
            country: input.country || null,
            siret: input.siret || null,
            vatNumber: input.vatNumber || null,
            companyId: companyId,
        }).returning();

        // Revalider les pages nécessaires
        revalidatePath(paths.clients.list);
        revalidatePath(paths.dashboard);

        return {
            success: true,
            client: newClient[0],
            message: "Client créé avec succès"
        };
    }
);

// Action pour modifier un client existant
export const updateClientAction = useMutation(
    updateClientSchema,
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

        // Vérifier que le client existe et appartient à l'entreprise
        const clientExists = await db.select()
            .from(client)
            .where(and(
                eq(client.id, id),
                eq(client.companyId, companyId)
            ))
            .limit(1);

        if (clientExists.length === 0) {
            throw new ActionError("Client non trouvé");
        }

        // Vérifier si l'email existe déjà (en excluant le client actuel)
        const emailExists = await checkClientEmailExists(updateData.email, companyId, id);
        if (emailExists) {
            throw new ActionError("Un autre client avec cet email existe déjà");
        }

        // Mettre à jour le client
        const updatedClient = await db.update(client)
            .set({
                ...updateData,
                updatedAt: new Date(),
            })
            .where(eq(client.id, id))
            .returning();

        return {
            success: true,
            client: updatedClient[0],
            message: "Client modifié avec succès"
        };
    }
);

// Action pour supprimer un client
export const deleteClientAction = useMutation(
    deleteClientSchema,
    async (input, { userId }) => {
        const { clientId } = input;

        // Récupérer l'utilisateur avec son companyId
        const currentUser = await db.select()
            .from(user)
            .where(eq(user.id, userId))
            .limit(1);

        if (currentUser.length === 0 || !currentUser[0].companyId) {
            throw new ActionError("Utilisateur ou entreprise non trouvé");
        }

        const companyId = currentUser[0].companyId;

        // Vérifier que le client existe et appartient à l'entreprise
        const clientExists = await db.select()
            .from(client)
            .where(and(
                eq(client.id, clientId),
                eq(client.companyId, companyId)
            ))
            .limit(1);

        if (clientExists.length === 0) {
            throw new ActionError("Client non trouvé");
        }

        // Supprimer le client (les factures et devis associés seront supprimés en cascade)
        await db.delete(client)
            .where(eq(client.id, clientId));

        return {
            success: true,
            message: "Client supprimé avec succès"
        };
    }
); 
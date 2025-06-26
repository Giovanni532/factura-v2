"use server"

import { useMutation } from "@/lib/safe-action";
import { createInvoiceSchema, updateInvoiceSchema, deleteInvoiceSchema, updateInvoiceStatusSchema } from "@/validation/invoice-schema";
import { db } from "@/lib/drizzle";
import { invoice, invoiceItem, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getNextInvoiceNumber } from "@/db/queries/invoice";

// Action pour créer une nouvelle facture
export const createInvoiceAction = useMutation(
    createInvoiceSchema,
    async (input, { userId }) => {
        // Vérifier que l'utilisateur appartient à une entreprise
        const userData = await db.select().from(user).where(eq(user.id, userId)).limit(1);

        if (!userData.length || !userData[0].companyId) {
            throw new Error("Utilisateur non associé à une entreprise");
        }

        // Générer le numéro de facture si non fourni
        const invoiceNumber = input.invoiceNumber || await getNextInvoiceNumber(userData[0].companyId);

        // Créer la facture
        const [newInvoice] = await db.insert(invoice).values({
            number: invoiceNumber,
            status: input.status,
            issueDate: new Date(input.issueDate),
            dueDate: new Date(input.dueDate),
            subtotal: input.subtotal,
            taxAmount: input.vatAmount,
            total: input.total,
            notes: input.notes,
            clientId: input.clientId,
            companyId: userData[0].companyId,
            templateId: input.templateId,
        }).returning();

        // Créer les articles de la facture
        const invoiceItems = input.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
            invoiceId: newInvoice.id,
        }));

        await db.insert(invoiceItem).values(invoiceItems);

        return {
            success: true,
            message: "Facture créée avec succès",
            invoice: newInvoice
        };
    }
);

// Action pour modifier une facture existante
export const updateInvoiceAction = useMutation(
    updateInvoiceSchema,
    async (input, { userId }) => {
        // Vérifier que l'utilisateur appartient à une entreprise
        const userData = await db.select().from(user).where(eq(user.id, userId)).limit(1);

        if (!userData.length || !userData[0].companyId) {
            throw new Error("Utilisateur non associé à une entreprise");
        }

        // Vérifier que la facture appartient à l'entreprise
        const existingInvoice = await db.select().from(invoice).where(eq(invoice.id, input.id)).limit(1);

        if (!existingInvoice.length || existingInvoice[0].companyId !== userData[0].companyId) {
            throw new Error("Facture non trouvée ou accès non autorisé");
        }

        // Mettre à jour la facture
        const [updatedInvoice] = await db.update(invoice)
            .set({
                number: input.invoiceNumber,
                status: input.status,
                issueDate: new Date(input.issueDate),
                dueDate: new Date(input.dueDate),
                subtotal: input.subtotal,
                taxAmount: input.vatAmount,
                total: input.total,
                notes: input.notes,
                clientId: input.clientId,
                templateId: input.templateId,
                updatedAt: new Date(),
            })
            .where(eq(invoice.id, input.id))
            .returning();

        // Supprimer les anciens articles
        await db.delete(invoiceItem).where(eq(invoiceItem.invoiceId, input.id));

        // Créer les nouveaux articles
        const invoiceItems = input.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
            invoiceId: input.id,
        }));

        await db.insert(invoiceItem).values(invoiceItems);

        return {
            success: true,
            message: "Facture mise à jour avec succès",
            invoice: updatedInvoice
        };
    }
);

// Action pour supprimer une facture
export const deleteInvoiceAction = useMutation(
    deleteInvoiceSchema,
    async (input, { userId }) => {
        // Vérifier que l'utilisateur appartient à une entreprise
        const userData = await db.select().from(user).where(eq(user.id, userId)).limit(1);

        if (!userData.length || !userData[0].companyId) {
            throw new Error("Utilisateur non associé à une entreprise");
        }

        // Vérifier que la facture appartient à l'entreprise
        const existingInvoice = await db.select().from(invoice).where(eq(invoice.id, input.invoiceId)).limit(1);

        if (!existingInvoice.length || existingInvoice[0].companyId !== userData[0].companyId) {
            throw new Error("Facture non trouvée ou accès non autorisé");
        }

        // Supprimer la facture (les articles seront supprimés automatiquement par CASCADE)
        await db.delete(invoice).where(eq(invoice.id, input.invoiceId));

        return {
            success: true,
            message: "Facture supprimée avec succès"
        };
    }
);

// Action pour changer le statut d'une facture
export const updateInvoiceStatusAction = useMutation(
    updateInvoiceStatusSchema,
    async (input, { userId }) => {
        // Vérifier que l'utilisateur appartient à une entreprise
        const userData = await db.select().from(user).where(eq(user.id, userId)).limit(1);

        if (!userData.length || !userData[0].companyId) {
            throw new Error("Utilisateur non associé à une entreprise");
        }

        // Vérifier que la facture appartient à l'entreprise
        const existingInvoice = await db.select().from(invoice).where(eq(invoice.id, input.invoiceId)).limit(1);

        if (!existingInvoice.length || existingInvoice[0].companyId !== userData[0].companyId) {
            throw new Error("Facture non trouvée ou accès non autorisé");
        }

        // Mettre à jour le statut
        const [updatedInvoice] = await db.update(invoice)
            .set({
                status: input.status,
                updatedAt: new Date(),
            })
            .where(eq(invoice.id, input.invoiceId))
            .returning();

        return {
            success: true,
            message: "Statut de la facture mis à jour avec succès",
            invoice: updatedInvoice
        };
    }
); 
"use server"

import { useMutation } from "@/lib/safe-action";
import { createInvoiceSchema, updateInvoiceSchema, deleteInvoiceSchema, updateInvoiceStatusSchema, remindInvoiceSchema } from "@/validation/invoice-schema";
import { db } from "@/lib/drizzle";
import { invoice, invoiceItem, user, company, client, template } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getNextInvoiceNumber, getInvoiceById } from "@/db/queries/invoice";
import { predefinedTemplates } from "@/lib/templates";
import { z } from "zod";
import puppeteer from "puppeteer";
import { revalidatePath } from "next/cache";
import { paths } from "@/paths";
import { canAddInvoice, canUserPerformAction } from "@/db/queries/subscription";
import { ActionError } from "@/lib/safe-action";
import { sendInvoiceEmail } from "@/lib/email";

// Action pour créer une nouvelle facture
export const createInvoiceAction = useMutation(
    createInvoiceSchema,
    async (input, { userId }) => {
        // Vérifier que l'utilisateur appartient à une entreprise
        const userData = await db.select().from(user).where(eq(user.id, userId)).limit(1);

        if (!userData.length || !userData[0].companyId) {
            throw new ActionError("Utilisateur non associé à une entreprise");
        }

        // Vérifier les limites d'abonnement
        const { canAdd, reason } = await canAddInvoice(userData[0].companyId);
        if (!canAdd) {
            throw new ActionError(reason || "Limite de factures atteinte");
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

        // Récupérer la facture complète avec les détails du client
        const completeInvoice = await getInvoiceById(newInvoice.id, userData[0].companyId);

        // Revalider les pages nécessaires pour mettre à jour l'interface
        revalidatePath(paths.invoices.list);
        revalidatePath(paths.dashboard);

        return {
            success: true,
            message: "Facture créée avec succès",
            invoice: completeInvoice
        };
    }
);

// Action pour générer et télécharger une facture en PDF
export const downloadInvoiceAction = useMutation(
    z.object({ invoiceId: z.string() }),
    async (input, { userId }) => {
        // Vérifier que l'utilisateur appartient à une entreprise
        const userData = await db.select().from(user).where(eq(user.id, userId)).limit(1);

        if (!userData.length || !userData[0].companyId) {
            throw new Error("Utilisateur non associé à une entreprise");
        }

        // Récupérer la facture avec tous les détails
        const invoiceData = await getInvoiceById(input.invoiceId, userData[0].companyId);

        if (!invoiceData) {
            throw new Error("Facture non trouvée");
        }

        // Récupérer les données de l'entreprise
        const companyData = await db.select().from(company).where(eq(company.id, userData[0].companyId)).limit(1);

        if (!companyData.length) {
            throw new Error("Entreprise non trouvée");
        }

        // Récupérer le template
        let selectedTemplate;
        if (invoiceData.templateId) {
            // Template personnalisé
            const customTemplate = await db.select().from(template).where(eq(template.id, invoiceData.templateId)).limit(1);
            if (customTemplate.length) {
                selectedTemplate = customTemplate[0];
            }
        }

        // Si pas de template personnalisé, utiliser un template prédéfini
        if (!selectedTemplate) {
            selectedTemplate = predefinedTemplates.find(t => t.type === 'invoice');
        }

        if (!selectedTemplate) {
            throw new Error("Template non trouvé");
        }

        // Préparer les données pour le template
        const templateData = {
            company: {
                name: companyData[0].name,
                address: companyData[0].address,
                city: companyData[0].city,
                postalCode: companyData[0].postalCode,
                country: companyData[0].country,
                email: companyData[0].email,
                phone: companyData[0].phone,
                siret: companyData[0].siret,
                vatNumber: companyData[0].vatNumber,
                logo: companyData[0].logo,
            },
            client: {
                name: invoiceData.client.name,
                email: invoiceData.client.email,
                address: invoiceData.client.address,
                city: invoiceData.client.city,
                postalCode: invoiceData.client.postalCode,
                country: invoiceData.client.country,
                siret: invoiceData.client.siret,
                vatNumber: invoiceData.client.vatNumber,
            },
            invoice: {
                number: invoiceData.invoiceNumber,
                issueDate: invoiceData.issueDate.toLocaleDateString('fr-FR'),
                dueDate: invoiceData.dueDate.toLocaleDateString('fr-FR'),
                subtotal: invoiceData.subtotal.toFixed(2),
                taxRate: "20",
                taxAmount: invoiceData.vatAmount.toFixed(2),
                total: invoiceData.total.toFixed(2),
                notes: invoiceData.notes || "",
            },
            items: invoiceData.items.map(item => ({
                description: item.description,
                quantity: item.quantity.toString(),
                unitPrice: item.unitPrice.toFixed(2),
                total: item.total.toFixed(2),
            })),
        };

        // Récupérer les données complètes du client
        const clientData = await db.select().from(client).where(eq(client.id, invoiceData.clientId)).limit(1);
        if (clientData.length) {
            templateData.client = {
                ...templateData.client,
                address: clientData[0].address || "",
                city: clientData[0].city || "",
                postalCode: clientData[0].postalCode || "",
                country: clientData[0].country || "",
                siret: clientData[0].siret || "",
                vatNumber: clientData[0].vatNumber || "",
            };
        }

        // Générer le HTML avec les données
        let html = selectedTemplate.html;

        // Remplacer les variables du template
        html = html.replace(/\{\{company\.name\}\}/g, templateData.company.name || '');

        // Gérer les lignes d'adresse de l'entreprise
        if (templateData.company.address) {
            html = html.replace(/\{\{company\.address\}\}/g, templateData.company.address);
        } else {
            html = html.replace(/<p>\{\{company\.address\}\}<\/p>/g, '');
        }

        if (templateData.company.city && templateData.company.postalCode) {
            html = html.replace(/\{\{company\.city\}\}, \{\{company\.postalCode\}\}/g, `${templateData.company.city}, ${templateData.company.postalCode}`);
        } else if (templateData.company.city) {
            html = html.replace(/\{\{company\.city\}\}, \{\{company\.postalCode\}\}/g, templateData.company.city);
        } else if (templateData.company.postalCode) {
            html = html.replace(/\{\{company\.city\}\}, \{\{company\.postalCode\}\}/g, templateData.company.postalCode);
        } else {
            html = html.replace(/<p>\{\{company\.city\}\}, \{\{company\.postalCode\}\}<\/p>/g, '');
        }

        if (templateData.company.country) {
            html = html.replace(/\{\{company\.country\}\}/g, templateData.company.country);
        } else {
            html = html.replace(/<p>\{\{company\.country\}\}<\/p>/g, '');
        }

        if (templateData.company.email) {
            html = html.replace(/\{\{company\.email\}\}/g, templateData.company.email);
        } else {
            html = html.replace(/<p>Email: \{\{company\.email\}\}<\/p>/g, '');
        }

        if (templateData.company.phone) {
            html = html.replace(/\{\{company\.phone\}\}/g, templateData.company.phone);
        } else {
            html = html.replace(/<p>Tél: \{\{company\.phone\}\}<\/p>/g, '');
        }

        html = html.replace(/\{\{company\.siret\}\}/g, templateData.company.siret || '');
        html = html.replace(/\{\{company\.vatNumber\}\}/g, templateData.company.vatNumber || '');
        html = html.replace(/\{\{company\.logo\}\}/g, templateData.company.logo || '');

        // Gérer les lignes d'adresse du client
        html = html.replace(/\{\{client\.name\}\}/g, templateData.client.name || '');

        if (templateData.client.address) {
            html = html.replace(/\{\{client\.address\}\}/g, templateData.client.address);
        } else {
            html = html.replace(/<p>\{\{client\.address\}\}<\/p>/g, '');
        }

        if (templateData.client.city && templateData.client.postalCode) {
            html = html.replace(/\{\{client\.city\}\}, \{\{client\.postalCode\}\}/g, `${templateData.client.city}, ${templateData.client.postalCode}`);
        } else if (templateData.client.city) {
            html = html.replace(/\{\{client\.city\}\}, \{\{client\.postalCode\}\}/g, templateData.client.city);
        } else if (templateData.client.postalCode) {
            html = html.replace(/\{\{client\.city\}\}, \{\{client\.postalCode\}\}/g, templateData.client.postalCode);
        } else {
            html = html.replace(/<p>\{\{client\.city\}\}, \{\{client\.postalCode\}\}<\/p>/g, '');
        }

        if (templateData.client.country) {
            html = html.replace(/\{\{client\.country\}\}/g, templateData.client.country);
        } else {
            html = html.replace(/<p>\{\{client\.country\}\}<\/p>/g, '');
        }

        if (templateData.client.email) {
            html = html.replace(/\{\{client\.email\}\}/g, templateData.client.email);
        } else {
            html = html.replace(/<p>\{\{client\.email\}\}<\/p>/g, '');
        }

        html = html.replace(/\{\{client\.siret\}\}/g, templateData.client.siret || '');
        html = html.replace(/\{\{client\.vatNumber\}\}/g, templateData.client.vatNumber || '');

        html = html.replace(/\{\{invoice\.number\}\}/g, templateData.invoice.number || '');
        html = html.replace(/\{\{invoice\.issueDate\}\}/g, templateData.invoice.issueDate || '');
        html = html.replace(/\{\{invoice\.dueDate\}\}/g, templateData.invoice.dueDate || '');
        html = html.replace(/\{\{invoice\.subtotal\}\}/g, templateData.invoice.subtotal || '0.00');
        html = html.replace(/\{\{invoice\.taxRate\}\}/g, templateData.invoice.taxRate || '20');
        html = html.replace(/\{\{invoice\.taxAmount\}\}/g, templateData.invoice.taxAmount || '0.00');
        html = html.replace(/\{\{invoice\.total\}\}/g, templateData.invoice.total || '0.00');
        html = html.replace(/\{\{invoice\.notes\}\}/g, templateData.invoice.notes || '');

        // Gérer les boucles d'items
        const itemsHtml = templateData.items.map(item => `
            <tr>
                <td>${item.description || ''}</td>
                <td>${item.quantity || '0'}</td>
                <td>${item.unitPrice || '0.00'} €</td>
                <td>${item.total || '0.00'} €</td>
            </tr>
        `).join('');

        html = html.replace(/\{\{#each items\}\}[\s\S]*?\{\{\/each\}\}/g, itemsHtml);

        // Gérer les conditions
        if (templateData.company.logo) {
            html = html.replace(/\{\{#if company\.logo\}\}([\s\S]*?)\{\{\/if\}\}/g, '$1');
        } else {
            html = html.replace(/\{\{#if company\.logo\}\}[\s\S]*?\{\{\/if\}\}/g, '');
        }

        if (templateData.company.siret) {
            html = html.replace(/\{\{#if company\.siret\}\}([\s\S]*?)\{\{\/if\}\}/g, '$1');
        } else {
            html = html.replace(/\{\{#if company\.siret\}\}[\s\S]*?\{\{\/if\}\}/g, '');
        }

        if (templateData.company.vatNumber) {
            html = html.replace(/\{\{#if company\.vatNumber\}\}([\s\S]*?)\{\{\/if\}\}/g, '$1');
        } else {
            html = html.replace(/\{\{#if company\.vatNumber\}\}[\s\S]*?\{\{\/if\}\}/g, '');
        }

        if (templateData.client.siret) {
            html = html.replace(/\{\{#if client\.siret\}\}([\s\S]*?)\{\{\/if\}\}/g, '$1');
        } else {
            html = html.replace(/\{\{#if client\.siret\}\}[\s\S]*?\{\{\/if\}\}/g, '');
        }

        if (templateData.invoice.notes) {
            html = html.replace(/\{\{#if invoice\.notes\}\}([\s\S]*?)\{\{\/if\}\}/g, '$1');
        } else {
            html = html.replace(/\{\{#if invoice\.notes\}\}[\s\S]*?\{\{\/if\}\}/g, '');
        }

        // Remplacer le CSS
        html = html.replace(/\{\{CSS\}\}/g, selectedTemplate.css || '');

        // Générer le PDF avec Puppeteer
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        try {
            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'networkidle0' });

            const pdf = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '20mm',
                    right: '20mm',
                    bottom: '20mm',
                    left: '20mm'
                }
            });

            await browser.close();

            return {
                success: true,
                pdf: Buffer.from(pdf).toString('base64'),
                filename: `facture-${invoiceData.invoiceNumber}.pdf`
            };
        } catch (error) {
            await browser.close();
            throw new Error("Erreur lors de la génération du PDF");
        }
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

        // Vérifier si l'utilisateur peut effectuer des actions selon son rôle et l'abonnement
        const { canPerform, reason } = await canUserPerformAction(userData[0].companyId, userData[0].role);
        if (!canPerform) {
            throw new ActionError(reason || "Action non autorisée");
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

        // Revalider les pages nécessaires pour mettre à jour l'interface
        revalidatePath(paths.invoices.list);
        revalidatePath(paths.dashboard);

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

        // Vérifier si l'utilisateur peut effectuer des actions selon son rôle et l'abonnement
        const { canPerform, reason } = await canUserPerformAction(userData[0].companyId, userData[0].role);
        if (!canPerform) {
            throw new ActionError(reason || "Action non autorisée");
        }

        // Vérifier que la facture appartient à l'entreprise
        const existingInvoice = await db.select().from(invoice).where(eq(invoice.id, input.invoiceId)).limit(1);

        if (!existingInvoice.length || existingInvoice[0].companyId !== userData[0].companyId) {
            throw new Error("Facture non trouvée ou accès non autorisé");
        }

        // Supprimer la facture (les articles seront supprimés automatiquement par CASCADE)
        await db.delete(invoice).where(eq(invoice.id, input.invoiceId));

        // Revalider les pages nécessaires pour mettre à jour l'interface
        revalidatePath(paths.invoices.list);
        revalidatePath(paths.dashboard);

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

        // Vérifier si l'utilisateur peut effectuer des actions selon son rôle et l'abonnement
        const { canPerform, reason } = await canUserPerformAction(userData[0].companyId, userData[0].role);
        if (!canPerform) {
            throw new ActionError(reason || "Action non autorisée");
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

        // Revalider les pages nécessaires pour mettre à jour l'interface
        revalidatePath(paths.invoices.list);
        revalidatePath(paths.dashboard);

        return {
            success: true,
            message: "Statut de la facture mis à jour avec succès",
            invoice: updatedInvoice
        };
    }
);

// Action pour envoyer une facture par email
export const sendInvoiceAction = useMutation(
    z.object({
        invoiceId: z.string(),
        subject: z.string().min(1, "Objet requis"),
        message: z.string().min(1, "Message requis")
    }),
    async (input, { userId }) => {
        // Vérifier que l'utilisateur appartient à une entreprise
        const userData = await db.select().from(user).where(eq(user.id, userId)).limit(1);

        if (!userData.length || !userData[0].companyId) {
            throw new Error("Utilisateur non associé à une entreprise");
        }

        // Récupérer la facture avec tous les détails
        const invoiceData = await getInvoiceById(input.invoiceId, userData[0].companyId);

        if (!invoiceData) {
            throw new Error("Facture non trouvée");
        }

        // Récupérer les données de l'entreprise
        const companyData = await db.select().from(company).where(eq(company.id, userData[0].companyId)).limit(1);

        if (!companyData.length) {
            throw new Error("Entreprise non trouvée");
        }

        // Récupérer le template
        let selectedTemplate;
        if (invoiceData.templateId) {
            const customTemplate = await db.select().from(template).where(eq(template.id, invoiceData.templateId)).limit(1);
            if (customTemplate.length) {
                selectedTemplate = customTemplate[0];
            }
        }

        if (!selectedTemplate) {
            selectedTemplate = predefinedTemplates.find(t => t.type === 'invoice');
        }

        if (!selectedTemplate) {
            throw new Error("Template non trouvé");
        }

        // Préparer les données pour le template
        const templateData = {
            company: {
                name: companyData[0].name,
                address: companyData[0].address,
                city: companyData[0].city,
                postalCode: companyData[0].postalCode,
                country: companyData[0].country,
                email: companyData[0].email,
                phone: companyData[0].phone,
                siret: companyData[0].siret,
                vatNumber: companyData[0].vatNumber,
                logo: companyData[0].logo,
            },
            client: {
                name: invoiceData.client.name,
                email: invoiceData.client.email,
                address: invoiceData.client.address,
                city: invoiceData.client.city,
                postalCode: invoiceData.client.postalCode,
                country: invoiceData.client.country,
                siret: invoiceData.client.siret,
                vatNumber: invoiceData.client.vatNumber,
            },
            invoice: {
                number: invoiceData.invoiceNumber,
                issueDate: invoiceData.issueDate.toLocaleDateString('fr-FR'),
                dueDate: invoiceData.dueDate.toLocaleDateString('fr-FR'),
                subtotal: invoiceData.subtotal.toFixed(2),
                taxRate: "20",
                taxAmount: invoiceData.vatAmount.toFixed(2),
                total: invoiceData.total.toFixed(2),
                notes: invoiceData.notes || "",
            },
            items: invoiceData.items.map(item => ({
                description: item.description,
                quantity: item.quantity.toString(),
                unitPrice: item.unitPrice.toFixed(2),
                total: item.total.toFixed(2),
            })),
        };

        // Générer le HTML avec les données
        let html = selectedTemplate.html;

        // Remplacer les variables du template
        html = html.replace(/\{\{company\.name\}\}/g, templateData.company.name || '');

        // Gérer les lignes d'adresse de l'entreprise
        if (templateData.company.address) {
            html = html.replace(/\{\{company\.address\}\}/g, templateData.company.address);
        } else {
            html = html.replace(/<p>\{\{company\.address\}\}<\/p>/g, '');
        }

        if (templateData.company.city && templateData.company.postalCode) {
            html = html.replace(/\{\{company\.city\}\}, \{\{company\.postalCode\}\}/g, `${templateData.company.city}, ${templateData.company.postalCode}`);
        } else if (templateData.company.city) {
            html = html.replace(/\{\{company\.city\}\}, \{\{company\.postalCode\}\}/g, templateData.company.city);
        } else if (templateData.company.postalCode) {
            html = html.replace(/\{\{company\.city\}\}, \{\{company\.postalCode\}\}/g, templateData.company.postalCode);
        } else {
            html = html.replace(/<p>\{\{company\.city\}\}, \{\{company\.postalCode\}\}<\/p>/g, '');
        }

        if (templateData.company.country) {
            html = html.replace(/\{\{company\.country\}\}/g, templateData.company.country);
        } else {
            html = html.replace(/<p>\{\{company\.country\}\}<\/p>/g, '');
        }

        if (templateData.company.email) {
            html = html.replace(/\{\{company\.email\}\}/g, templateData.company.email);
        } else {
            html = html.replace(/<p>Email: \{\{company\.email\}\}<\/p>/g, '');
        }

        if (templateData.company.phone) {
            html = html.replace(/\{\{company\.phone\}\}/g, templateData.company.phone);
        } else {
            html = html.replace(/<p>Tél: \{\{company\.phone\}\}<\/p>/g, '');
        }

        html = html.replace(/\{\{company\.siret\}\}/g, templateData.company.siret || '');
        html = html.replace(/\{\{company\.vatNumber\}\}/g, templateData.company.vatNumber || '');
        html = html.replace(/\{\{company\.logo\}\}/g, templateData.company.logo || '');

        // Gérer les lignes d'adresse du client
        html = html.replace(/\{\{client\.name\}\}/g, templateData.client.name || '');

        if (templateData.client.address) {
            html = html.replace(/\{\{client\.address\}\}/g, templateData.client.address);
        } else {
            html = html.replace(/<p>\{\{client\.address\}\}<\/p>/g, '');
        }

        if (templateData.client.city && templateData.client.postalCode) {
            html = html.replace(/\{\{client\.city\}\}, \{\{client\.postalCode\}\}/g, `${templateData.client.city}, ${templateData.client.postalCode}`);
        } else if (templateData.client.city) {
            html = html.replace(/\{\{client\.city\}\}, \{\{client\.postalCode\}\}/g, templateData.client.city);
        } else if (templateData.client.postalCode) {
            html = html.replace(/\{\{client\.city\}\}, \{\{client\.postalCode\}\}/g, templateData.client.postalCode);
        } else {
            html = html.replace(/<p>\{\{client\.city\}\}, \{\{client\.postalCode\}\}<\/p>/g, '');
        }

        if (templateData.client.country) {
            html = html.replace(/\{\{client\.country\}\}/g, templateData.client.country);
        } else {
            html = html.replace(/<p>\{\{client\.country\}\}<\/p>/g, '');
        }

        if (templateData.client.email) {
            html = html.replace(/\{\{client\.email\}\}/g, templateData.client.email);
        } else {
            html = html.replace(/<p>\{\{client\.email\}\}<\/p>/g, '');
        }

        html = html.replace(/\{\{client\.siret\}\}/g, templateData.client.siret || '');
        html = html.replace(/\{\{client\.vatNumber\}\}/g, templateData.client.vatNumber || '');

        html = html.replace(/\{\{invoice\.number\}\}/g, templateData.invoice.number || '');
        html = html.replace(/\{\{invoice\.issueDate\}\}/g, templateData.invoice.issueDate || '');
        html = html.replace(/\{\{invoice\.dueDate\}\}/g, templateData.invoice.dueDate || '');
        html = html.replace(/\{\{invoice\.subtotal\}\}/g, templateData.invoice.subtotal || '0.00');
        html = html.replace(/\{\{invoice\.taxRate\}\}/g, templateData.invoice.taxRate || '20');
        html = html.replace(/\{\{invoice\.taxAmount\}\}/g, templateData.invoice.taxAmount || '0.00');
        html = html.replace(/\{\{invoice\.total\}\}/g, templateData.invoice.total || '0.00');
        html = html.replace(/\{\{invoice\.notes\}\}/g, templateData.invoice.notes || '');

        // Gérer les boucles d'items
        const itemsHtml = templateData.items.map(item => `
            <tr>
                <td>${item.description || ''}</td>
                <td>${item.quantity || '0'}</td>
                <td>${item.unitPrice || '0.00'} €</td>
                <td>${item.total || '0.00'} €</td>
            </tr>
        `).join('');

        html = html.replace(/\{\{#each items\}\}[\s\S]*?\{\{\/each\}\}/g, itemsHtml);

        // Gérer les conditions
        html = html.replace(/\{\{#if company\.logo\}\}[\s\S]*?\{\{\/if\}\}/g, '');
        html = html.replace(/\{\{#if company\.siret\}\}/g, '');
        html = html.replace(/\{\{\/if\}\}/g, '');
        html = html.replace(/\{\{#if invoice\.notes\}\}/g, '');

        // Remplacer le CSS
        html = html.replace(/\{\{CSS\}\}/g, selectedTemplate.css || '');

        // Envoi réel de l'email de facture
        const emailResult = await sendInvoiceEmail({
            to: invoiceData.client.email,
            clientName: invoiceData.client.name,
            companyName: companyData[0].name,
            invoiceNumber: invoiceData.invoiceNumber,
            invoiceAmount: templateData.invoice.total,
            invoiceDate: templateData.invoice.issueDate,
            dueDate: templateData.invoice.dueDate,
            subject: input.subject,
            message: input.message,
            invoiceLink: `${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoiceData.id}`,
            // pdfUrl: 'URL_PDF_SI_DISPONIBLE',
        });
        if (!emailResult.success) {
            console.error('Erreur lors de l\'envoi de l\'email de facture:', emailResult.error);
        }

        // Mettre à jour le statut de la facture à "sent"
        await db.update(invoice)
            .set({
                status: 'sent',
                updatedAt: new Date(),
            })
            .where(eq(invoice.id, input.invoiceId));

        return {
            success: true,
            message: `Facture envoyée avec succès à ${invoiceData.client.email}`,
            email: invoiceData.client.email
        };
    }
);

// Action pour récupérer les données de facture avec HTML pour prévisualisation
export const getInvoicePreviewAction = useMutation(
    z.object({ invoiceId: z.string() }),
    async (input, { userId }) => {
        // Vérifier que l'utilisateur appartient à une entreprise
        const userData = await db.select().from(user).where(eq(user.id, userId)).limit(1);

        if (!userData.length || !userData[0].companyId) {
            throw new Error("Utilisateur non associé à une entreprise");
        }

        // Récupérer la facture avec tous les détails
        const invoiceData = await getInvoiceById(input.invoiceId, userData[0].companyId);

        if (!invoiceData) {
            throw new Error("Facture non trouvée");
        }

        // Récupérer les données de l'entreprise
        const companyData = await db.select().from(company).where(eq(company.id, userData[0].companyId)).limit(1);

        if (!companyData.length) {
            throw new Error("Entreprise non trouvée");
        }

        // Récupérer le template
        let selectedTemplate;
        if (invoiceData.templateId) {
            // Template personnalisé
            const customTemplate = await db.select().from(template).where(eq(template.id, invoiceData.templateId)).limit(1);
            if (customTemplate.length) {
                selectedTemplate = customTemplate[0];
            }
        }

        // Si pas de template personnalisé, utiliser un template prédéfini
        if (!selectedTemplate) {
            selectedTemplate = predefinedTemplates.find(t => t.type === 'invoice');
        }

        if (!selectedTemplate) {
            throw new Error("Template non trouvé");
        }

        // Préparer les données pour le template
        const templateData = {
            company: {
                name: companyData[0].name,
                address: companyData[0].address,
                city: companyData[0].city,
                postalCode: companyData[0].postalCode,
                country: companyData[0].country,
                email: companyData[0].email,
                phone: companyData[0].phone,
                siret: companyData[0].siret,
                vatNumber: companyData[0].vatNumber,
                logo: companyData[0].logo,
            },
            client: {
                name: invoiceData.client.name,
                email: invoiceData.client.email,
                address: invoiceData.client.address,
                city: invoiceData.client.city,
                postalCode: invoiceData.client.postalCode,
                country: invoiceData.client.country,
                siret: invoiceData.client.siret,
                vatNumber: invoiceData.client.vatNumber,
            },
            invoice: {
                number: invoiceData.invoiceNumber,
                issueDate: invoiceData.issueDate.toLocaleDateString('fr-FR'),
                dueDate: invoiceData.dueDate.toLocaleDateString('fr-FR'),
                subtotal: invoiceData.subtotal.toFixed(2),
                taxRate: "20",
                taxAmount: invoiceData.vatAmount.toFixed(2),
                total: invoiceData.total.toFixed(2),
                notes: invoiceData.notes || "",
            },
            items: invoiceData.items.map(item => ({
                description: item.description,
                quantity: item.quantity.toString(),
                unitPrice: item.unitPrice.toFixed(2),
                total: item.total.toFixed(2),
            })),
        };

        // Récupérer les données complètes du client
        const clientData = await db.select().from(client).where(eq(client.id, invoiceData.clientId)).limit(1);
        if (clientData.length) {
            templateData.client = {
                ...templateData.client,
                address: clientData[0].address || "",
                city: clientData[0].city || "",
                postalCode: clientData[0].postalCode || "",
                country: clientData[0].country || "",
                siret: clientData[0].siret || "",
                vatNumber: clientData[0].vatNumber || "",
            };
        }

        // Générer le HTML avec les données
        let html = selectedTemplate.html;

        // Remplacer les variables du template
        html = html.replace(/\{\{company\.name\}\}/g, templateData.company.name || '');

        // Gérer les lignes d'adresse de l'entreprise
        if (templateData.company.address) {
            html = html.replace(/\{\{company\.address\}\}/g, templateData.company.address);
        } else {
            html = html.replace(/<p>\{\{company\.address\}\}<\/p>/g, '');
        }

        if (templateData.company.city && templateData.company.postalCode) {
            html = html.replace(/\{\{company\.city\}\}, \{\{company\.postalCode\}\}/g, `${templateData.company.city}, ${templateData.company.postalCode}`);
        } else if (templateData.company.city) {
            html = html.replace(/\{\{company\.city\}\}, \{\{company\.postalCode\}\}/g, templateData.company.city);
        } else if (templateData.company.postalCode) {
            html = html.replace(/\{\{company\.city\}\}, \{\{company\.postalCode\}\}/g, templateData.company.postalCode);
        } else {
            html = html.replace(/<p>\{\{company\.city\}\}, \{\{company\.postalCode\}\}<\/p>/g, '');
        }

        if (templateData.company.country) {
            html = html.replace(/\{\{company\.country\}\}/g, templateData.company.country);
        } else {
            html = html.replace(/<p>\{\{company\.country\}\}<\/p>/g, '');
        }

        if (templateData.company.email) {
            html = html.replace(/\{\{company\.email\}\}/g, templateData.company.email);
        } else {
            html = html.replace(/<p>Email: \{\{company\.email\}\}<\/p>/g, '');
        }

        if (templateData.company.phone) {
            html = html.replace(/\{\{company\.phone\}\}/g, templateData.company.phone);
        } else {
            html = html.replace(/<p>Tél: \{\{company\.phone\}\}<\/p>/g, '');
        }

        html = html.replace(/\{\{company\.siret\}\}/g, templateData.company.siret || '');
        html = html.replace(/\{\{company\.vatNumber\}\}/g, templateData.company.vatNumber || '');
        html = html.replace(/\{\{company\.logo\}\}/g, templateData.company.logo || '');

        // Gérer les lignes d'adresse du client
        html = html.replace(/\{\{client\.name\}\}/g, templateData.client.name || '');

        if (templateData.client.address) {
            html = html.replace(/\{\{client\.address\}\}/g, templateData.client.address);
        } else {
            html = html.replace(/<p>\{\{client\.address\}\}<\/p>/g, '');
        }

        if (templateData.client.city && templateData.client.postalCode) {
            html = html.replace(/\{\{client\.city\}\}, \{\{client\.postalCode\}\}/g, `${templateData.client.city}, ${templateData.client.postalCode}`);
        } else if (templateData.client.city) {
            html = html.replace(/\{\{client\.city\}\}, \{\{client\.postalCode\}\}/g, templateData.client.city);
        } else if (templateData.client.postalCode) {
            html = html.replace(/\{\{client\.city\}\}, \{\{client\.postalCode\}\}/g, templateData.client.postalCode);
        } else {
            html = html.replace(/<p>\{\{client\.city\}\}, \{\{client\.postalCode\}\}<\/p>/g, '');
        }

        if (templateData.client.country) {
            html = html.replace(/\{\{client\.country\}\}/g, templateData.client.country);
        } else {
            html = html.replace(/<p>\{\{client\.country\}\}<\/p>/g, '');
        }

        if (templateData.client.email) {
            html = html.replace(/\{\{client\.email\}\}/g, templateData.client.email);
        } else {
            html = html.replace(/<p>\{\{client\.email\}\}<\/p>/g, '');
        }

        html = html.replace(/\{\{client\.siret\}\}/g, templateData.client.siret || '');
        html = html.replace(/\{\{client\.vatNumber\}\}/g, templateData.client.vatNumber || '');

        html = html.replace(/\{\{invoice\.number\}\}/g, templateData.invoice.number || '');
        html = html.replace(/\{\{invoice\.issueDate\}\}/g, templateData.invoice.issueDate || '');
        html = html.replace(/\{\{invoice\.dueDate\}\}/g, templateData.invoice.dueDate || '');
        html = html.replace(/\{\{invoice\.subtotal\}\}/g, templateData.invoice.subtotal || '0.00');
        html = html.replace(/\{\{invoice\.taxRate\}\}/g, templateData.invoice.taxRate || '20');
        html = html.replace(/\{\{invoice\.taxAmount\}\}/g, templateData.invoice.taxAmount || '0.00');
        html = html.replace(/\{\{invoice\.total\}\}/g, templateData.invoice.total || '0.00');
        html = html.replace(/\{\{invoice\.notes\}\}/g, templateData.invoice.notes || '');

        // Gérer les boucles d'items
        const itemsHtml = templateData.items.map(item => `
            <tr>
                <td>${item.description || ''}</td>
                <td>${item.quantity || '0'}</td>
                <td>${item.unitPrice || '0.00'} €</td>
                <td>${item.total || '0.00'} €</td>
            </tr>
        `).join('');

        html = html.replace(/\{\{#each items\}\}[\s\S]*?\{\{\/each\}\}/g, itemsHtml);

        // Gérer les conditions
        if (templateData.company.logo) {
            html = html.replace(/\{\{#if company\.logo\}\}([\s\S]*?)\{\{\/if\}\}/g, '$1');
        } else {
            html = html.replace(/\{\{#if company\.logo\}\}[\s\S]*?\{\{\/if\}\}/g, '');
        }

        if (templateData.company.siret) {
            html = html.replace(/\{\{#if company\.siret\}\}([\s\S]*?)\{\{\/if\}\}/g, '$1');
        } else {
            html = html.replace(/\{\{#if company\.siret\}\}[\s\S]*?\{\{\/if\}\}/g, '');
        }

        if (templateData.company.vatNumber) {
            html = html.replace(/\{\{#if company\.vatNumber\}\}([\s\S]*?)\{\{\/if\}\}/g, '$1');
        } else {
            html = html.replace(/\{\{#if company\.vatNumber\}\}[\s\S]*?\{\{\/if\}\}/g, '');
        }

        if (templateData.client.siret) {
            html = html.replace(/\{\{#if client\.siret\}\}([\s\S]*?)\{\{\/if\}\}/g, '$1');
        } else {
            html = html.replace(/\{\{#if client\.siret\}\}[\s\S]*?\{\{\/if\}\}/g, '');
        }

        if (templateData.invoice.notes) {
            html = html.replace(/\{\{#if invoice\.notes\}\}([\s\S]*?)\{\{\/if\}\}/g, '$1');
        } else {
            html = html.replace(/\{\{#if invoice\.notes\}\}[\s\S]*?\{\{\/if\}\}/g, '');
        }

        // Remplacer le CSS
        html = html.replace(/\{\{CSS\}\}/g, selectedTemplate.css || '');

        return {
            success: true,
            html: html,
            invoice: invoiceData
        };
    }
);

// Action pour envoyer un rappel de facture
export const remindInvoiceAction = useMutation(
    remindInvoiceSchema,
    async (input, { userId }) => {
        // Vérifier que l'utilisateur appartient à une entreprise
        const userData = await db.select().from(user).where(eq(user.id, userId)).limit(1);

        if (!userData.length || !userData[0].companyId) {
            throw new Error("Utilisateur non associé à une entreprise");
        }

        // Récupérer la facture avec tous les détails
        const invoiceData = await getInvoiceById(input.invoiceId, userData[0].companyId);

        if (!invoiceData) {
            throw new Error("Facture non trouvée");
        }

        // Vérifier que la facture est en statut "sent" ou "overdue"
        if (invoiceData.status !== 'sent' && invoiceData.status !== 'overdue') {
            throw new Error("Seules les factures envoyées ou en retard peuvent faire l'objet d'un rappel");
        }

        // Récupérer les données de l'entreprise
        const companyData = await db.select().from(company).where(eq(company.id, userData[0].companyId)).limit(1);

        if (!companyData.length) {
            throw new Error("Entreprise non trouvée");
        }

        // Envoi du rappel de facture
        const emailResult = await sendInvoiceEmail({
            to: invoiceData.client.email,
            clientName: invoiceData.client.name,
            companyName: companyData[0].name,
            invoiceNumber: invoiceData.invoiceNumber,
            invoiceAmount: invoiceData.total.toFixed(2),
            invoiceDate: invoiceData.issueDate.toLocaleDateString('fr-FR'),
            dueDate: invoiceData.dueDate.toLocaleDateString('fr-FR'),
            subject: input.subject,
            message: input.message,
            invoiceLink: `${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoiceData.id}`,
        });

        if (!emailResult.success) {
            console.error('Erreur lors de l\'envoi du rappel de facture:', emailResult.error);
            throw new Error('Erreur lors de l\'envoi du rappel');
        }

        return {
            success: true,
            message: `Rappel de facture envoyé avec succès à ${invoiceData.client.email}`,
            email: invoiceData.client.email
        };
    }
); 
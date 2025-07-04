"use server"

import { useMutation } from "@/lib/safe-action";
import { createQuoteSchema, updateQuoteSchema, deleteQuoteSchema, updateQuoteStatusSchema, sendQuoteSchema } from "@/validation/quote-schema";
import { db } from "@/lib/drizzle";
import { quote, quoteItem, user, company, client, template } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getNextQuoteNumber, getQuoteById } from "@/db/queries/quote";
import { predefinedTemplates } from "@/lib/templates";
import { z } from "zod";
import puppeteer from "puppeteer";
import { revalidatePath } from "next/cache";
import { paths } from "@/paths";
import { canAddQuote } from "@/db/queries/subscription";
import { ActionError } from "@/lib/safe-action";

// Action pour créer un nouveau devis
export const createQuoteAction = useMutation(
    createQuoteSchema,
    async (input, { userId }) => {
        // Vérifier que l'utilisateur appartient à une entreprise
        const userData = await db.select().from(user).where(eq(user.id, userId)).limit(1);

        if (!userData.length || !userData[0].companyId) {
            throw new ActionError("Utilisateur non associé à une entreprise");
        }

        // Vérifier les limites d'abonnement
        const { canAdd, reason } = await canAddQuote(userData[0].companyId);
        if (!canAdd) {
            throw new ActionError(reason || "Limite de documents atteinte");
        }

        // Générer le numéro de devis si non fourni
        const quoteNumber = input.quoteNumber || await getNextQuoteNumber(userData[0].companyId);

        // Créer le devis
        const [newQuote] = await db.insert(quote).values({
            number: quoteNumber,
            status: input.status,
            issueDate: new Date(input.issueDate),
            validUntil: new Date(input.validUntil),
            subtotal: input.subtotal,
            taxAmount: input.vatAmount,
            total: input.total,
            notes: input.notes,
            terms: input.terms,
            clientId: input.clientId,
            companyId: userData[0].companyId,
            templateId: input.templateId,
        }).returning();

        // Créer les articles du devis
        const quoteItems = input.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
            quoteId: newQuote.id,
        }));

        await db.insert(quoteItem).values(quoteItems);

        // Revalider les pages nécessaires pour mettre à jour l'interface
        revalidatePath(paths.quotes.list);
        revalidatePath(paths.dashboard);

        return {
            success: true,
            message: "Devis créé avec succès",
            quote: newQuote
        };
    }
);

// Action pour mettre à jour un devis
export const updateQuoteAction = useMutation(
    updateQuoteSchema,
    async (input, { userId }) => {
        // Vérifier que l'utilisateur appartient à une entreprise
        const userData = await db.select().from(user).where(eq(user.id, userId)).limit(1);

        if (!userData.length || !userData[0].companyId) {
            throw new Error("Utilisateur non associé à une entreprise");
        }

        // Préparer les données de mise à jour
        const updateData: any = {
            updatedAt: new Date(),
        };

        if (input.status !== undefined) updateData.status = input.status;
        if (input.issueDate !== undefined) updateData.issueDate = new Date(input.issueDate);
        if (input.validUntil !== undefined) updateData.validUntil = new Date(input.validUntil);
        if (input.subtotal !== undefined) updateData.subtotal = input.subtotal;
        if (input.vatAmount !== undefined) updateData.taxAmount = input.vatAmount;
        if (input.total !== undefined) updateData.total = input.total;
        if (input.notes !== undefined) updateData.notes = input.notes;
        if (input.terms !== undefined) updateData.terms = input.terms;
        if (input.clientId !== undefined) updateData.clientId = input.clientId;
        if (input.templateId !== undefined) updateData.templateId = input.templateId;

        // Mettre à jour le devis
        const [updatedQuote] = await db.update(quote)
            .set(updateData)
            .where(eq(quote.id, input.id))
            .returning();

        // Mettre à jour les articles si fournis
        if (input.items) {
            // Supprimer les anciens articles
            await db.delete(quoteItem).where(eq(quoteItem.quoteId, input.id));

            // Créer les nouveaux articles
            const quoteItems = input.items.map(item => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.quantity * item.unitPrice,
                quoteId: input.id,
            }));

            await db.insert(quoteItem).values(quoteItems);
        }

        // Revalider les pages nécessaires pour mettre à jour l'interface
        revalidatePath(paths.quotes.list);
        revalidatePath(paths.dashboard);

        return {
            success: true,
            message: "Devis mis à jour avec succès",
            quote: updatedQuote
        };
    }
);

// Action pour supprimer un devis
export const deleteQuoteAction = useMutation(
    deleteQuoteSchema,
    async (input, { userId }) => {
        // Vérifier que l'utilisateur appartient à une entreprise
        const userData = await db.select().from(user).where(eq(user.id, userId)).limit(1);

        if (!userData.length || !userData[0].companyId) {
            throw new Error("Utilisateur non associé à une entreprise");
        }

        // Vérifier que le devis appartient à l'entreprise
        const quoteData = await db.select().from(quote).where(eq(quote.id, input.id)).limit(1);

        if (!quoteData.length || quoteData[0].companyId !== userData[0].companyId) {
            throw new Error("Devis non trouvé ou accès non autorisé");
        }

        // Supprimer le devis (les articles seront supprimés automatiquement grâce à CASCADE)
        await db.delete(quote).where(eq(quote.id, input.id));

        // Revalider les pages nécessaires pour mettre à jour l'interface
        revalidatePath(paths.quotes.list);
        revalidatePath(paths.dashboard);

        return {
            success: true,
            message: "Devis supprimé avec succès"
        };
    }
);

// Action pour mettre à jour le statut d'un devis
export const updateQuoteStatusAction = useMutation(
    updateQuoteStatusSchema,
    async (input, { userId }) => {
        // Vérifier que l'utilisateur appartient à une entreprise
        const userData = await db.select().from(user).where(eq(user.id, userId)).limit(1);

        if (!userData.length || !userData[0].companyId) {
            throw new Error("Utilisateur non associé à une entreprise");
        }

        // Vérifier que le devis appartient à l'entreprise
        const quoteData = await db.select().from(quote).where(eq(quote.id, input.id)).limit(1);

        if (!quoteData.length || quoteData[0].companyId !== userData[0].companyId) {
            throw new Error("Devis non trouvé ou accès non autorisé");
        }

        // Mettre à jour le statut
        const [updatedQuote] = await db.update(quote)
            .set({
                status: input.status,
                updatedAt: new Date(),
            })
            .where(eq(quote.id, input.id))
            .returning();

        // Revalider les pages nécessaires pour mettre à jour l'interface
        revalidatePath(paths.quotes.list);
        revalidatePath(paths.dashboard);

        return {
            success: true,
            message: "Statut du devis mis à jour avec succès",
            quote: updatedQuote
        };
    }
);

// Action pour générer et télécharger un devis en PDF
export const downloadQuoteAction = useMutation(
    z.object({ quoteId: z.string() }),
    async (input, { userId }) => {
        // Vérifier que l'utilisateur appartient à une entreprise
        const userData = await db.select().from(user).where(eq(user.id, userId)).limit(1);

        if (!userData.length || !userData[0].companyId) {
            throw new Error("Utilisateur non associé à une entreprise");
        }

        // Récupérer le devis avec tous les détails
        const quoteData = await getQuoteById(input.quoteId, userData[0].companyId);

        if (!quoteData) {
            throw new Error("Devis non trouvé");
        }

        // Récupérer les données de l'entreprise
        const companyData = await db.select().from(company).where(eq(company.id, userData[0].companyId)).limit(1);

        if (!companyData.length) {
            throw new Error("Entreprise non trouvée");
        }

        // Récupérer le template
        let selectedTemplate;
        if (quoteData.templateId) {
            // Template personnalisé
            const customTemplate = await db.select().from(template).where(eq(template.id, quoteData.templateId)).limit(1);
            if (customTemplate.length) {
                selectedTemplate = customTemplate[0];
            }
        }

        // Si pas de template personnalisé, utiliser un template prédéfini
        if (!selectedTemplate) {
            selectedTemplate = predefinedTemplates.find(t => t.type === 'quote');
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
                name: quoteData.client.name,
                email: quoteData.client.email,
                address: quoteData.client.address,
                city: quoteData.client.city,
                postalCode: quoteData.client.postalCode,
                country: quoteData.client.country,
                siret: quoteData.client.siret,
                vatNumber: quoteData.client.vatNumber,
            },
            quote: {
                number: quoteData.quoteNumber,
                issueDate: quoteData.issueDate.toLocaleDateString('fr-FR'),
                validUntil: quoteData.validUntil.toLocaleDateString('fr-FR'),
                subtotal: quoteData.subtotal.toFixed(2),
                taxRate: "20",
                taxAmount: quoteData.vatAmount.toFixed(2),
                total: quoteData.total.toFixed(2),
                notes: quoteData.notes || "",
                terms: quoteData.terms || "",
            },
            items: quoteData.items.map(item => ({
                description: item.description,
                quantity: item.quantity.toString(),
                unitPrice: item.unitPrice.toFixed(2),
                total: item.total.toFixed(2),
            })),
        };

        // Récupérer les données complètes du client
        const clientData = await db.select().from(client).where(eq(client.id, quoteData.clientId)).limit(1);
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

        // Injecter le CSS dans le HTML
        html = html.replace(/\{\{CSS\}\}/g, selectedTemplate.css || '');

        // Gérer les conditions Handlebars pour le logo
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

        if (templateData.quote.notes) {
            html = html.replace(/\{\{#if quote\.notes\}\}([\s\S]*?)\{\{\/if\}\}/g, '$1');
        } else {
            html = html.replace(/\{\{#if quote\.notes\}\}[\s\S]*?\{\{\/if\}\}/g, '');
        }

        if (templateData.quote.terms) {
            html = html.replace(/\{\{#if quote\.terms\}\}([\s\S]*?)\{\{\/if\}\}/g, '$1');
        } else {
            html = html.replace(/\{\{#if quote\.terms\}\}[\s\S]*?\{\{\/if\}\}/g, '');
        }

        // Remplacer les variables du template avec gestion des données manquantes
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

        html = html.replace(/\{\{quote\.number\}\}/g, templateData.quote.number || '');
        html = html.replace(/\{\{quote\.issueDate\}\}/g, templateData.quote.issueDate || '');
        html = html.replace(/\{\{quote\.validUntil\}\}/g, templateData.quote.validUntil || '');
        html = html.replace(/\{\{quote\.subtotal\}\}/g, templateData.quote.subtotal || '0.00');
        html = html.replace(/\{\{quote\.taxRate\}\}/g, templateData.quote.taxRate || '20');
        html = html.replace(/\{\{quote\.taxAmount\}\}/g, templateData.quote.taxAmount || '0.00');
        html = html.replace(/\{\{quote\.total\}\}/g, templateData.quote.total || '0.00');
        html = html.replace(/\{\{quote\.notes\}\}/g, templateData.quote.notes || '');
        html = html.replace(/\{\{quote\.terms\}\}/g, templateData.quote.terms || '');

        // Gérer les boucles d'items
        const itemsHtml = templateData.items.map(item => `
            <tr>
                <td>${item.description || ''}</td>
                <td>${item.quantity || '0'}</td>
                <td>${item.unitPrice || '0.00'} €</td>
                <td>${item.total || '0.00'} €</td>
            </tr>
        `).join('');

        // Remplacer la section des items avec la syntaxe Handlebars
        html = html.replace(/\{\{#each items\}\}[\s\S]*?\{\{\/each\}\}/g, itemsHtml);

        // Générer le PDF avec Puppeteer
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

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

        // Convertir en base64
        const base64 = Buffer.from(pdf).toString('base64');

        return {
            success: true,
            pdf: base64,
            filename: `devis-${quoteData.quoteNumber}.pdf`
        };
    }
);

// Action pour envoyer un devis par email
export const sendQuoteAction = useMutation(
    sendQuoteSchema,
    async (input, { userId }) => {
        // Vérifier que l'utilisateur appartient à une entreprise
        const userData = await db.select().from(user).where(eq(user.id, userId)).limit(1);

        if (!userData.length || !userData[0].companyId) {
            throw new Error("Utilisateur non associé à une entreprise");
        }

        // Vérifier que le devis appartient à l'entreprise
        const quoteData = await db.select().from(quote).where(eq(quote.id, input.quoteId)).limit(1);

        if (!quoteData.length || quoteData[0].companyId !== userData[0].companyId) {
            throw new Error("Devis non trouvé ou accès non autorisé");
        }

        // Récupérer les données du client
        const clientData = await db.select().from(client).where(eq(client.id, quoteData[0].clientId)).limit(1);

        if (!clientData.length) {
            throw new Error("Client non trouvé");
        }

        // TODO: Implémenter l'envoi d'email réel
        // Pour l'instant, on simule l'envoi
        console.log('Envoi du devis par email:', {
            to: clientData[0].email,
            subject: input.subject,
            message: input.message,
            quoteId: input.quoteId
        });

        // Mettre à jour le statut du devis
        const [updatedQuote] = await db.update(quote)
            .set({
                status: 'sent',
                updatedAt: new Date(),
            })
            .where(eq(quote.id, input.quoteId))
            .returning();

        return {
            success: true,
            message: "Devis envoyé avec succès",
            quote: updatedQuote
        };
    }
);

// Action pour générer l'aperçu HTML d'un devis
export const getQuotePreviewAction = useMutation(
    z.object({ quoteId: z.string() }),
    async (input, { userId }) => {
        // Vérifier que l'utilisateur appartient à une entreprise
        const userData = await db.select().from(user).where(eq(user.id, userId)).limit(1);

        if (!userData.length || !userData[0].companyId) {
            throw new Error("Utilisateur non associé à une entreprise");
        }

        // Récupérer le devis avec tous les détails
        const quoteData = await getQuoteById(input.quoteId, userData[0].companyId);

        if (!quoteData) {
            throw new Error("Devis non trouvé");
        }

        // Récupérer les données de l'entreprise
        const companyData = await db.select().from(company).where(eq(company.id, userData[0].companyId)).limit(1);

        if (!companyData.length) {
            throw new Error("Entreprise non trouvée");
        }

        // Récupérer le template
        let selectedTemplate;
        if (quoteData.templateId) {
            // Template personnalisé
            const customTemplate = await db.select().from(template).where(eq(template.id, quoteData.templateId)).limit(1);
            if (customTemplate.length) {
                selectedTemplate = customTemplate[0];
            }
        }

        // Si pas de template personnalisé, utiliser un template prédéfini
        if (!selectedTemplate) {
            selectedTemplate = predefinedTemplates.find(t => t.type === 'quote');
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
                name: quoteData.client.name,
                email: quoteData.client.email,
                address: quoteData.client.address,
                city: quoteData.client.city,
                postalCode: quoteData.client.postalCode,
                country: quoteData.client.country,
                siret: quoteData.client.siret,
                vatNumber: quoteData.client.vatNumber,
            },
            quote: {
                number: quoteData.quoteNumber,
                issueDate: quoteData.issueDate.toLocaleDateString('fr-FR'),
                validUntil: quoteData.validUntil.toLocaleDateString('fr-FR'),
                subtotal: quoteData.subtotal.toFixed(2),
                taxRate: "20",
                taxAmount: quoteData.vatAmount.toFixed(2),
                total: quoteData.total.toFixed(2),
                notes: quoteData.notes || "",
                terms: quoteData.terms || "",
            },
            items: quoteData.items.map(item => ({
                description: item.description,
                quantity: item.quantity.toString(),
                unitPrice: item.unitPrice.toFixed(2),
                total: item.total.toFixed(2),
            })),
        };

        // Récupérer les données complètes du client
        const clientData = await db.select().from(client).where(eq(client.id, quoteData.clientId)).limit(1);
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

        // Injecter le CSS dans le HTML
        html = html.replace(/\{\{CSS\}\}/g, selectedTemplate.css || '');

        // Gérer les conditions Handlebars pour le logo
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

        if (templateData.quote.notes) {
            html = html.replace(/\{\{#if quote\.notes\}\}([\s\S]*?)\{\{\/if\}\}/g, '$1');
        } else {
            html = html.replace(/\{\{#if quote\.notes\}\}[\s\S]*?\{\{\/if\}\}/g, '');
        }

        if (templateData.quote.terms) {
            html = html.replace(/\{\{#if quote\.terms\}\}([\s\S]*?)\{\{\/if\}\}/g, '$1');
        } else {
            html = html.replace(/\{\{#if quote\.terms\}\}[\s\S]*?\{\{\/if\}\}/g, '');
        }

        // Remplacer les variables du template avec gestion des données manquantes
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

        html = html.replace(/\{\{quote\.number\}\}/g, templateData.quote.number || '');
        html = html.replace(/\{\{quote\.issueDate\}\}/g, templateData.quote.issueDate || '');
        html = html.replace(/\{\{quote\.validUntil\}\}/g, templateData.quote.validUntil || '');
        html = html.replace(/\{\{quote\.subtotal\}\}/g, templateData.quote.subtotal || '0.00');
        html = html.replace(/\{\{quote\.taxRate\}\}/g, templateData.quote.taxRate || '20');
        html = html.replace(/\{\{quote\.taxAmount\}\}/g, templateData.quote.taxAmount || '0.00');
        html = html.replace(/\{\{quote\.total\}\}/g, templateData.quote.total || '0.00');
        html = html.replace(/\{\{quote\.notes\}\}/g, templateData.quote.notes || '');
        html = html.replace(/\{\{quote\.terms\}\}/g, templateData.quote.terms || '');

        // Gérer les boucles d'items
        const itemsHtml = templateData.items.map(item => `
            <tr>
                <td>${item.description || ''}</td>
                <td>${item.quantity || '0'}</td>
                <td>${item.unitPrice || '0.00'} €</td>
                <td>${item.total || '0.00'} €</td>
            </tr>
        `).join('');

        // Remplacer la section des items avec la syntaxe Handlebars
        html = html.replace(/\{\{#each items\}\}[\s\S]*?\{\{\/each\}\}/g, itemsHtml);

        return {
            success: true,
            html: html
        };
    }
); 
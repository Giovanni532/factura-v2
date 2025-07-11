import puppeteer from "puppeteer";
import { db } from "@/lib/drizzle";
import { company, client, template } from "@/db/schema";
import { eq } from "drizzle-orm";
import { predefinedTemplates } from "@/lib/templates";

export interface TemplateData {
    company: {
        name: string;
        address?: string;
        city?: string;
        postalCode?: string;
        country?: string;
        email?: string;
        phone?: string;
        siret?: string;
        vatNumber?: string;
        logo?: string;
    };
    client: {
        name: string;
        email?: string;
        address?: string;
        city?: string;
        postalCode?: string;
        country?: string;
        siret?: string;
        vatNumber?: string;
    };
    document: {
        number: string;
        issueDate: string;
        dueDate?: string;
        validUntil?: string;
        subtotal: string;
        taxRate: string;
        taxAmount: string;
        total: string;
        notes?: string;
        terms?: string;
    };
    items: Array<{
        description: string;
        quantity: string;
        unitPrice: string;
        total: string;
    }>;
}

export async function generatePDF(
    templateData: TemplateData,
    selectedTemplate: any,
    documentType: 'invoice' | 'quote'
): Promise<{ pdf: Uint8Array; filename: string }> {
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

    if (templateData.document.notes) {
        html = html.replace(/\{\{#if (invoice|quote)\.notes\}\}([\s\S]*?)\{\{\/if\}\}/g, '$1');
    } else {
        html = html.replace(/\{\{#if (invoice|quote)\.notes\}\}[\s\S]*?\{\{\/if\}\}/g, '');
    }

    if (templateData.document.terms) {
        html = html.replace(/\{\{#if (invoice|quote)\.terms\}\}([\s\S]*?)\{\{\/if\}\}/g, '$1');
    } else {
        html = html.replace(/\{\{#if (invoice|quote)\.terms\}\}[\s\S]*?\{\{\/if\}\}/g, '');
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

    // Remplacer les variables du document selon le type
    const documentPrefix = documentType === 'invoice' ? 'invoice' : 'quote';
    html = html.replace(new RegExp(`\\{\\{${documentPrefix}\\.number\\}\\}`, 'g'), templateData.document.number || '');
    html = html.replace(new RegExp(`\\{\\{${documentPrefix}\\.issueDate\\}\\}`, 'g'), templateData.document.issueDate || '');

    if (documentType === 'invoice' && templateData.document.dueDate) {
        html = html.replace(/\{\{invoice\.dueDate\}\}/g, templateData.document.dueDate || '');
    } else if (documentType === 'quote' && templateData.document.validUntil) {
        html = html.replace(/\{\{quote\.validUntil\}\}/g, templateData.document.validUntil || '');
    }

    html = html.replace(new RegExp(`\\{\\{${documentPrefix}\\.subtotal\\}\\}`, 'g'), templateData.document.subtotal || '0.00');
    html = html.replace(new RegExp(`\\{\\{${documentPrefix}\\.taxRate\\}\\}`, 'g'), templateData.document.taxRate || '20');
    html = html.replace(new RegExp(`\\{\\{${documentPrefix}\\.taxAmount\\}\\}`, 'g'), templateData.document.taxAmount || '0.00');
    html = html.replace(new RegExp(`\\{\\{${documentPrefix}\\.total\\}\\}`, 'g'), templateData.document.total || '0.00');
    html = html.replace(new RegExp(`\\{\\{${documentPrefix}\\.notes\\}\\}`, 'g'), templateData.document.notes || '');
    html = html.replace(new RegExp(`\\{\\{${documentPrefix}\\.terms\\}\\}`, 'g'), templateData.document.terms || '');

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

    const filename = `${documentType}-${templateData.document.number}.pdf`;

    return { pdf, filename };
}

export async function getTemplateForDocument(
    templateId: string | null,
    documentType: 'invoice' | 'quote',
    companyId: string
): Promise<any> {
    let selectedTemplate;

    if (templateId) {
        // Template personnalisé
        const customTemplate = await db.select().from(template).where(eq(template.id, templateId)).limit(1);
        if (customTemplate.length) {
            selectedTemplate = customTemplate[0];
        }
    }

    // Si pas de template personnalisé, utiliser un template prédéfini
    if (!selectedTemplate) {
        selectedTemplate = predefinedTemplates.find(t => t.type === documentType);
    }

    if (!selectedTemplate) {
        throw new Error("Template non trouvé");
    }

    return selectedTemplate;
}

export async function getCompanyData(companyId: string) {
    const companyData = await db.select().from(company).where(eq(company.id, companyId)).limit(1);

    if (!companyData.length) {
        throw new Error("Entreprise non trouvée");
    }

    return companyData[0];
}

export async function getClientData(clientId: string) {
    const clientData = await db.select().from(client).where(eq(client.id, clientId)).limit(1);

    if (!clientData.length) {
        throw new Error("Client non trouvé");
    }

    return clientData[0];
} 
import { InvitationEmail, InvoiceEmail, QuoteEmail } from '@/components/email';
import { Resend } from 'resend';
import { z } from 'zod';
import React from 'react';

const resend = new Resend(process.env.RESEND_API_KEY);

// Schémas de validation pour les différents types d'emails
const invitationEmailSchema = z.object({
    type: z.literal('invitation'),
    to: z.string().email(),
    companyName: z.string(),
    inviterName: z.string(),
    inviteeName: z.string(),
    inviteeEmail: z.string().email(),
    role: z.string(),
    invitationLink: z.string().url(),
});

const invoiceEmailSchema = z.object({
    type: z.literal('invoice'),
    to: z.string().email(),
    clientName: z.string(),
    companyName: z.string(),
    invoiceNumber: z.string(),
    invoiceAmount: z.string(),
    invoiceDate: z.string(),
    dueDate: z.string(),
    subject: z.string(),
    message: z.string().optional(),
    invoiceLink: z.string().url(),
    pdfData: z.string().optional(),
    pdfFilename: z.string().optional(),
});

const quoteEmailSchema = z.object({
    type: z.literal('quote'),
    to: z.string().email(),
    clientName: z.string(),
    companyName: z.string(),
    quoteNumber: z.string(),
    quoteAmount: z.string(),
    quoteDate: z.string(),
    validUntil: z.string(),
    subject: z.string(),
    message: z.string().optional(),
    quoteLink: z.string().url(),
    pdfData: z.string().optional(),
    pdfFilename: z.string().optional(),
});

const emailSchema = z.discriminatedUnion('type', [
    invitationEmailSchema,
    invoiceEmailSchema,
    quoteEmailSchema,
]);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedData = emailSchema.parse(body);

        let emailComponent;
        let subject = '';

        switch (validatedData.type) {
            case 'invitation':
                emailComponent = React.createElement(InvitationEmail, {
                    companyName: validatedData.companyName,
                    inviterName: validatedData.inviterName,
                    inviteeName: validatedData.inviteeName,
                    inviteeEmail: validatedData.inviteeEmail,
                    role: validatedData.role,
                    invitationLink: validatedData.invitationLink,
                });
                subject = `Invitation à rejoindre ${validatedData.companyName}`;
                break;

            case 'invoice':
                emailComponent = React.createElement(InvoiceEmail, {
                    clientName: validatedData.clientName,
                    companyName: validatedData.companyName,
                    invoiceNumber: validatedData.invoiceNumber,
                    invoiceAmount: validatedData.invoiceAmount,
                    invoiceDate: validatedData.invoiceDate,
                    dueDate: validatedData.dueDate,
                    subject: validatedData.subject,
                    message: validatedData.message || '',
                    invoiceLink: validatedData.invoiceLink,
                });
                subject = validatedData.subject || `Facture #${validatedData.invoiceNumber}`;
                break;

            case 'quote':
                emailComponent = React.createElement(QuoteEmail, {
                    clientName: validatedData.clientName,
                    companyName: validatedData.companyName,
                    quoteNumber: validatedData.quoteNumber,
                    quoteAmount: validatedData.quoteAmount,
                    quoteDate: validatedData.quoteDate,
                    validUntil: validatedData.validUntil,
                    subject: validatedData.subject,
                    message: validatedData.message || '',
                    quoteLink: validatedData.quoteLink,
                });
                subject = validatedData.subject || `Devis #${validatedData.quoteNumber}`;
                break;
        }

        // Préparer les options d'envoi
        const emailOptions: any = {
            from: process.env.RESEND_FROM_EMAIL!,
            to: [validatedData.to],
            subject,
            react: emailComponent,
        };

        // Ajouter les pièces jointes PDF si disponibles
        if ((validatedData.type === 'invoice' || validatedData.type === 'quote') && validatedData.pdfData && validatedData.pdfFilename) {
            emailOptions.attachments = [
                {
                    filename: validatedData.pdfFilename,
                    content: Buffer.from(validatedData.pdfData, 'base64'),
                }
            ];
        }

        const { data, error } = await resend.emails.send(emailOptions);

        if (error) {
            console.error('Erreur Resend:', error);
            return Response.json({ error: error.message }, { status: 500 });
        }

        return Response.json({ success: true, data });
    } catch (error) {
        console.error('Erreur validation ou envoi:', error);

        if (error instanceof z.ZodError) {
            return Response.json({
                error: 'Données invalides',
                details: error.errors
            }, { status: 400 });
        }

        return Response.json({
            error: 'Erreur interne du serveur'
        }, { status: 500 });
    }
}
// Types pour les différents types d'emails
export interface InvitationEmailData {
    type: 'invitation';
    to: string;
    companyName: string;
    inviterName: string;
    inviteeName: string;
    inviteeEmail: string;
    role: string;
    invitationLink: string;
}

export interface InvoiceEmailData {
    type: 'invoice';
    to: string;
    clientName: string;
    companyName: string;
    invoiceNumber: string;
    invoiceAmount: string;
    invoiceDate: string;
    dueDate: string;
    subject: string;
    message?: string;
    invoiceLink: string;
    pdfData?: string; // Base64 du PDF
    pdfFilename?: string; // Nom du fichier PDF
}

export interface QuoteEmailData {
    type: 'quote';
    to: string;
    clientName: string;
    companyName: string;
    quoteNumber: string;
    quoteAmount: string;
    quoteDate: string;
    validUntil: string;
    subject: string;
    message?: string;
    quoteLink: string;
    pdfData?: string; // Base64 du PDF
    pdfFilename?: string; // Nom du fichier PDF
}

export type EmailData = InvitationEmailData | InvoiceEmailData | QuoteEmailData;

/**
 * Envoie un email via l'API Resend (côté serveur)
 */
export async function sendEmail(emailData: EmailData): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
        // Import dynamique de Resend pour éviter les problèmes côté client
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

        let emailComponent;
        let subject = '';
        const React = await import('react');

        switch (emailData.type) {
            case 'invitation':
                const { InvitationEmail } = await import('@/components/email');
                emailComponent = React.createElement(InvitationEmail, {
                    companyName: emailData.companyName,
                    inviterName: emailData.inviterName,
                    inviteeName: emailData.inviteeName,
                    inviteeEmail: emailData.inviteeEmail,
                    role: emailData.role,
                    invitationLink: emailData.invitationLink,
                });
                subject = `Invitation à rejoindre ${emailData.companyName}`;
                break;

            case 'invoice':
                const { InvoiceEmail } = await import('@/components/email');
                emailComponent = React.createElement(InvoiceEmail, {
                    clientName: emailData.clientName,
                    companyName: emailData.companyName,
                    invoiceNumber: emailData.invoiceNumber,
                    invoiceAmount: emailData.invoiceAmount,
                    invoiceDate: emailData.invoiceDate,
                    dueDate: emailData.dueDate,
                    subject: emailData.subject,
                    message: emailData.message || '',
                    invoiceLink: emailData.invoiceLink,
                });
                subject = emailData.subject || `Facture #${emailData.invoiceNumber}`;
                break;

            case 'quote':
                const { QuoteEmail } = await import('@/components/email');
                emailComponent = React.createElement(QuoteEmail, {
                    clientName: emailData.clientName,
                    companyName: emailData.companyName,
                    quoteNumber: emailData.quoteNumber,
                    quoteAmount: emailData.quoteAmount,
                    quoteDate: emailData.quoteDate,
                    validUntil: emailData.validUntil,
                    subject: emailData.subject,
                    message: emailData.message || '',
                    quoteLink: emailData.quoteLink,
                });
                subject = emailData.subject || `Devis #${emailData.quoteNumber}`;
                break;
        }

        // Préparer les options d'envoi
        const emailOptions: any = {
            from: `Factura <onboarding@mail.giovannisalcuni.dev>`,
            to: [emailData.to],
            subject,
            react: emailComponent,
        };

        // Ajouter les pièces jointes PDF si disponibles
        if ((emailData.type === 'invoice' || emailData.type === 'quote') && emailData.pdfData && emailData.pdfFilename) {
            emailOptions.attachments = [
                {
                    filename: emailData.pdfFilename,
                    content: Buffer.from(emailData.pdfData, 'base64'),
                }
            ];
        }

        const { data, error } = await resend.emails.send(emailOptions);

        if (error) {
            console.error('Erreur Resend:', error);
            return {
                success: false,
                error: error.message,
            };
        }

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
        return {
            success: false,
            error: 'Erreur interne lors de l\'envoi de l\'email',
        };
    }
}

/**
 * Envoie un email d'invitation
 */
export async function sendInvitationEmail(data: Omit<InvitationEmailData, 'type'>): Promise<{ success: boolean; data?: any; error?: string }> {
    return sendEmail({
        type: 'invitation',
        ...data,
    });
}

/**
 * Envoie un email de facture
 */
export async function sendInvoiceEmail(data: Omit<InvoiceEmailData, 'type'>): Promise<{ success: boolean; data?: any; error?: string }> {
    return sendEmail({
        type: 'invoice',
        ...data,
    });
}

/**
 * Envoie un email de devis
 */
export async function sendQuoteEmail(data: Omit<QuoteEmailData, 'type'>): Promise<{ success: boolean; data?: any; error?: string }> {
    return sendEmail({
        type: 'quote',
        ...data,
    });
} 
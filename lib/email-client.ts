// Types pour les différents types d'emails (côté client)
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
    pdfUrl?: string;
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
    pdfUrl?: string;
}

export type EmailData = InvitationEmailData | InvoiceEmailData | QuoteEmailData;

/**
 * Envoie un email via l'API route (côté client)
 */
export async function sendEmailClient(emailData: EmailData): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
        const response = await fetch('/api/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailData),
        });

        const result = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: result.error || 'Erreur lors de l\'envoi de l\'email',
            };
        }

        return {
            success: true,
            data: result.data,
        };
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
        return {
            success: false,
            error: 'Erreur de connexion lors de l\'envoi de l\'email',
        };
    }
}

/**
 * Envoie un email d'invitation (côté client)
 */
export async function sendInvitationEmailClient(data: Omit<InvitationEmailData, 'type'>): Promise<{ success: boolean; data?: any; error?: string }> {
    return sendEmailClient({
        type: 'invitation',
        ...data,
    });
}

/**
 * Envoie un email de facture (côté client)
 */
export async function sendInvoiceEmailClient(data: Omit<InvoiceEmailData, 'type'>): Promise<{ success: boolean; data?: any; error?: string }> {
    return sendEmailClient({
        type: 'invoice',
        ...data,
    });
}

/**
 * Envoie un email de devis (côté client)
 */
export async function sendQuoteEmailClient(data: Omit<QuoteEmailData, 'type'>): Promise<{ success: boolean; data?: any; error?: string }> {
    return sendEmailClient({
        type: 'quote',
        ...data,
    });
} 
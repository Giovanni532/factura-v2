import { modernTemplate } from './modern';
import { classicTemplate } from './classic';
import { minimalTemplate } from './minimal';
import { modernInvoiceTemplate } from './modern-invoice';
import { classicInvoiceTemplate } from './classic-invoice';
import { minimalInvoiceTemplate } from './minimal-invoice';
import { modernQuoteTemplate } from './modern-quote';
import { classicQuoteTemplate } from './classic-quote';
import { minimalQuoteTemplate } from './minimal-quote';

export const predefinedTemplates = [
    // Templates de factures
    modernInvoiceTemplate,
    classicInvoiceTemplate,
    minimalInvoiceTemplate,
    // Templates de devis
    modernQuoteTemplate,
    classicQuoteTemplate,
    minimalQuoteTemplate,
];

export {
    modernInvoiceTemplate,
    classicInvoiceTemplate,
    minimalInvoiceTemplate,
    modernQuoteTemplate,
    classicQuoteTemplate,
    minimalQuoteTemplate
};

export type Template = {
    id: string;
    name: string;
    description: string;
    html: string;
    css: string;
    type: 'invoice' | 'quote';
}; 
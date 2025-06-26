import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// Définition de la table company d'abord
export const company = sqliteTable("company", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    address: text('address'),
    city: text('city'),
    postalCode: text('postal_code'),
    country: text('country'),
    siret: text('siret'),
    vatNumber: text('vat_number'),
    logo: text('logo'),
    ownerId: text('owner_id').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull()
});

export const user = sqliteTable("user", {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: integer('email_verified', { mode: 'boolean' }).$defaultFn(() => false).notNull(),
    image: text('image'),
    companyId: text('company_id').references(() => company.id, { onDelete: 'cascade' }),
    role: text('role', { enum: ['owner', 'admin', 'user'] }).$defaultFn(() => 'user').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
});

export const session = sqliteTable("session", {
    id: text('id').primaryKey(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    token: text('token').notNull().unique(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' })
});

export const account = sqliteTable("account", {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
    refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
    scope: text('scope'),
    password: text('password'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const verification = sqliteTable("verification", {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => /* @__PURE__ */ new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => /* @__PURE__ */ new Date())
});

// Tables pour l'application de facturation

export const client = sqliteTable("client", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    address: text('address'),
    city: text('city'),
    postalCode: text('postal_code'),
    country: text('country'),
    siret: text('siret'),
    vatNumber: text('vat_number'),
    companyId: text('company_id').notNull().references(() => company.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull()
});

export const template = sqliteTable("template", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    description: text('description'),
    html: text('html').notNull(), // Template HTML de la facture
    css: text('css'), // CSS personnalisé
    preview: text('preview'), // URL ou base64 de l'aperçu
    type: text('type', { enum: ['invoice', 'quote'] }).$defaultFn(() => 'invoice').notNull(), // Type de template
    isDefault: integer('is_default', { mode: 'boolean' }).$defaultFn(() => false).notNull(),
    isPredefined: integer('is_predefined', { mode: 'boolean' }).$defaultFn(() => false).notNull(), // Templates prédéfinis par Factura
    companyId: text('company_id').references(() => company.id, { onDelete: 'cascade' }), // Null pour les templates prédéfinis
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull()
});

export const userFavoriteTemplate = sqliteTable("user_favorite_template", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    templateId: text('template_id').notNull().references(() => template.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull()
});

export const companyDefaultTemplate = sqliteTable("company_default_template", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    companyId: text('company_id').notNull().references(() => company.id, { onDelete: 'cascade' }),
    templateId: text('template_id').notNull().references(() => template.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull()
});

export const invoice = sqliteTable("invoice", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    number: text('number').notNull(),
    status: text('status', { enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'] }).$defaultFn(() => 'draft').notNull(),
    issueDate: integer('issue_date', { mode: 'timestamp' }).notNull(),
    dueDate: integer('due_date', { mode: 'timestamp' }).notNull(),
    subtotal: real('subtotal').notNull(),
    taxRate: real('tax_rate').$defaultFn(() => 20).notNull(), // TVA par défaut 20%
    taxAmount: real('tax_amount').notNull(),
    total: real('total').notNull(),
    notes: text('notes'),
    clientId: text('client_id').notNull().references(() => client.id, { onDelete: 'cascade' }),
    companyId: text('company_id').notNull().references(() => company.id, { onDelete: 'cascade' }),
    templateId: text('template_id').references(() => template.id),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull()
});

export const invoiceItem = sqliteTable("invoice_item", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    description: text('description').notNull(),
    quantity: real('quantity').notNull(),
    unitPrice: real('unit_price').notNull(),
    total: real('total').notNull(),
    invoiceId: text('invoice_id').notNull().references(() => invoice.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull()
});

export const billingPlan = sqliteTable("billing_plan", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    description: text('description'),
    price: real('price').notNull(),
    currency: text('currency').$defaultFn(() => 'EUR').notNull(),
    interval: text('interval', { enum: ['monthly', 'yearly'] }).notNull(),
    maxUsers: integer('max_users').notNull(),
    maxClients: integer('max_clients').notNull(),
    maxInvoices: integer('max_invoices').notNull(),
    features: text('features'), // JSON string des fonctionnalités
    isActive: integer('is_active', { mode: 'boolean' }).$defaultFn(() => true).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull()
});

export const subscription = sqliteTable("subscription", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    status: text('status', { enum: ['active', 'cancelled', 'past_due', 'unpaid'] }).notNull(),
    currentPeriodStart: integer('current_period_start', { mode: 'timestamp' }).notNull(),
    currentPeriodEnd: integer('current_period_end', { mode: 'timestamp' }).notNull(),
    cancelAtPeriodEnd: integer('cancel_at_period_end', { mode: 'boolean' }).$defaultFn(() => false).notNull(),
    stripeCustomerId: text('stripe_customer_id'),
    stripeSubscriptionId: text('stripe_subscription_id'),
    companyId: text('company_id').notNull().references(() => company.id, { onDelete: 'cascade' }),
    billingPlanId: text('billing_plan_id').notNull().references(() => billingPlan.id),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull()
});

// Tables pour les devis
export const quote = sqliteTable("quote", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    number: text('number').notNull(),
    status: text('status', { enum: ['draft', 'sent', 'accepted', 'rejected', 'expired', 'converted'] }).$defaultFn(() => 'draft').notNull(),
    issueDate: integer('issue_date', { mode: 'timestamp' }).notNull(),
    validUntil: integer('valid_until', { mode: 'timestamp' }).notNull(), // Date de validité du devis
    subtotal: real('subtotal').notNull(),
    taxRate: real('tax_rate').$defaultFn(() => 20).notNull(),
    taxAmount: real('tax_amount').notNull(),
    total: real('total').notNull(),
    notes: text('notes'),
    terms: text('terms'), // Conditions générales
    clientId: text('client_id').notNull().references(() => client.id, { onDelete: 'cascade' }),
    companyId: text('company_id').notNull().references(() => company.id, { onDelete: 'cascade' }),
    templateId: text('template_id').references(() => template.id),
    convertedToInvoiceId: text('converted_to_invoice_id').references(() => invoice.id), // Si converti en facture
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull()
});

export const quoteItem = sqliteTable("quote_item", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    description: text('description').notNull(),
    quantity: real('quantity').notNull(),
    unitPrice: real('unit_price').notNull(),
    total: real('total').notNull(),
    quoteId: text('quote_id').notNull().references(() => quote.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull()
});

// Tables pour la comptabilité
export const chartOfAccounts = sqliteTable("chart_of_accounts", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    code: text('code').notNull(), // 512000, 411000, etc.
    name: text('name').notNull(), // "Banque", "Clients", etc.
    type: text('type', { enum: ['asset', 'liability', 'equity', 'revenue', 'expense'] }).notNull(),
    parentAccountId: text('parent_account_id'), // Référence vers la même table
    companyId: text('company_id').notNull().references(() => company.id, { onDelete: 'cascade' }),
    isActive: integer('is_active', { mode: 'boolean' }).$defaultFn(() => true).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull()
});

export const journalEntry = sqliteTable("journal_entry", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    number: text('number').notNull(), // Numéro d'écriture
    date: integer('date', { mode: 'timestamp' }).notNull(),
    description: text('description').notNull(),
    reference: text('reference'), // Référence externe
    type: text('type', { enum: ['sale', 'purchase', 'payment', 'receipt', 'adjustment'] }).notNull(),
    invoiceId: text('invoice_id').references(() => invoice.id),
    quoteId: text('quote_id').references(() => quote.id),
    companyId: text('company_id').notNull().references(() => company.id, { onDelete: 'cascade' }),
    isPosted: integer('is_posted', { mode: 'boolean' }).$defaultFn(() => false).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull()
});

export const journalEntryLine = sqliteTable("journal_entry_line", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    journalEntryId: text('journal_entry_id').notNull().references(() => journalEntry.id, { onDelete: 'cascade' }),
    accountId: text('account_id').notNull().references(() => chartOfAccounts.id),
    debit: real('debit').$defaultFn(() => 0).notNull(),
    credit: real('credit').$defaultFn(() => 0).notNull(),
    description: text('description'),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull()
});

export const payment = sqliteTable("payment", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    invoiceId: text('invoice_id').notNull().references(() => invoice.id, { onDelete: 'cascade' }),
    amount: real('amount').notNull(),
    paymentDate: integer('payment_date', { mode: 'timestamp' }).notNull(),
    method: text('method', { enum: ['bank_transfer', 'check', 'cash', 'card', 'other'] }).notNull(),
    reference: text('reference'), // Numéro de chèque, référence virement, etc.
    notes: text('notes'),
    companyId: text('company_id').notNull().references(() => company.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull()
});

export const fiscalYear = sqliteTable("fiscal_year", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(), // "Exercice 2024"
    startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
    endDate: integer('end_date', { mode: 'timestamp' }).notNull(),
    isClosed: integer('is_closed', { mode: 'boolean' }).$defaultFn(() => false).notNull(),
    companyId: text('company_id').notNull().references(() => company.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull()
});

// Tables pour les prestations/services
export const service = sqliteTable("service", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    description: text('description'),
    unitPrice: real('unit_price').notNull(),
    currency: text('currency').$defaultFn(() => 'EUR').notNull(),
    unit: text('unit', { enum: ['hour', 'day', 'piece', 'service', 'other'] }).$defaultFn(() => 'service').notNull(), // Unité de mesure
    taxRate: real('tax_rate').$defaultFn(() => 20).notNull(), // TVA par défaut
    isActive: integer('is_active', { mode: 'boolean' }).$defaultFn(() => true).notNull(),
    category: text('category'), // Catégorie de service (ex: "Développement", "Design", "Conseil")
    companyId: text('company_id').notNull().references(() => company.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull()
});

export const serviceCategory = sqliteTable("service_category", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    description: text('description'),
    color: text('color'), // Couleur pour l'affichage
    companyId: text('company_id').notNull().references(() => company.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull()
});

// Export du schéma complet pour Better Auth et Drizzle
export const schema = {
    user,
    session,
    account,
    verification,
    company,
    client,
    invoice,
    invoiceItem,
    template,
    userFavoriteTemplate,
    companyDefaultTemplate,
    billingPlan,
    subscription,
    quote,
    quoteItem,
    chartOfAccounts,
    journalEntry,
    journalEntryLine,
    payment,
    fiscalYear,
    service,
    serviceCategory,
};

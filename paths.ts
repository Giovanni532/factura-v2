export const paths = {
    // Pages principales
    home: "/",
    login: "/login",
    signup: "/signup",
    invitation: "/invitation",
    dashboard: "/dashboard",

    // Factures
    invoices: {
        list: "/dashboard/invoices",
        create: "/dashboard/invoices/create",
        view: (id: string) => `/dashboard/invoices/${id}`,
    },

    // Devis
    quotes: {
        list: "/dashboard/quotes",
        create: "/dashboard/quotes/create",
        view: (id: string) => `/dashboard/quotes/${id}`,
    },

    // Clients
    clients: {
        list: "/dashboard/clients",
        create: "/dashboard/clients/create",
        view: (id: string) => `/dashboard/clients/${id}`,
    },

    // Prestations/Services
    services: {
        list: "/dashboard/services",
        create: "/dashboard/services/create",
        edit: (id: string) => `/dashboard/services/${id}/edit`,
        categories: "/dashboard/services/categories",
        createCategory: "/dashboard/services/categories/create",
        editCategory: (id: string) => `/dashboard/services/categories/${id}/edit`,
    },

    // Templates de factures
    templates: {
        list: "/dashboard/templates",
        create: "/dashboard/templates/create",
        edit: (id: string) => `/dashboard/templates/${id}/edit`,
    },

    // Comptabilité
    accounting: {
        dashboard: "/dashboard/accounting",
        chartOfAccounts: "/dashboard/accounting/chart-of-accounts",
        journalEntries: "/dashboard/accounting/journal-entries",
        payments: "/dashboard/accounting/payments",
        reports: "/dashboard/accounting/reports",
        fiscalYears: "/dashboard/accounting/fiscal-years",
    },

    // Paramètres
    settings: {
        profile: "/dashboard/settings/profile",
        company: "/dashboard/settings/company",
        billing: "/dashboard/settings/billing",
        teams: "/dashboard/settings/teams",
    },
}
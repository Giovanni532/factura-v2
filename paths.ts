export const paths = {
    // Pages principales
    home: "/",
    login: "/login",
    signup: "/signup",
    dashboard: "/dashboard",

    // Factures
    invoices: {
        list: "/dashboard/invoices",
        create: "/dashboard/invoices/create",
        view: (id: string) => `/dashboard/invoices/${id}`,
    },

    // Clients
    clients: {
        list: "/dashboard/clients",
        create: "/dashboard/clients/create",
        view: (id: string) => `/dashboard/clients/${id}`,
    },

    // Templates de factures
    templates: {
        list: "/dashboard/templates",
        create: "/dashboard/templates/create",
        edit: (id: string) => `/dashboard/templates/${id}/edit`,
    },

    // Paramètres
    settings: {
        profile: "/dashboard/settings/profile",
        company: "/dashboard/settings/company",
        billing: "/dashboard/settings/billing",
    },
}
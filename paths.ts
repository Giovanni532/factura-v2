export const paths = {
    // Pages principales
    home: "/",
    login: "/login",
    signup: "/signup",
    dashboard: "/dashboard",

    // Factures
    invoices: {
        list: "/invoices",
        create: "/invoices/create",
        view: (id: string) => `/invoices/${id}`,
    },

    // Clients
    clients: {
        list: "/clients",
        create: "/clients/create",
        view: (id: string) => `/clients/${id}`,
    },

    // Templates de factures
    templates: {
        list: "/templates",
        create: "/templates/create",
        edit: (id: string) => `/templates/${id}/edit`,
    },

    // Paramètres
    settings: {
        profile: "/settings/profile",
        company: "/settings/company",
        billing: "/settings/billing",
    },
}
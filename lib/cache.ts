import { unstable_cache } from 'next/cache';
import { db } from './drizzle';
import { user, company, invoice, quote, client, service } from '@/db/schema';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';

// Cache pour les données utilisateur avec entreprise
export const getUserWithCompanyCached = unstable_cache(
    async (userId: string) => {
        const userData = await db.select({
            id: user.id,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
            image: user.image,
            role: user.role,
            companyId: user.companyId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            company: {
                id: company.id,
                name: company.name,
                address: company.address,
                city: company.city,
                postalCode: company.postalCode,
                country: company.country,
                phone: company.phone,
                email: company.email,
                logo: company.logo,
                siret: company.siret,
                vatNumber: company.vatNumber,
            }
        })
            .from(user)
            .leftJoin(company, eq(user.companyId, company.id))
            .where(eq(user.id, userId))
            .limit(1);

        return userData[0] || null;
    },
    ['user-with-company'],
    {
        revalidate: 300, // 5 minutes
        tags: ['user', 'company']
    }
);

// Cache pour les statistiques du dashboard
export const getDashboardStatsCached = unstable_cache(
    async (companyId: string) => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        const [invoiceStats, quoteStats, clientStats, serviceStats] = await Promise.all([
            db.select({
                totalInvoices: sql<number>`count(*)`,
                totalRevenue: sql<number>`sum(${invoice.total})`,
                paidInvoices: sql<number>`count(case when ${invoice.status} = 'paid' then 1 end)`,
                pendingInvoices: sql<number>`count(case when ${invoice.status} = 'sent' then 1 end)`,
                overdueInvoices: sql<number>`count(case when ${invoice.status} = 'sent' and ${invoice.dueDate} < date('now') then 1 end)`,
                monthlyInvoices: sql<number>`count(case when ${invoice.createdAt} >= ${startOfMonth} and ${invoice.createdAt} <= ${endOfMonth} then 1 end)`,
                monthlyRevenue: sql<number>`sum(case when ${invoice.createdAt} >= ${startOfMonth} and ${invoice.createdAt} <= ${endOfMonth} and ${invoice.status} = 'paid' then ${invoice.total} else 0 end)`,
                lastMonthRevenue: sql<number>`sum(case when ${invoice.createdAt} >= ${startOfLastMonth} and ${invoice.createdAt} <= ${endOfLastMonth} and ${invoice.status} = 'paid' then ${invoice.total} else 0 end)`,
                lastMonthInvoices: sql<number>`count(case when ${invoice.createdAt} >= ${startOfLastMonth} and ${invoice.createdAt} <= ${endOfLastMonth} then 1 end)`,
            }).from(invoice).where(eq(invoice.companyId, companyId)),

            db.select({
                totalQuotes: sql<number>`count(*)`,
                acceptedQuotes: sql<number>`count(case when ${quote.status} = 'accepted' then 1 end)`,
                pendingQuotes: sql<number>`count(case when ${quote.status} = 'sent' then 1 end)`,
                expiredQuotes: sql<number>`count(case when ${quote.status} = 'sent' and ${quote.validUntil} < date('now') then 1 end)`,
                monthlyQuotes: sql<number>`count(case when ${quote.createdAt} >= ${startOfMonth} and ${quote.createdAt} <= ${endOfMonth} then 1 end)`,
                lastMonthQuotes: sql<number>`count(case when ${quote.createdAt} >= ${startOfLastMonth} and ${quote.createdAt} <= ${endOfLastMonth} then 1 end)`,
            }).from(quote).where(eq(quote.companyId, companyId)),

            db.select({
                totalClients: sql<number>`count(*)`,
                activeClients: sql<number>`count(case when ${client.createdAt} >= date('now', '-30 days') then 1 end)`,
            }).from(client).where(eq(client.companyId, companyId)),

            db.select({
                totalServices: sql<number>`count(*)`,
                activeServices: sql<number>`count(case when ${service.isActive} = 1 then 1 end)`,
            }).from(service).where(eq(service.companyId, companyId))
        ]);

        return {
            invoices: {
                total: Number(invoiceStats[0]?.totalInvoices) || 0,
                revenue: Number(invoiceStats[0]?.totalRevenue) || 0,
                paid: Number(invoiceStats[0]?.paidInvoices) || 0,
                pending: Number(invoiceStats[0]?.pendingInvoices) || 0,
                overdue: Number(invoiceStats[0]?.overdueInvoices) || 0,
                monthly: Number(invoiceStats[0]?.monthlyInvoices) || 0,
                monthlyRevenue: Number(invoiceStats[0]?.monthlyRevenue) || 0,
                lastMonthRevenue: Number(invoiceStats[0]?.lastMonthRevenue) || 0,
                lastMonthInvoices: Number(invoiceStats[0]?.lastMonthInvoices) || 0,
            },
            quotes: {
                total: Number(quoteStats[0]?.totalQuotes) || 0,
                accepted: Number(quoteStats[0]?.acceptedQuotes) || 0,
                pending: Number(quoteStats[0]?.pendingQuotes) || 0,
                expired: Number(quoteStats[0]?.expiredQuotes) || 0,
                monthly: Number(quoteStats[0]?.monthlyQuotes) || 0,
                lastMonthQuotes: Number(quoteStats[0]?.lastMonthQuotes) || 0,
            },
            clients: {
                total: Number(clientStats[0]?.totalClients) || 0,
                active: Number(clientStats[0]?.activeClients) || 0,
            },
            services: {
                total: Number(serviceStats[0]?.totalServices) || 0,
                active: Number(serviceStats[0]?.activeServices) || 0,
            },
        };
    },
    ['dashboard-stats'],
    {
        revalidate: 60, // 1 minute
        tags: ['dashboard', 'stats']
    }
);

// Cache pour les graphiques du dashboard
export const getDashboardChartsCached = unstable_cache(
    async (companyId: string) => {
        const [monthlyInvoices, monthlyQuotes, monthlyBenefits] = await Promise.all([
            db.select({
                month: sql<string>`strftime('%Y-%m', ${invoice.createdAt})`,
                count: sql<number>`count(*)`,
                revenue: sql<number>`sum(case when ${invoice.status} = 'paid' then ${invoice.total} else 0 end)`,
            })
                .from(invoice)
                .where(and(
                    eq(invoice.companyId, companyId),
                    gte(invoice.createdAt, new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1))
                ))
                .groupBy(sql`strftime('%Y-%m', ${invoice.createdAt})`)
                .orderBy(sql`strftime('%Y-%m', ${invoice.createdAt})`),

            db.select({
                month: sql<string>`strftime('%Y-%m', ${quote.createdAt})`,
                count: sql<number>`count(*)`,
                accepted: sql<number>`count(case when ${quote.status} = 'accepted' then 1 end)`,
            })
                .from(quote)
                .where(and(
                    eq(quote.companyId, companyId),
                    gte(quote.createdAt, new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1))
                ))
                .groupBy(sql`strftime('%Y-%m', ${quote.createdAt})`)
                .orderBy(sql`strftime('%Y-%m', ${quote.createdAt})`),

            db.select({
                month: sql<string>`strftime('%Y-%m', ${invoice.createdAt})`,
                benefice: sql<number>`sum(case when ${invoice.status} = 'paid' then ${invoice.total} else 0 end)`,
            })
                .from(invoice)
                .where(and(
                    eq(invoice.companyId, companyId),
                    gte(invoice.createdAt, new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1))
                ))
                .groupBy(sql`strftime('%Y-%m', ${invoice.createdAt})`)
                .orderBy(sql`strftime('%Y-%m', ${invoice.createdAt})`)
        ]);

        return {
            monthlyInvoices: monthlyInvoices.map(item => ({
                month: item.month,
                invoices: Number(item.count) || 0,
                revenue: Number(item.revenue) || 0,
            })),
            monthlyQuotes: monthlyQuotes.map(item => ({
                month: item.month,
                quotes: Number(item.count) || 0,
                accepted: Number(item.accepted) || 0,
            })),
            monthlyBenefits: monthlyBenefits.map(item => ({
                month: item.month,
                benefice: Number(item.benefice) || 0,
            })),
        };
    },
    ['dashboard-charts'],
    {
        revalidate: 300, // 5 minutes
        tags: ['dashboard', 'charts']
    }
);

// Cache pour les échéances
export const getUpcomingDeadlinesCached = unstable_cache(
    async (companyId: string) => {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const [upcomingInvoices, upcomingQuotes] = await Promise.all([
            db.select({
                id: invoice.id,
                number: invoice.number,
                dueDate: invoice.dueDate,
                status: invoice.status,
                total: invoice.total,
                clientName: sql<string>`${client.name}`,
            })
                .from(invoice)
                .leftJoin(client, eq(invoice.clientId, client.id))
                .where(and(
                    eq(invoice.companyId, companyId),
                    eq(invoice.status, 'sent'),
                    gte(invoice.dueDate, new Date()),
                    lte(invoice.dueDate, thirtyDaysFromNow)
                ))
                .orderBy(invoice.dueDate)
                .limit(10),

            db.select({
                id: quote.id,
                number: quote.number,
                validUntil: quote.validUntil,
                status: quote.status,
                total: quote.total,
                clientName: sql<string>`${client.name}`,
            })
                .from(quote)
                .leftJoin(client, eq(quote.clientId, client.id))
                .where(and(
                    eq(quote.companyId, companyId),
                    eq(quote.status, 'sent'),
                    gte(quote.validUntil, new Date()),
                    lte(quote.validUntil, thirtyDaysFromNow)
                ))
                .orderBy(quote.validUntil)
                .limit(10)
        ]);

        return {
            invoices: upcomingInvoices.map(inv => ({
                id: inv.id,
                number: inv.number,
                dueDate: inv.dueDate,
                status: inv.status,
                total: Number(inv.total) || 0,
                clientName: inv.clientName || 'Client inconnu',
                daysLeft: Math.ceil((new Date(inv.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
            })),
            quotes: upcomingQuotes.map(quote => ({
                id: quote.id,
                number: quote.number,
                validUntil: quote.validUntil,
                status: quote.status,
                total: Number(quote.total) || 0,
                clientName: quote.clientName || 'Client inconnu',
                daysLeft: Math.ceil((new Date(quote.validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
            })),
        };
    },
    ['upcoming-deadlines'],
    {
        revalidate: 300, // 5 minutes
        tags: ['deadlines']
    }
);

// Cache pour les limites d'abonnement
export const getSubscriptionLimitsCached = unstable_cache(
    async (companyId: string) => {
        const { getSubscriptionLimits } = await import('@/db/queries/subscription');
        return await getSubscriptionLimits(companyId);
    },
    ['subscription-limits'],
    {
        revalidate: 3600, // 1 heure
        tags: ['subscription']
    }
);

// Cache pour les factures avec filtres
export const getInvoicesByCompanyCached = unstable_cache(
    async (companyId: string, filters: { search?: string; status?: string; clientId?: string }) => {
        const { getInvoicesByCompany } = await import('@/db/queries/invoice');
        return await getInvoicesByCompany(companyId, filters);
    },
    ['invoices-by-company'],
    {
        revalidate: 30, // 30 secondes
        tags: ['invoices']
    }
);

// Cache pour les statistiques de factures
export const getInvoiceStatsCached = unstable_cache(
    async (companyId: string, clientId?: string) => {
        const { getInvoiceStats } = await import('@/db/queries/invoice');
        return await getInvoiceStats(companyId, clientId);
    },
    ['invoice-stats'],
    {
        revalidate: 60, // 1 minute
        tags: ['invoices', 'stats']
    }
);

// Cache pour les devis avec filtres
export const getQuotesByCompanyCached = unstable_cache(
    async (companyId: string, filters: { search?: string; status?: string; clientId?: string }) => {
        const { getQuotesByCompany } = await import('@/db/queries/quote');
        return await getQuotesByCompany(companyId, filters);
    },
    ['quotes-by-company'],
    {
        revalidate: 30, // 30 secondes
        tags: ['quotes']
    }
);

// Cache pour les statistiques de devis
export const getQuoteStatsCached = unstable_cache(
    async (companyId: string, clientId?: string) => {
        const { getQuoteStats } = await import('@/db/queries/quote');
        return await getQuoteStats(companyId, clientId);
    },
    ['quote-stats'],
    {
        revalidate: 60, // 1 minute
        tags: ['quotes', 'stats']
    }
);

// Cache pour les clients avec statistiques
export const getClientsWithStatsCached = unstable_cache(
    async (companyId: string) => {
        const { getClientsWithStats } = await import('@/db/queries/client');
        return await getClientsWithStats(companyId);
    },
    ['clients-with-stats'],
    {
        revalidate: 60, // 1 minute
        tags: ['clients']
    }
);

// Cache pour les services avec statistiques
export const getServicesByCompanyCached = unstable_cache(
    async (companyId: string) => {
        const { getServicesWithStats } = await import('@/db/queries/service');
        return await getServicesWithStats(companyId);
    },
    ['services-by-company'],
    {
        revalidate: 60, // 1 minute
        tags: ['services']
    }
);

// Cache pour les catégories de services
export const getServiceCategoriesCached = unstable_cache(
    async (companyId: string) => {
        const { getServiceCategoriesWithStats } = await import('@/db/queries/service');
        return await getServiceCategoriesWithStats(companyId);
    },
    ['service-categories'],
    {
        revalidate: 60, // 1 minute
        tags: ['services']
    }
);

// Cache pour les templates avec favoris
export const getTemplatesByCompanyCached = unstable_cache(
    async (userId: string, companyId: string) => {
        const { getAllTemplatesWithFavorites } = await import('@/db/queries/template');
        return await getAllTemplatesWithFavorites(userId, companyId);
    },
    ['templates-by-company'],
    {
        revalidate: 300, // 5 minutes
        tags: ['templates']
    }
);

// Cache pour les données de formulaire
export const getFormDataCached = unstable_cache(
    async (type: 'invoices' | 'quotes', headers: Headers) => {
        try {
            const response = await fetch(`${process.env.BETTER_AUTH_URL}/api/${type}/form-data`, {
                headers: {
                    'Cookie': headers.get('cookie') || '',
                },
            });

            if (response.ok) {
                return await response.json();
            }
            return null;
        } catch (error) {
            console.error(`Erreur lors de la récupération des données du formulaire ${type}:`, error);
            return null;
        }
    },
    ['form-data'],
    {
        revalidate: 300, // 5 minutes
        tags: ['form-data']
    }
);

// Fonction pour invalider le cache
export const revalidateCache = {
    user: () => fetch('/api/revalidate?tag=user'),
    company: () => fetch('/api/revalidate?tag=company'),
    dashboard: () => fetch('/api/revalidate?tag=dashboard'),
    stats: () => fetch('/api/revalidate?tag=stats'),
    charts: () => fetch('/api/revalidate?tag=charts'),
    deadlines: () => fetch('/api/revalidate?tag=deadlines'),
    subscription: () => fetch('/api/revalidate?tag=subscription'),
}; 
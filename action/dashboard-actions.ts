"use server"

import { useMutation } from "@/lib/safe-action";
import { z } from "zod";
import { db } from "@/lib/drizzle";
import { user, company, invoice, quote, client, service, invoiceItem } from "@/db/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";

// Action pour récupérer les statistiques de la dashboard
export const getDashboardStatsAction = useMutation(
    z.object({}),
    async (input, { userId }) => {
        // Vérifier que l'utilisateur appartient à une entreprise
        const userData = await db.select().from(user).where(eq(user.id, userId)).limit(1);

        if (!userData.length || !userData[0].companyId) {
            throw new Error("Utilisateur non associé à une entreprise");
        }

        const companyId = userData[0].companyId;

        // Date de début du mois en cours
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Statistiques des factures
        const invoiceStats = await db.select({
            totalInvoices: sql<number>`count(*)`,
            totalRevenue: sql<number>`sum(${invoice.total})`,
            paidInvoices: sql<number>`count(case when ${invoice.status} = 'paid' then 1 end)`,
            pendingInvoices: sql<number>`count(case when ${invoice.status} = 'sent' then 1 end)`,
            overdueInvoices: sql<number>`count(case when ${invoice.status} = 'sent' and ${invoice.dueDate} < date('now') then 1 end)`,
            monthlyInvoices: sql<number>`count(case when ${invoice.createdAt} >= ${startOfMonth} and ${invoice.createdAt} <= ${endOfMonth} then 1 end)`,
            monthlyRevenue: sql<number>`sum(case when ${invoice.createdAt} >= ${startOfMonth} and ${invoice.createdAt} <= ${endOfMonth} and ${invoice.status} = 'paid' then ${invoice.total} else 0 end)`,
        })
            .from(invoice)
            .where(eq(invoice.companyId, companyId));

        // Statistiques des devis
        const quoteStats = await db.select({
            totalQuotes: sql<number>`count(*)`,
            acceptedQuotes: sql<number>`count(case when ${quote.status} = 'accepted' then 1 end)`,
            pendingQuotes: sql<number>`count(case when ${quote.status} = 'sent' then 1 end)`,
            expiredQuotes: sql<number>`count(case when ${quote.status} = 'sent' and ${quote.validUntil} < date('now') then 1 end)`,
            monthlyQuotes: sql<number>`count(case when ${quote.createdAt} >= ${startOfMonth} and ${quote.createdAt} <= ${endOfMonth} then 1 end)`,
        })
            .from(quote)
            .where(eq(quote.companyId, companyId));

        // Statistiques des clients
        const clientStats = await db.select({
            totalClients: sql<number>`count(*)`,
            activeClients: sql<number>`count(case when ${client.createdAt} >= date('now', '-30 days') then 1 end)`,
        })
            .from(client)
            .where(eq(client.companyId, companyId));

        // Statistiques des services
        const serviceStats = await db.select({
            totalServices: sql<number>`count(*)`,
            activeServices: sql<number>`count(case when ${service.isActive} = 1 then 1 end)`,
        })
            .from(service)
            .where(eq(service.companyId, companyId));

        return {
            success: true,
            stats: {
                invoices: {
                    total: Number(invoiceStats[0]?.totalInvoices) || 0,
                    revenue: Number(invoiceStats[0]?.totalRevenue) || 0,
                    paid: Number(invoiceStats[0]?.paidInvoices) || 0,
                    pending: Number(invoiceStats[0]?.pendingInvoices) || 0,
                    overdue: Number(invoiceStats[0]?.overdueInvoices) || 0,
                    monthly: Number(invoiceStats[0]?.monthlyInvoices) || 0,
                    monthlyRevenue: Number(invoiceStats[0]?.monthlyRevenue) || 0,
                },
                quotes: {
                    total: Number(quoteStats[0]?.totalQuotes) || 0,
                    accepted: Number(quoteStats[0]?.acceptedQuotes) || 0,
                    pending: Number(quoteStats[0]?.pendingQuotes) || 0,
                    expired: Number(quoteStats[0]?.expiredQuotes) || 0,
                    monthly: Number(quoteStats[0]?.monthlyQuotes) || 0,
                },
                clients: {
                    total: Number(clientStats[0]?.totalClients) || 0,
                    active: Number(clientStats[0]?.activeClients) || 0,
                },
                services: {
                    total: Number(serviceStats[0]?.totalServices) || 0,
                    active: Number(serviceStats[0]?.activeServices) || 0,
                },
            }
        };
    }
);

// Action pour récupérer les données des graphiques
export const getDashboardChartsAction = useMutation(
    z.object({}),
    async (input, { userId }) => {
        // Vérifier que l'utilisateur appartient à une entreprise
        const userData = await db.select().from(user).where(eq(user.id, userId)).limit(1);

        if (!userData.length || !userData[0].companyId) {
            throw new Error("Utilisateur non associé à une entreprise");
        }

        const companyId = userData[0].companyId;

        // Données des 6 derniers mois pour les factures
        const monthlyInvoices = await db.select({
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
            .orderBy(sql`strftime('%Y-%m', ${invoice.createdAt})`);

        // Données des 6 derniers mois pour les devis
        const monthlyQuotes = await db.select({
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
            .orderBy(sql`strftime('%Y-%m', ${quote.createdAt})`);

        // Données des services les plus utilisés (basé sur les descriptions des items)
        const topServices = await db.select({
            name: sql<string>`${invoiceItem.description}`,
            count: sql<number>`count(*)`,
            revenue: sql<number>`sum(${invoiceItem.total})`,
        })
            .from(invoiceItem)
            .leftJoin(invoice, eq(invoiceItem.invoiceId, invoice.id))
            .where(eq(invoice.companyId, companyId))
            .groupBy(sql`${invoiceItem.description}`)
            .orderBy(desc(sql`count(*)`))
            .limit(5);

        return {
            success: true,
            charts: {
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
                topServices: topServices.map(item => ({
                    name: item.name || 'Service inconnu',
                    count: Number(item.count) || 0,
                    revenue: Number(item.revenue) || 0,
                })),
            }
        };
    }
);

// Action pour récupérer les factures et devis arrivant à échéance
export const getUpcomingDeadlinesAction = useMutation(
    z.object({}),
    async (input, { userId }) => {
        // Vérifier que l'utilisateur appartient à une entreprise
        const userData = await db.select().from(user).where(eq(user.id, userId)).limit(1);

        if (!userData.length || !userData[0].companyId) {
            throw new Error("Utilisateur non associé à une entreprise");
        }

        const companyId = userData[0].companyId;

        // Date limite (30 jours)
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        // Factures arrivant à échéance
        const upcomingInvoices = await db.select({
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
            .limit(10);

        // Devis arrivant à expiration
        const upcomingQuotes = await db.select({
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
            .limit(10);

        return {
            success: true,
            deadlines: {
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
            }
        };
    }
); 
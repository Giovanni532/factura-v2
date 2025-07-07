"use server"

import React from 'react';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserWithCompany } from '@/db/queries/company';
import { CreateCompanyForm } from '@/components/forms/create-company-form';
import { paths } from '@/paths';
import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { db } from '@/lib/drizzle';
import { user, company, invoice, quote, client, service, invoiceItem } from '@/db/schema';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';

// Fonction pour récupérer les statistiques
async function getDashboardStats(userId: string) {
    const userData = await db.select().from(user).where(eq(user.id, userId)).limit(1);
    if (!userData.length || !userData[0].companyId) return null;

    const companyId = userData[0].companyId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Mois précédent
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const invoiceStats = await db.select({
        totalInvoices: sql<number>`count(*)`,
        totalRevenue: sql<number>`sum(${invoice.total})`,
        paidInvoices: sql<number>`count(case when ${invoice.status} = 'paid' then 1 end)`,
        pendingInvoices: sql<number>`count(case when ${invoice.status} = 'sent' then 1 end)`,
        overdueInvoices: sql<number>`count(case when ${invoice.status} = 'sent' and ${invoice.dueDate} < date('now') then 1 end)`,
        monthlyInvoices: sql<number>`count(case when ${invoice.createdAt} >= ${startOfMonth} and ${invoice.createdAt} <= ${endOfMonth} then 1 end)`,
        monthlyRevenue: sql<number>`sum(case when ${invoice.createdAt} >= ${startOfMonth} and ${invoice.createdAt} <= ${endOfMonth} and ${invoice.status} = 'paid' then ${invoice.total} else 0 end)`,
        lastMonthRevenue: sql<number>`sum(case when ${invoice.createdAt} >= ${startOfLastMonth} and ${invoice.createdAt} <= ${endOfLastMonth} and ${invoice.status} = 'paid' then ${invoice.total} else 0 end)`,
        lastMonthInvoices: sql<number>`count(case when ${invoice.createdAt} >= ${startOfLastMonth} and ${invoice.createdAt} <= ${endOfLastMonth} then 1 end)`,
    })
        .from(invoice)
        .where(eq(invoice.companyId, companyId));

    const quoteStats = await db.select({
        totalQuotes: sql<number>`count(*)`,
        acceptedQuotes: sql<number>`count(case when ${quote.status} = 'accepted' then 1 end)`,
        pendingQuotes: sql<number>`count(case when ${quote.status} = 'sent' then 1 end)`,
        expiredQuotes: sql<number>`count(case when ${quote.status} = 'sent' and ${quote.validUntil} < date('now') then 1 end)`,
        monthlyQuotes: sql<number>`count(case when ${quote.createdAt} >= ${startOfMonth} and ${quote.createdAt} <= ${endOfMonth} then 1 end)`,
        lastMonthQuotes: sql<number>`count(case when ${quote.createdAt} >= ${startOfLastMonth} and ${quote.createdAt} <= ${endOfLastMonth} then 1 end)`,
    })
        .from(quote)
        .where(eq(quote.companyId, companyId));

    const clientStats = await db.select({
        totalClients: sql<number>`count(*)`,
        activeClients: sql<number>`count(case when ${client.createdAt} >= date('now', '-30 days') then 1 end)`,
    })
        .from(client)
        .where(eq(client.companyId, companyId));

    const serviceStats = await db.select({
        totalServices: sql<number>`count(*)`,
        activeServices: sql<number>`count(case when ${service.isActive} = 1 then 1 end)`,
    })
        .from(service)
        .where(eq(service.companyId, companyId));

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
}

// Fonction pour récupérer les données des graphiques
async function getDashboardCharts(userId: string) {
    const userData = await db.select().from(user).where(eq(user.id, userId)).limit(1);
    if (!userData.length || !userData[0].companyId) return null;

    const companyId = userData[0].companyId;

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

    // Calcul des bénéfices mensuels (revenus des factures payées)
    const monthlyBenefits = await db.select({
        month: sql<string>`strftime('%Y-%m', ${invoice.createdAt})`,
        benefice: sql<number>`sum(case when ${invoice.status} = 'paid' then ${invoice.total} else 0 end)`,
    })
        .from(invoice)
        .where(and(
            eq(invoice.companyId, companyId),
            gte(invoice.createdAt, new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1))
        ))
        .groupBy(sql`strftime('%Y-%m', ${invoice.createdAt})`)
        .orderBy(sql`strftime('%Y-%m', ${invoice.createdAt})`);

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
}

// Fonction pour récupérer les échéances
async function getUpcomingDeadlines(userId: string) {
    const userData = await db.select().from(user).where(eq(user.id, userId)).limit(1);
    if (!userData.length || !userData[0].companyId) return null;

    const companyId = userData[0].companyId;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

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
}

export default async function DashboardPage() {
    // Récupérer la session utilisateur côté serveur
    const session = await auth.api.getSession({
        headers: await headers()
    });

    // Rediriger vers la page de connexion si non connecté
    if (!session?.user) {
        redirect(paths.login);
    }

    // Récupérer les données utilisateur avec sa compagnie
    const userWithCompany = await getUserWithCompany(session.user.id);

    // Si l'utilisateur n'a pas de compagnie, afficher le formulaire de création
    if (!userWithCompany?.company) {
        return (
            <div className="min-h-screen bg-background">
                {/* Header */}
                <div className="border-b border-border bg-background/80 backdrop-blur-sm">
                    <div className="container mx-auto px-4 py-8">
                        <div className="text-center max-w-3xl mx-auto">
                            <h1 className="text-4xl font-bold text-foreground mb-3">
                                Bienvenue, {session.user.name} !
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                Pour commencer à utiliser l&apos;application de facturation,
                                veuillez créer votre entreprise en remplissant le formulaire ci-dessous.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Formulaire */}
                <div className="container mx-auto px-4 py-12">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold text-foreground mb-2">
                                Créer votre entreprise
                            </h2>
                            <p className="text-muted-foreground">
                                Renseignez les informations de votre entreprise pour personnaliser vos factures.
                            </p>
                        </div>
                        <CreateCompanyForm />
                    </div>
                </div>
            </div>
        );
    }

    // Récupérer les données de la dashboard côté serveur
    const stats = await getDashboardStats(session.user.id);
    const charts = await getDashboardCharts(session.user.id);
    const deadlines = await getUpcomingDeadlines(session.user.id);

    const dashboardData = {
        stats,
        charts,
        deadlines,
    };

    // Si l'utilisateur a une compagnie, afficher le tableau de bord
    return (
        <div className="min-h-screen bg-background">
            {/* Header avec informations de l'entreprise */}
            <div className="border-b border-border bg-background/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">
                                Bienvenue, {userWithCompany.user.name} !
                            </h1>
                            <p className="text-muted-foreground">
                                Tableau de bord de facturation
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container mx-auto px-4 py-8">
                <DashboardClient initialData={dashboardData} />
            </div>
        </div>
    );
}

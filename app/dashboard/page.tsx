"use server"

import React from 'react';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserWithCompanyCached, getDashboardStatsCached, getDashboardChartsCached, getUpcomingDeadlinesCached } from '@/lib/cache';
import { CreateCompanyForm } from '@/components/forms/create-company-form';
import { paths } from '@/paths';
import { DashboardClient } from '@/components/dashboard/dashboard-client';



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
    const userWithCompany = await getUserWithCompanyCached(session.user.id);

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

    // Récupérer les données de la dashboard côté serveur avec cache
    const stats = await getDashboardStatsCached(userWithCompany.company.id);
    const charts = await getDashboardChartsCached(userWithCompany.company.id);
    const deadlines = await getUpcomingDeadlinesCached(userWithCompany.company.id);

    // Correction : transformer les dates string en objets Date
    const deadlinesFixed = {
        ...deadlines,
        invoices: deadlines?.invoices?.map(inv => ({
            ...inv,
            dueDate: inv.dueDate ? new Date(inv.dueDate) : null,
        })) ?? [],
        quotes: deadlines?.quotes?.map(q => ({
            ...q,
            validUntil: q.validUntil ? new Date(q.validUntil) : null,
        })) ?? [],
    };

    const dashboardData = {
        stats,
        charts,
        deadlines: deadlinesFixed,
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
                                Bienvenue, {userWithCompany.name} !
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

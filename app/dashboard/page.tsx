"use server"

import React from 'react';
import { getSession } from '@/lib/get-session';
import { redirect } from 'next/navigation';
import { getUserWithCompanyCached, getDashboardStatsCached, getDashboardChartsCached, getUpcomingDeadlinesCached } from '@/lib/cache';
import { CreateCompanyForm } from '@/components/forms/create-company-form';
import { paths } from '@/paths';
import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';



export default async function DashboardPage() {
    // Récupérer la session utilisateur côté serveur
    const session = await getSession();

    // Rediriger vers la page de connexion si non connecté
    if (!session?.user) {
        redirect(paths.login);
    }

    // Récupérer les données utilisateur avec sa compagnie
    const userWithCompany = await getUserWithCompanyCached(session.user.id);

    // Si l'utilisateur n'a pas de compagnie, afficher le formulaire de création
    if (!userWithCompany?.company) {
        return (
            <div className="mx-auto max-w-4xl py-6 md:py-10">
                <p className="ledger-label">Première étape</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
                    Bienvenue, {session.user.name.split(" ")[0]}.
                </h1>
                <p className="mt-3 max-w-2xl text-muted-foreground">
                    Ouvrons votre registre : renseignez votre entreprise. Ces informations apparaîtront
                    sur vos factures et vos devis.
                </p>
                <div className="mt-10 border-t pt-10">
                    <CreateCompanyForm />
                </div>
            </div>
        );
    }

    // Récupérer les données de la dashboard côté serveur avec cache (en parallèle)
    const [stats, charts, deadlines] = await Promise.all([
        getDashboardStatsCached(userWithCompany.company.id),
        getDashboardChartsCached(userWithCompany.company.id),
        getUpcomingDeadlinesCached(userWithCompany.company.id),
    ]);

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
    const today = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
    const firstName = (userWithCompany.name || session.user.name).split(" ")[0];

    return (
        <div className="space-y-8">
            <header className="flex flex-col gap-5 border-b pb-6 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="ledger-label">
                        {today} · {userWithCompany.company.name}
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">Bonjour, {firstName}</h1>
                    <p className="mt-1 text-muted-foreground">Voici l&apos;état de vos comptes aujourd&apos;hui.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline">
                        <Link href={`${paths.quotes.list}?new=true`}>Nouveau devis</Link>
                    </Button>
                    <Button asChild>
                        <Link href={`${paths.invoices.list}?new=true`}>
                            <Plus />
                            Nouvelle facture
                        </Link>
                    </Button>
                </div>
            </header>
            <DashboardClient initialData={dashboardData} />
        </div>
    );
}

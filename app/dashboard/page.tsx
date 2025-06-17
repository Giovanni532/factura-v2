"use server"

import React from 'react';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserWithCompany } from '@/db/queries/company';
import { CreateCompanyForm } from '@/components/forms/create-company-form';
import { CompanyLogoUpload } from '@/components/forms/company-logo-upload';

export default async function DashboardPage() {
    // Récupérer la session utilisateur côté serveur
    const session = await auth.api.getSession({
        headers: await headers()
    });

    // Rediriger vers la page de connexion si non connecté
    if (!session?.user) {
        redirect('/api/auth/signin');
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
                                Pour commencer à utiliser l'application de facturation,
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

    // Si l'utilisateur a une compagnie, afficher le tableau de bord
    return (
        <div className="min-h-screen bg-background">
            {/* Header avec informations de l'entreprise */}
            <div className="border-b border-border bg-background/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">
                                Bienvenue, {userWithCompany.company.name} !
                            </h1>
                            <p className="text-muted-foreground">
                                Tableau de bord de facturation
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                Entreprise configurée
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenu principal */}
            <div className="container mx-auto px-4 py-8">
                {/* Informations de l'entreprise */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-semibold text-foreground">
                            Informations de l'entreprise
                        </h2>
                        <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Modifier
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Logo de l'entreprise */}
                        <div className="md:col-span-2 lg:col-span-1">
                            <CompanyLogoUpload
                                currentLogo={userWithCompany.company.logo || undefined}
                            />
                        </div>
                        {/* Informations générales */}
                        <div className="space-y-4">
                            <h3 className="font-medium text-foreground border-b border-border pb-2">
                                Informations générales
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-sm text-muted-foreground">Nom de l'entreprise</span>
                                    <p className="font-medium text-foreground">{userWithCompany.company.name}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Email</span>
                                    <p className="font-medium text-foreground">{userWithCompany.company.email}</p>
                                </div>
                                {userWithCompany.company.phone && (
                                    <div>
                                        <span className="text-sm text-muted-foreground">Téléphone</span>
                                        <p className="font-medium text-foreground">{userWithCompany.company.phone}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Adresse */}
                        <div className="space-y-4">
                            <h3 className="font-medium text-foreground border-b border-border pb-2">
                                Adresse
                            </h3>
                            <div className="space-y-3">
                                {userWithCompany.company.address && (
                                    <div>
                                        <span className="text-sm text-muted-foreground">Adresse</span>
                                        <p className="font-medium text-foreground">{userWithCompany.company.address}</p>
                                    </div>
                                )}
                                <div className="flex gap-4">
                                    {userWithCompany.company.city && (
                                        <div>
                                            <span className="text-sm text-muted-foreground">Ville</span>
                                            <p className="font-medium text-foreground">{userWithCompany.company.city}</p>
                                        </div>
                                    )}
                                    {userWithCompany.company.postalCode && (
                                        <div>
                                            <span className="text-sm text-muted-foreground">Code postal</span>
                                            <p className="font-medium text-foreground">{userWithCompany.company.postalCode}</p>
                                        </div>
                                    )}
                                </div>
                                {userWithCompany.company.country && (
                                    <div>
                                        <span className="text-sm text-muted-foreground">Pays</span>
                                        <p className="font-medium text-foreground">{userWithCompany.company.country}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Informations fiscales */}
                        <div className="space-y-4">
                            <h3 className="font-medium text-foreground border-b border-border pb-2">
                                Informations fiscales
                            </h3>
                            <div className="space-y-3">
                                {userWithCompany.company.siret && (
                                    <div>
                                        <span className="text-sm text-muted-foreground">SIRET</span>
                                        <p className="font-medium text-foreground">{userWithCompany.company.siret}</p>
                                    </div>
                                )}
                                {userWithCompany.company.vatNumber && (
                                    <div>
                                        <span className="text-sm text-muted-foreground">Numéro de TVA</span>
                                        <p className="font-medium text-foreground">{userWithCompany.company.vatNumber}</p>
                                    </div>
                                )}
                                {!userWithCompany.company.siret && !userWithCompany.company.vatNumber && (
                                    <p className="text-sm text-muted-foreground italic">
                                        Aucune information fiscale renseignée
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions rapides */}
                <div className="mb-12">
                    <h2 className="text-2xl font-semibold text-foreground mb-6">
                        Actions rapides
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button className="p-6 text-left border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors">
                            <div className="text-lg font-medium text-foreground mb-2">Nouvelle facture</div>
                            <p className="text-sm text-muted-foreground">Créer une nouvelle facture</p>
                        </button>
                        <button className="p-6 text-left border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors">
                            <div className="text-lg font-medium text-foreground mb-2">Nouveau client</div>
                            <p className="text-sm text-muted-foreground">Ajouter un client</p>
                        </button>
                        <button className="p-6 text-left border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors">
                            <div className="text-lg font-medium text-foreground mb-2">Modèles</div>
                            <p className="text-sm text-muted-foreground">Gérer les modèles de factures</p>
                        </button>
                        <button className="p-6 text-left border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors">
                            <div className="text-lg font-medium text-foreground mb-2">Paramètres</div>
                            <p className="text-sm text-muted-foreground">Configurer l'application</p>
                        </button>
                    </div>
                </div>

                {/* Aperçu des statistiques */}
                <div>
                    <h2 className="text-2xl font-semibold text-foreground mb-6">
                        Aperçu
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 border border-border rounded-lg">
                            <div className="text-2xl font-bold text-foreground mb-1">0</div>
                            <div className="text-sm text-muted-foreground">Factures ce mois</div>
                        </div>
                        <div className="p-6 border border-border rounded-lg">
                            <div className="text-2xl font-bold text-foreground mb-1">0</div>
                            <div className="text-sm text-muted-foreground">Clients actifs</div>
                        </div>
                        <div className="p-6 border border-border rounded-lg">
                            <div className="text-2xl font-bold text-foreground mb-1">0 €</div>
                            <div className="text-sm text-muted-foreground">Chiffre d'affaires</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

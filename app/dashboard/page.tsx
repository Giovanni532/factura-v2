"use server"

import React from 'react';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserWithCompany } from '@/queries/company';
import { CreateCompanyForm } from '@/components/forms/create-company-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
            <div className="container mx-auto py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Bienvenue, {session.user.name}!
                        </h1>
                        <p className="text-gray-600">
                            Pour commencer à utiliser l'application, veuillez créer votre entreprise.
                        </p>
                    </div>
                    <CreateCompanyForm />
                </div>
            </div>
        );
    }

    // Si l'utilisateur a une compagnie, afficher le message de bienvenue
    return (
        <div className="container mx-auto py-8">
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">
                            Bienvenue, {userWithCompany.company.name}!
                        </CardTitle>
                        <CardDescription>
                            Voici votre tableau de bord de facturation
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Informations de l'entreprise</h3>
                                <div className="space-y-2 text-sm">
                                    <p><span className="font-medium">Nom:</span> {userWithCompany.company.name}</p>
                                    <p><span className="font-medium">Email:</span> {userWithCompany.company.email}</p>
                                    {userWithCompany.company.phone && (
                                        <p><span className="font-medium">Téléphone:</span> {userWithCompany.company.phone}</p>
                                    )}
                                    {userWithCompany.company.siret && (
                                        <p><span className="font-medium">SIRET:</span> {userWithCompany.company.siret}</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Actions rapides</h3>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600">
                                        Vous pouvez maintenant commencer à utiliser l'application de facturation.
                                    </p>
                                    {/* Ici vous pourrez ajouter des liens vers les autres fonctionnalités */}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

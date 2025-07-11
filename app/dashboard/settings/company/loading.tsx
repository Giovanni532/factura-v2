"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Users, Shield } from "lucide-react";

export default function CompanySettingsLoading() {
    return (
        <div className="space-y-6">
            {/* En-tête de la page */}
            <div>
                <Skeleton className="h-8 w-80 mb-2" />
                <Skeleton className="h-4 w-96" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Colonne gauche : Informations de l'entreprise (2/3) */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Informations générales */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Informations de l&apos;entreprise
                            </CardTitle>
                            <CardDescription>
                                Gérez les informations de votre entreprise
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2 space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-12" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-12" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Skeleton className="h-10 w-40" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Colonne droite : Logo, abonnement et membres */}
                <div className="space-y-3">
                    {/* Logo de l'entreprise */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Logo de l&apos;entreprise</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center space-y-4">
                            <Skeleton className="h-24 w-24 rounded-full" />
                            <div className="flex gap-2">
                                <Skeleton className="h-9 w-20" />
                                <Skeleton className="h-9 w-20" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Abonnement */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Shield className="h-5 w-5" />
                                Abonnement
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-6 w-16" />
                            </div>
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-12" />
                            </div>
                            <Skeleton className="h-2 w-full rounded-full" />
                        </CardContent>
                    </Card>

                    {/* Membres de l'équipe */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    <CardTitle className="text-lg">Membres de l&apos;équipe</CardTitle>
                                </div>
                                <Skeleton className="h-9 w-20" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Skeleton className="h-4 w-24" />
                                                <Skeleton className="h-5 w-20" />
                                            </div>
                                            <Skeleton className="h-3 w-32 mb-1" />
                                            <Skeleton className="h-3 w-28" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 
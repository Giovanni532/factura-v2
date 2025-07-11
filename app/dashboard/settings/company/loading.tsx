"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Users, Shield, Mail, MapPin, FileText } from "lucide-react";

export default function CompanySettingsLoading() {
    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* En-tête de la page */}
            <div className="space-y-2">
                <Skeleton className="h-10 w-96 mb-2" />
                <Skeleton className="h-6 w-80" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Colonne principale : Informations de l'entreprise */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Informations générales */}
                    <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
                        <CardHeader className="pb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Building2 className="h-6 w-6 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <Skeleton className="h-7 w-64" />
                                    <Skeleton className="h-5 w-80" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* Nom de l'entreprise */}
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-40" />
                                    <Skeleton className="h-12 w-full" />
                                </div>

                                <div className="h-px bg-border" />

                                {/* Contact */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-5 w-5 text-muted-foreground" />
                                        <Skeleton className="h-6 w-20" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-16" />
                                            <Skeleton className="h-10 w-full" />
                                        </div>
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-20" />
                                            <Skeleton className="h-10 w-full" />
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-border" />

                                {/* Adresse */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-muted-foreground" />
                                        <Skeleton className="h-6 w-16" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    </div>
                                </div>

                                <div className="h-px bg-border" />

                                {/* Informations légales */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-muted-foreground" />
                                        <Skeleton className="h-6 w-32" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-16" />
                                            <Skeleton className="h-10 w-full" />
                                        </div>
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-20" />
                                            <Skeleton className="h-10 w-full" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-6">
                                    <Skeleton className="h-11 w-48" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Colonne latérale : Logo et abonnement */}
                <div className="space-y-6">
                    {/* Logo de l'entreprise */}
                    <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Logo de l&apos;entreprise</CardTitle>
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
                    <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Shield className="h-5 w-5 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <Skeleton className="h-6 w-24" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-6 w-16" />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-4 w-12" />
                                    </div>
                                    <Skeleton className="h-2 w-full rounded-full" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Skeleton className="h-4 w-32" />
                                <div className="space-y-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <Skeleton className="w-2 h-2 rounded-full" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="pt-4">
                                <Skeleton className="h-11 w-full" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 
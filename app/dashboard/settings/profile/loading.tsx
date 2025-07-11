"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Shield } from "lucide-react";

export default function ProfileLoading() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* En-tête du profil */}
            <div className="text-center space-y-4">
                <div className="relative inline-block">
                    <Skeleton className="h-24 w-24 rounded-full mx-auto border-4 border-background shadow-lg" />
                    <Skeleton className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full" />
                </div>

                <div className="space-y-2">
                    <Skeleton className="h-8 w-48 mx-auto" />
                    <div className="flex items-center justify-center gap-3">
                        <Skeleton className="h-6 w-32" />
                        <div className="flex items-center gap-1">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-40" />
                        </div>
                    </div>
                    <Skeleton className="h-4 w-48 mx-auto" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Informations du profil */}
                <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <User className="h-5 w-5" />
                            Informations personnelles
                        </CardTitle>
                        <CardDescription>
                            Modifiez vos informations de base
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-11 w-full" />
                        </div>

                        <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-11 w-full" />
                            <Skeleton className="h-3 w-64" />
                        </div>

                        <div className="pt-2">
                            <Skeleton className="h-11 w-full" />
                        </div>
                    </CardContent>
                </Card>

                {/* Sécurité */}
                <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Shield className="h-5 w-5" />
                            Sécurité
                        </CardTitle>
                        <CardDescription>
                            Gérez la sécurité de votre compte
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                            <div>
                                <Skeleton className="h-5 w-32 mb-1" />
                                <Skeleton className="h-4 w-64 mb-4" />
                            </div>
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 
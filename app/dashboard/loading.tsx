import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header avec informations de l'entreprise */}
            <div className="border-b border-border bg-background/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <Skeleton className="h-8 w-64 mb-2" />
                            <Skeleton className="h-5 w-48" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="space-y-8">
                    {/* Section Statistiques */}
                    <div className="space-y-6">
                        <Skeleton className="h-8 w-32" />
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="border rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-8 w-8 rounded-lg" />
                                    </div>
                                    <Skeleton className="h-8 w-20 mb-2" />
                                    <div className="flex items-center gap-1">
                                        <Skeleton className="h-3 w-3" />
                                        <Skeleton className="h-3 w-32" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section Analyses */}
                    <div className="space-y-6">
                        <Skeleton className="h-8 w-24" />
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Premier graphique */}
                            <div className="border rounded-lg p-6">
                                <Skeleton className="h-6 w-32 mb-4" />
                                <Skeleton className="h-64 w-full" />
                            </div>
                            {/* Deuxième graphique */}
                            <div className="border rounded-lg p-6">
                                <Skeleton className="h-6 w-32 mb-4" />
                                <Skeleton className="h-64 w-full" />
                            </div>
                        </div>
                    </div>

                    {/* Section Suivi */}
                    <div className="space-y-6">
                        <Skeleton className="h-8 w-20" />
                        <div className="border rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Skeleton className="h-5 w-5" />
                                <Skeleton className="h-6 w-40" />
                            </div>
                            <Skeleton className="h-4 w-80 mb-6" />

                            {/* Items du tableau */}
                            <div className="space-y-4">
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <Skeleton className="h-8 w-8 rounded-lg" />
                                            <div>
                                                <Skeleton className="h-4 w-32 mb-1" />
                                                <Skeleton className="h-3 w-24" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <Skeleton className="h-4 w-20 mb-1" />
                                                <Skeleton className="h-3 w-16" />
                                            </div>
                                            <Skeleton className="h-6 w-16 rounded-full" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Section Actions rapides */}
                    <div className="space-y-6">
                        <Skeleton className="h-8 w-36" />
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="border rounded-lg p-6 h-24">
                                    <div className="flex items-center gap-3 w-full h-full">
                                        <Skeleton className="h-9 w-9 rounded-lg" />
                                        <div className="flex flex-col items-start w-full">
                                            <Skeleton className="h-4 w-24 mb-1" />
                                            <Skeleton className="h-3 w-20" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

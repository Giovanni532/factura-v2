import { Skeleton } from "@/components/ui/skeleton";

export default function ClientsLoading() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between space-y-2">
                <Skeleton className="h-9 w-24" />
            </div>

            {/* Statistiques */}
            <div className="grid gap-4 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4" />
                        </div>
                        <Skeleton className="h-8 w-16 mb-2" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                ))}
            </div>

            {/* Barre d'outils */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex flex-1 items-center space-x-2 max-w-sm">
                    <div className="relative flex-1">
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        <Skeleton className="h-8 w-12" />
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-20" />
                    </div>
                    <Skeleton className="h-10 w-40" />
                </div>
            </div>

            {/* Liste des clients */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="border rounded-lg p-6">
                        {/* Header de la carte */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                </div>
                                <Skeleton className="h-4 w-40" />
                            </div>
                            <Skeleton className="h-8 w-8" />
                        </div>

                        {/* Informations de contact */}
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-3 w-3" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                            <div className="flex items-start gap-2">
                                <Skeleton className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                <div className="space-y-1">
                                    <Skeleton className="h-3 w-32" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-3 w-3" />
                                <Skeleton className="h-3 w-28" />
                            </div>
                        </div>

                        {/* Statistiques */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <Skeleton className="h-5 w-8 mx-auto mb-1" />
                                <Skeleton className="h-3 w-16 mx-auto" />
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <Skeleton className="h-5 w-8 mx-auto mb-1" />
                                <Skeleton className="h-3 w-12 mx-auto" />
                            </div>
                        </div>

                        {/* Chiffre d'affaires */}
                        <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg mb-4">
                            <Skeleton className="h-5 w-20 mx-auto mb-1" />
                            <Skeleton className="h-3 w-24 mx-auto" />
                        </div>

                        {/* Actions principales */}
                        <div className="flex gap-2 mb-3">
                            <Skeleton className="h-8 flex-1" />
                            <Skeleton className="h-8 w-16" />
                        </div>

                        {/* Date de création */}
                        <Skeleton className="h-3 w-32" />
                    </div>
                ))}
            </div>
        </div>
    );
}

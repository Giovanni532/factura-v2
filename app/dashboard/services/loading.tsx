import { Skeleton } from "@/components/ui/skeleton";

export default function ServicesLoading() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between space-y-2">
                <Skeleton className="h-9 w-32" />
            </div>

            {/* Statistiques */}
            <div className="grid gap-4 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
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

            {/* Onglets */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex space-x-1 bg-muted rounded-lg p-1">
                        {Array.from({ length: 2 }).map((_, index) => (
                            <div key={index} className="flex items-center gap-2 px-3 py-2 rounded-md">
                                <Skeleton className="h-4 w-4" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                        ))}
                    </div>
                    <Skeleton className="h-10 w-40" />
                </div>

                {/* Contenu des onglets - Section Prestations */}
                <div className="space-y-4">
                    {/* Filtres */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="flex gap-2">
                            <Skeleton className="h-10 w-32" />
                            <Skeleton className="h-10 w-32" />
                            <Skeleton className="h-10 w-20" />
                        </div>
                    </div>

                    {/* Grille des prestations */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="border rounded-lg p-6">
                                {/* Header de la carte */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Skeleton className="h-5 w-32" />
                                            <Skeleton className="h-5 w-16 rounded-full" />
                                            <Skeleton className="h-5 w-20 rounded-full" />
                                        </div>
                                        <Skeleton className="h-4 w-48" />
                                    </div>
                                    <Skeleton className="h-8 w-8" />
                                </div>

                                {/* Prix et unité */}
                                <div className="mb-4 p-3 bg-muted/50 rounded-lg space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-5 w-16" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Skeleton className="h-4 w-12" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Skeleton className="h-4 w-8" />
                                        <Skeleton className="h-4 w-12" />
                                    </div>
                                </div>

                                {/* Statistiques */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                                        <div className="flex items-center justify-center gap-1 mb-1">
                                            <Skeleton className="h-4 w-4" />
                                            <Skeleton className="h-5 w-8" />
                                        </div>
                                        <Skeleton className="h-3 w-16 mx-auto" />
                                    </div>
                                    <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                                        <div className="flex items-center justify-center gap-1 mb-1">
                                            <Skeleton className="h-4 w-4" />
                                            <Skeleton className="h-5 w-12" />
                                        </div>
                                        <Skeleton className="h-3 w-20 mx-auto" />
                                    </div>
                                </div>

                                {/* Dernière utilisation */}
                                <div className="flex items-center gap-2 mb-4">
                                    <Skeleton className="h-3 w-3" />
                                    <Skeleton className="h-3 w-32" />
                                </div>

                                {/* Date de création */}
                                <Skeleton className="h-3 w-24" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

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
                        {/* Barre de progression pour le premier card */}
                        {index === 0 && (
                            <div className="mt-2">
                                <div className="w-full bg-muted rounded-full h-2">
                                    <Skeleton className="h-2 w-3/4 rounded-full" />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Barre d'outils de la datagrid */}
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
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-10 w-40" />
                </div>
            </div>

            {/* Table de la datagrid */}
            <div className="bg-background overflow-hidden rounded-md border">
                <div className="border-b">
                    <div className="flex h-11 items-center px-4">
                        <Skeleton className="h-4 w-16 mr-4" />
                        <Skeleton className="h-4 w-20 mr-4" />
                        <Skeleton className="h-4 w-24 mr-4" />
                        <Skeleton className="h-4 w-16 mr-4" />
                        <Skeleton className="h-4 w-20 mr-4" />
                        <Skeleton className="h-4 w-16 mr-4" />
                        <Skeleton className="h-4 w-24 mr-4" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                </div>

                {/* Lignes de la table */}
                <div className="divide-y">
                    {Array.from({ length: 10 }).map((_, index) => (
                        <div key={index} className="flex h-16 items-center px-4">
                            <Skeleton className="h-4 w-32 mr-4" />
                            <Skeleton className="h-4 w-40 mr-4" />
                            <Skeleton className="h-4 w-28 mr-4" />
                            <Skeleton className="h-5 w-16 rounded-full mr-4" />
                            <Skeleton className="h-4 w-8 mr-4" />
                            <Skeleton className="h-4 w-8 mr-4" />
                            <Skeleton className="h-4 w-20 mr-4" />
                            <Skeleton className="h-8 w-8" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between gap-3 max-sm:flex-col">
                <Skeleton className="h-4 w-32" />

                <div className="flex items-center gap-1">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                </div>

                <Skeleton className="h-10 w-32" />
            </div>
        </div>
    );
}

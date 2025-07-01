import { Skeleton } from "@/components/ui/skeleton";

export default function InvoicesLoading() {
    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-9 w-28 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-40" />
            </div>

            {/* Statistiques */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-8 w-16" />
                    </div>
                ))}
            </div>

            {/* Filtres */}
            <div className="border rounded-lg p-6">
                <Skeleton className="h-6 w-16 mb-4" />
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="flex-1">
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-20" />
                </div>
            </div>

            {/* Liste des factures */}
            <div className="border rounded-lg p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="space-y-2">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                    <Skeleton className="h-8 w-8" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-5 w-32" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-5 w-24" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-12" />
                                    <Skeleton className="h-5 w-20" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-8 w-20" />
                                    <Skeleton className="h-8 w-20" />
                                    <Skeleton className="h-8 w-20" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

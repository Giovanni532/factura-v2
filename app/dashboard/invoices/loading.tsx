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
            <div className="flex flex-wrap items-center gap-3 justify-between">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-60" />
                    <Skeleton className="h-10 w-36" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-28" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-background overflow-hidden rounded-md border">
                <div className="border-b">
                    <div className="grid grid-cols-6 gap-4 p-4">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                </div>
                <div className="divide-y">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="grid grid-cols-6 gap-4 p-4">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-20" />
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-8 w-8 rounded" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between gap-8">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-4 w-48" />
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-10 w-10" />
                </div>
            </div>
        </div>
    );
}

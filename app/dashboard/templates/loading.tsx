import { Skeleton } from "@/components/ui/skeleton";

export default function TemplatesLoading() {
    return (
        <div className="container mx-auto py-6 space-y-8">
            {/* Header */}
            <div className="flex flex-col space-y-2">
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-5 w-96" />
            </div>

            {/* Tabs et bouton de création */}
            <div className="flex items-center justify-between">
                <div className="flex space-x-1 bg-muted rounded-lg p-1">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="flex items-center gap-2 px-3 py-2 rounded-md">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-16" />
                            {index === 2 && <Skeleton className="h-5 w-5 rounded-full ml-1" />}
                        </div>
                    ))}
                </div>
                <Skeleton className="h-10 w-40" />
            </div>

            {/* Contenu des tabs - Section Factures */}
            <div className="space-y-8">
                {/* Section Templates Factura - Factures */}
                <div className="space-y-4">
                    <div>
                        <Skeleton className="h-7 w-64 mb-2" />
                        <Skeleton className="h-4 w-80" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="border rounded-lg overflow-hidden">
                                {/* Preview du template */}
                                <div className="aspect-[3/4] bg-muted relative">
                                    <Skeleton className="h-full w-full" />
                                </div>
                                {/* Contenu de la carte */}
                                <div className="p-4 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1 flex-1">
                                            <Skeleton className="h-5 w-32" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                        <Skeleton className="h-6 w-6 rounded-full" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-4 w-16 rounded-full" />
                                        <Skeleton className="h-4 w-20 rounded-full" />
                                    </div>
                                    <div className="flex items-center gap-2 pt-2">
                                        <Skeleton className="h-8 w-20" />
                                        <Skeleton className="h-8 w-8" />
                                        <Skeleton className="h-8 w-8" />
                                        <Skeleton className="h-8 w-8" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section Templates créés - Factures */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Skeleton className="h-7 w-64 mb-2" />
                            <Skeleton className="h-4 w-80" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 2 }).map((_, index) => (
                            <div key={index} className="border rounded-lg overflow-hidden">
                                {/* Preview du template */}
                                <div className="aspect-[3/4] bg-muted relative">
                                    <Skeleton className="h-full w-full" />
                                </div>
                                {/* Contenu de la carte */}
                                <div className="p-4 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1 flex-1">
                                            <Skeleton className="h-5 w-32" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                        <Skeleton className="h-6 w-6 rounded-full" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-4 w-16 rounded-full" />
                                        <Skeleton className="h-4 w-20 rounded-full" />
                                    </div>
                                    <div className="flex items-center gap-2 pt-2">
                                        <Skeleton className="h-8 w-20" />
                                        <Skeleton className="h-8 w-8" />
                                        <Skeleton className="h-8 w-8" />
                                        <Skeleton className="h-8 w-8" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

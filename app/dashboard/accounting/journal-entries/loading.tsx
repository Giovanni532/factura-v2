import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function JournalEntriesLoading() {
    return (
        <div className="space-y-6">
            {/* Actions */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Liste des écritures */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-4">
                                        <Skeleton className="h-5 w-5" />
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <Skeleton className="h-4 w-24" />
                                                <Skeleton className="h-5 w-16" />
                                            </div>
                                            <Skeleton className="h-4 w-48 mt-1" />
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-right">
                                            <Skeleton className="h-4 w-16 mb-1" />
                                            <Skeleton className="h-6 w-20" />
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Skeleton className="h-8 w-8" />
                                            <Skeleton className="h-8 w-8" />
                                            <Skeleton className="h-8 w-8" />
                                        </div>
                                    </div>
                                </div>

                                {/* Lignes d'écriture */}
                                <div className="bg-muted/20 rounded-lg p-3">
                                    <div className="grid grid-cols-4 gap-4 mb-2">
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                    {Array.from({ length: 2 }).map((_, j) => (
                                        <div key={j} className="grid grid-cols-4 gap-4 py-2 border-b last:border-b-0">
                                            <div>
                                                <Skeleton className="h-4 w-12 mb-1" />
                                                <Skeleton className="h-3 w-20" />
                                            </div>
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-4 w-16" />
                                            <Skeleton className="h-4 w-16" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 
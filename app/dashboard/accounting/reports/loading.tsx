import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ReportsLoading() {
    return (
        <div className="space-y-6">
            {/* Actions */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-40" />
            </div>

            {/* Grille des rapports */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <div className="flex items-center space-x-3">
                                <Skeleton className="h-9 w-9 rounded-lg" />
                                <div>
                                    <Skeleton className="h-5 w-24 mb-1" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-4 w-full mb-4" />
                            <div className="space-y-2 mb-4">
                                <Skeleton className="h-3 w-32" />
                                <Skeleton className="h-3 w-40" />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Skeleton className="h-8 flex-1" />
                                <Skeleton className="h-8 w-8" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Rapports rapides */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-20" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 
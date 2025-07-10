import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function TeamsLoading() {
    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-40" />
            </div>

            {/* Tableau */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* En-têtes du tableau */}
                        <div className="grid grid-cols-5 gap-4 pb-4 border-b">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-16 ml-auto" />
                        </div>

                        {/* Lignes du tableau */}
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="grid grid-cols-5 gap-4 py-4 border-b last:border-b-0">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Skeleton className="h-3 w-3" />
                                    <Skeleton className="h-4 w-40" />
                                </div>
                                <Skeleton className="h-6 w-20" />
                                <div className="flex items-center gap-1">
                                    <Skeleton className="h-3 w-3" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <div className="flex justify-end">
                                    <Skeleton className="h-8 w-8" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 
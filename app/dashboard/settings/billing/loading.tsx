import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function BillingLoadingPage() {
    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-80" />
                <Skeleton className="h-4 w-96" />
            </div>

            {/* Abonnement actuel */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-6 w-40" />
                    </div>
                    <Skeleton className="h-4 w-60" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-5 w-16" />
                            </div>
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-9 w-36" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </CardContent>
            </Card>

            {/* Plans de facturation */}
            <div className="space-y-4">
                <Skeleton className="h-6 w-40" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <CardHeader className="text-center">
                                <Skeleton className="h-6 w-32 mx-auto" />
                                <Skeleton className="h-4 w-48 mx-auto" />
                                <div className="mt-4 space-y-1">
                                    <Skeleton className="h-8 w-24 mx-auto" />
                                    <Skeleton className="h-4 w-16 mx-auto" />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    {[1, 2, 3].map((j) => (
                                        <div key={j} className="flex items-center gap-2">
                                            <Skeleton className="h-4 w-4" />
                                            <Skeleton className="h-4 w-32" />
                                        </div>
                                    ))}
                                </div>
                                <div className="h-px bg-border" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-36" />
                                    {[1, 2, 3, 4].map((j) => (
                                        <div key={j} className="flex items-center gap-2">
                                            <Skeleton className="h-1.5 w-1.5 rounded-full" />
                                            <Skeleton className="h-4 w-40" />
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-4">
                                    <Skeleton className="h-9 w-full" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Informations supplémentaires */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-6 w-48" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-4 w-80" />
                    ))}
                </CardContent>
            </Card>
        </div>
    );
} 
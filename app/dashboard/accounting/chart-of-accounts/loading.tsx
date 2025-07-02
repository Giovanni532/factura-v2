import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ChartOfAccountsLoading() {
    return (
        <div className="space-y-6">
            {/* Actions */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Liste des comptes */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <Skeleton className="h-5 w-5" />
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <Skeleton className="h-4 w-16" />
                                                <Skeleton className="h-4 w-4" />
                                                <Skeleton className="h-4 w-32" />
                                            </div>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <Skeleton className="h-5 w-16" />
                                                <Skeleton className="h-5 w-24" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <Skeleton className="h-6 w-20" />
                                        <div className="flex items-center space-x-2">
                                            <Skeleton className="h-8 w-8" />
                                            <Skeleton className="h-8 w-8" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between space-y-2">
                <Skeleton className="h-9 w-48" />
            </div>

            {/* Profile Content */}
            <div className="space-y-8">
                {/* Profile Card */}
                <div className="border rounded-lg p-6">
                    <div className="flex items-center space-x-4 mb-6">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-12" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-3 w-64" />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Skeleton className="h-10 w-32" />
                        </div>
                    </div>
                </div>

                {/* Security Card */}
                <div className="border rounded-lg p-6">
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-4 w-48" />
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-56" />
                            </div>
                            <Skeleton className="h-10 w-40" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 
"use client";

import DatagridUser from "@/components/datagrid/datagrid-user";

interface TeamMember {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: 'owner' | 'admin' | 'user';
    createdAt: Date;
}

interface TeamsPageClientProps {
    members: TeamMember[];
    userRole: 'owner' | 'admin' | 'user';
    currentUserId: string;
    subscription: {
        plan: string;
        maxUsers: number;
        currentUsers: number;
        features: string[];
    };
}

export function TeamsPageClient({ members, userRole, currentUserId, subscription }: TeamsPageClientProps) {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <DatagridUser
                members={members}
                userRole={userRole}
                currentUserId={currentUserId}
                subscription={subscription}
            />
        </div>
    );
} 
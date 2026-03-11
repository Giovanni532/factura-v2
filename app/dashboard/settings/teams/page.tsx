"use server"

import { getSession } from "@/lib/get-session";
import { redirect } from "next/navigation";


import { paths } from "@/paths";
import { TeamsPageClient } from "@/components/teams/teams-page-client";
import { getUserWithCompanyCached, getTeamMembersCached } from "@/lib/cache";

export default async function TeamsPage() {
    const session = await getSession();

    if (!session?.user) {
        redirect(paths.login);
    }

    // Récupérer l'utilisateur avec son entreprise avec cache
    const userWithCompany = await getUserWithCompanyCached(session.user.id);

    if (!userWithCompany?.company) {
        redirect(paths.dashboard);
    }

    // Récupérer les membres de l'équipe avec cache
    const { members, subscription } = await getTeamMembersCached(userWithCompany.company.id);

    return (
        <TeamsPageClient
            members={members}
            userRole={userWithCompany.role as 'owner' | 'admin' | 'user'}
            currentUserId={userWithCompany.id}
            subscription={subscription}
        />
    );
} 
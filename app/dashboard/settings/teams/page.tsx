"use server"

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { paths } from "@/paths";
import { TeamsPageClient } from "@/components/teams/teams-page-client";
import { getUserWithCompany, getTeamMembers } from "@/db/queries/company";

export default async function TeamsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        redirect(paths.login);
    }

    // Récupérer l'utilisateur avec son entreprise
    const userWithCompany = await getUserWithCompany(session.user.id);

    if (!userWithCompany?.company) {
        redirect(paths.dashboard);
    }

    // Récupérer les membres de l'équipe et les informations d'abonnement
    const { members, subscription } = await getTeamMembers(userWithCompany.company.id);

    return (
        <TeamsPageClient
            members={members}
            userRole={userWithCompany.user.role as 'owner' | 'admin' | 'user'}
            currentUserId={userWithCompany.user.id}
            subscription={subscription}
        />
    );
} 
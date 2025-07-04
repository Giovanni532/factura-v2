"use server"

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { paths } from "@/paths";
import { CompanySettingsClient } from "@/components/company/company-settings-client";
import { getUserWithCompany, getCompanyWithMembers } from "@/db/queries/company";

export default async function CompanySettingsPage() {
    // Récupérer la session utilisateur
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        redirect(paths.login);
    }

    // Récupérer les données de l'utilisateur avec l'entreprise
    const userWithCompany = await getUserWithCompany(session.user.id);

    if (!userWithCompany?.company) {
        redirect(paths.dashboard);
    }

    // Récupérer les données complètes de l'entreprise avec ses membres
    const companyWithMembers = await getCompanyWithMembers(userWithCompany.company.id);

    if (!companyWithMembers) {
        redirect(paths.dashboard);
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <CompanySettingsClient
                initialCompany={companyWithMembers}
                userRole={userWithCompany.user.role}
            />
        </div>
    );
} 
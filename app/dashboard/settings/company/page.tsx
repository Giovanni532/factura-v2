"use server"



import { getSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { paths } from "@/paths";
import { CompanySettingsClient } from "@/components/company/company-settings-client";
import { getUserWithCompanyCached, getCompanyWithMembersCached } from "@/lib/cache";

export default async function CompanySettingsPage() {
    // Récupérer la session utilisateur
    const session = await getSession();

    if (!session?.user) {
        redirect(paths.login);
    }

    // Récupérer les données de l'utilisateur avec l'entreprise avec cache
    const userWithCompany = await getUserWithCompanyCached(session.user.id);

    if (!userWithCompany?.company) {
        redirect(paths.dashboard);
    }

    // Récupérer l'entreprise avec ses membres avec cache
    const companyWithMembers = await getCompanyWithMembersCached(userWithCompany.company.id);

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <CompanySettingsClient
                initialCompany={companyWithMembers as any}
                userRole={userWithCompany.role}
            />
        </div>
    );
} 
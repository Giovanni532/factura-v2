"use server"



import { getSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { paths } from "@/paths";
import { ProfilePageClient } from "@/components/profile/profile-page-client";
import { getUserWithCompanyCached } from "@/lib/cache";
import { PageHeader } from "@/components/ledger"

export default async function ProfilePage() {
    // Récupérer la session utilisateur
    const session = await getSession();

    if (!session?.user) {
        redirect(paths.login);
    }

    // Récupérer les données de l'utilisateur avec cache
    const userWithCompany = await getUserWithCompanyCached(session.user.id);

    if (!userWithCompany) {
        redirect(paths.login);
    }

    const userProfile = {
        id: userWithCompany.id,
        name: userWithCompany.name,
        email: userWithCompany.email,
        emailVerified: userWithCompany.emailVerified,
        image: userWithCompany.image,
        role: userWithCompany.role,
        companyId: userWithCompany.companyId,
        createdAt: userWithCompany.createdAt,
        updatedAt: userWithCompany.updatedAt,
        companyName: userWithCompany.company?.name || null,
    };

    return (
        <div className="space-y-6">
            <PageHeader title="Profil" description="Vos informations personnelles et la sécurité de votre compte" />
            <ProfilePageClient initialUser={userProfile} />
        </div>
    );
} 
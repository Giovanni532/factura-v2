"use server"

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { paths } from "@/paths";
import { ProfilePageClient } from "@/components/profile/profile-page-client";
import { getUserWithCompanyCached } from "@/lib/cache";

export default async function ProfilePage() {
    // Récupérer la session utilisateur
    const session = await auth.api.getSession({
        headers: await headers()
    });

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
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Profil utilisateur</h2>
            </div>
            <ProfilePageClient initialUser={userProfile} />
        </div>
    );
} 
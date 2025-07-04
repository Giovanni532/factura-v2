"use server"

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/drizzle";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { paths } from "@/paths";
import { ProfilePageClient } from "@/components/profile/profile-page-client";

export default async function ProfilePage() {
    // Récupérer la session utilisateur
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        redirect(paths.login);
    }

    // Récupérer les données complètes de l'utilisateur
    const userData = await db.select({
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        role: user.role,
        companyId: user.companyId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    })
        .from(user)
        .where(eq(user.id, session.user.id))
        .limit(1);

    if (userData.length === 0) {
        redirect(paths.login);
    }

    const userProfile = userData[0];

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Profil utilisateur</h2>
            </div>
            <ProfilePageClient initialUser={userProfile} />
        </div>
    );
} 
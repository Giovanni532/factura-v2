"use server"

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { paths } from "@/paths";
import { ProfilePageClient } from "@/components/profile/profile-page-client";
import { db } from "@/lib/drizzle";
import { user, company } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function ProfilePage() {
    // Récupérer la session utilisateur
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        redirect(paths.login);
    }

    // Récupérer les données complètes de l'utilisateur avec les informations de l'entreprise
    const userData = await db
        .select({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                emailVerified: user.emailVerified,
                image: user.image,
                role: user.role,
                companyId: user.companyId,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
            company: {
                name: company.name,
            }
        })
        .from(user)
        .leftJoin(company, eq(user.companyId, company.id))
        .where(eq(user.id, session.user.id))
        .limit(1);

    if (userData.length === 0) {
        redirect(paths.login);
    }

    const userProfile = {
        ...userData[0].user,
        companyName: userData[0].company?.name || null,
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
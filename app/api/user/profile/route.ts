import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/drizzle";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
        // Récupérer la session utilisateur
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json(
                { error: "Non autorisé" },
                { status: 401 }
            );
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
            return NextResponse.json(
                { error: "Utilisateur non trouvé" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            user: userData[0]
        });

    } catch (error) {
        console.error("Erreur lors de la récupération du profil:", error);
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        );
    }
} 
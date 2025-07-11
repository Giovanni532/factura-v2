import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/drizzle";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const linkUserSchema = z.object({
    invitationData: z.object({
        name: z.string(),
        email: z.string().email(),
        role: z.enum(["user", "owner", "admin"]),
        companyId: z.string().nullable(),
    }),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { invitationData } = linkUserSchema.parse(body);

        // Récupérer l'utilisateur créé par Better Auth
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json(
                { error: "Session utilisateur non trouvée" },
                { status: 401 }
            );
        }

        // Mettre à jour l'utilisateur avec les informations de l'invitation
        await db.update(user)
            .set({
                companyId: invitationData.companyId,
                role: invitationData.role,
                updatedAt: new Date(),
            })
            .where(eq(user.id, session.user.id));

        return NextResponse.json({
            success: true,
            message: "Utilisateur lié à l'entreprise avec succès",
        });

    } catch (error) {
        console.error("Erreur lors de la liaison de l'utilisateur:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Données invalides", details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Erreur interne du serveur" },
            { status: 500 }
        );
    }
} 
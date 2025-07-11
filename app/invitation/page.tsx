"use server"

import { redirect } from "next/navigation";
import { db } from "@/lib/drizzle";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { InvitationClient } from "@/components/forms/invitation-client";
import { paths } from "@/paths";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface InvitationPageProps {
    searchParams: Promise<{ [key: string]: string }>
}

export default async function InvitationPage({ searchParams }: InvitationPageProps) {
    try {
        const searchParamsResult = await searchParams;
        const token = searchParamsResult.token;
        const email = searchParamsResult.email;


        if (!token || !email) {
            redirect(paths.login);
        }

        // Vérifier si l'utilisateur invité existe et n'est pas encore vérifié
        const userData = await db.select().from(user).where(eq(user.id, token)).limit(1);


        if (!userData.length) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
                    <div className="w-full max-w-md">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                            <h2 className="text-xl font-semibold text-red-800 mb-2">Invitation invalide</h2>
                            <p className="text-red-600 mb-4">
                                Cette invitation n&apos;est plus valide ou a déjà été utilisée.
                            </p>
                            <Button asChild>
                                <Link href={paths.login}>
                                    Aller à la page de connexion
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        if (userData[0].email !== email || userData[0].emailVerified) {
            redirect(paths.login);
        }

        // Sauvegarder les informations de l'invitation avant de supprimer l'utilisateur temporaire
        const invitationData = {
            name: userData[0].name,
            email: userData[0].email,
            role: userData[0].role,
            companyId: userData[0].companyId,
        };


        // Supprimer l'utilisateur temporaire pour permettre le signup de Better Auth
        await db.delete(user).where(eq(user.id, token));

        return (
            <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md">
                    <InvitationClient
                        token={token}
                        email={email}
                        userName={invitationData.name}
                        invitationData={invitationData}
                    />
                </div>
            </div>
        );
    } catch (error) {
        console.error('Page invitation - Erreur:', error);
        redirect(paths.login);
    }
} 
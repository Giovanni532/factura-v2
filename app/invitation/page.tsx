import Link from "next/link";
import { eq } from "drizzle-orm";
import { InvitationClient } from "@/components/forms/invitation-client";
import { Button } from "@/components/ui/button";
import { company } from "@/db/schema";
import { db } from "@/lib/drizzle";
import { findInvitation } from "@/lib/invitation";
import { paths } from "@/paths";

interface InvitationPageProps {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

// Lecture seule : ouvrir le lien (y compris par un scanner de liens) ne modifie
// jamais la base. L'acceptation se fait au moment de l'inscription.
export default async function InvitationPage({ searchParams }: InvitationPageProps) {
    const { token } = await searchParams;
    const invitation = await findInvitation(token);

    if (!invitation || !token) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md">
                    <div className="rounded-lg border border-destructive/25 bg-destructive/[0.06] p-6 text-center">
                        <h2 className="mb-2 text-xl font-semibold text-destructive">Invitation invalide</h2>
                        <p className="mb-4 text-destructive">Cette invitation n&apos;est plus valide, a expiré ou a déjà été utilisée.</p>
                        <Button asChild>
                            <Link href={paths.login}>Aller à la page de connexion</Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const [companyRow] = await db.select({ name: company.name }).from(company).where(eq(company.id, invitation.payload.companyId)).limit(1);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                <InvitationClient
                    token={token}
                    email={invitation.payload.email}
                    userName={invitation.payload.name}
                    companyName={companyRow?.name ?? null}
                />
            </div>
        </div>
    );
}

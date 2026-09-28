import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/drizzle";
import { consumeInvitation, findInvitation } from "@/lib/invitation";

// Étape 2, après l'inscription : rattache le compte connecté à l'entreprise.
// L'entreprise et le rôle viennent de l'invitation stockée côté serveur, jamais
// du navigateur, et seul le titulaire de l'adresse invitée peut l'accepter.
const schema = z.object({ token: z.string().min(20).max(128) });

export async function POST(request: NextRequest) {
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invitation invalide" }, { status: 400 });

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return NextResponse.json({ error: "Session utilisateur non trouvée" }, { status: 401 });

    const invitation = await findInvitation(parsed.data.token);
    if (!invitation) return NextResponse.json({ error: "Invitation invalide ou expirée" }, { status: 404 });

    if (session.user.email.toLowerCase() !== invitation.payload.email.toLowerCase()) {
        return NextResponse.json({ error: "Cette invitation est destinée à une autre adresse email" }, { status: 403 });
    }

    const [current] = await db.select({ companyId: user.companyId }).from(user).where(eq(user.id, session.user.id)).limit(1);
    if (current?.companyId && current.companyId !== invitation.payload.companyId) {
        return NextResponse.json({ error: "Ce compte appartient déjà à une autre entreprise" }, { status: 409 });
    }

    await db
        .update(user)
        .set({ companyId: invitation.payload.companyId, role: invitation.payload.role, updatedAt: new Date() })
        .where(eq(user.id, session.user.id));
    await consumeInvitation(invitation.id);

    return NextResponse.json({ success: true, message: "Utilisateur lié à l'entreprise avec succès" });
}

import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { account, user } from "@/db/schema";
import { db } from "@/lib/drizzle";
import { findInvitation } from "@/lib/invitation";

// Étape 1 de l'acceptation, juste avant l'inscription : libère l'adresse email
// occupée par l'utilisateur « en attente » créé à l'invitation, pour que
// Better-Auth puisse créer le vrai compte. Ne supprime QUE cette fiche
// d'attente : même id que dans l'invitation, même email, jamais vérifiée et
// sans aucun identifiant (aucune ligne `account`). Un vrai compte ne peut pas
// être supprimé par cette route.
const schema = z.object({ token: z.string().min(20).max(128) });

export async function POST(request: NextRequest) {
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invitation invalide" }, { status: 400 });

    const invitation = await findInvitation(parsed.data.token);
    if (!invitation) return NextResponse.json({ error: "Invitation invalide ou expirée" }, { status: 404 });
    const { placeholderUserId, email } = invitation.payload;

    const [existing] = await db
        .select({ id: user.id, emailVerified: user.emailVerified })
        .from(user)
        .where(eq(user.email, email))
        .limit(1);
    if (!existing) return NextResponse.json({ ok: true });

    const credentials = await db.select({ id: account.id }).from(account).where(eq(account.userId, existing.id)).limit(1);
    if (existing.id !== placeholderUserId || existing.emailVerified || credentials.length > 0) {
        return NextResponse.json({ error: "Un compte existe déjà pour cette adresse : connectez-vous." }, { status: 409 });
    }

    await db.delete(user).where(and(eq(user.id, placeholderUserId), eq(user.email, email)));
    return NextResponse.json({ ok: true });
}

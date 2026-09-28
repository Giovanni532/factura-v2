import { createHash, randomBytes } from "crypto";
import { and, eq, gt } from "drizzle-orm";
import { verification } from "@/db/schema";
import { db } from "@/lib/drizzle";

// Invitations d'équipe : un jeton aléatoire (256 bits) envoyé par email, dont
// seule l'empreinte SHA-256 est stockée dans la table `verification` de
// Better-Auth. Le jeton porte l'entreprise et le rôle côté serveur : le
// navigateur ne fournit jamais ni companyId ni rôle.
const PREFIX = "company-invite:";
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type InvitationPayload = {
    /** Utilisateur « en attente » créé à l'invitation (affiché dans l'équipe) */
    placeholderUserId: string;
    email: string;
    name: string;
    companyId: string;
    role: "user" | "admin";
    invitedBy: string;
};

const digest = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createInvitationToken(payload: InvitationPayload): Promise<string> {
    const token = randomBytes(32).toString("base64url");
    await db.insert(verification).values({
        id: crypto.randomUUID(),
        identifier: PREFIX + digest(token),
        value: JSON.stringify(payload),
        expiresAt: new Date(Date.now() + TTL_MS),
    });
    return token;
}

export async function findInvitation(token: string | undefined | null): Promise<{ id: string; payload: InvitationPayload } | null> {
    if (!token || token.length < 20 || token.length > 128) return null;
    const [row] = await db
        .select()
        .from(verification)
        .where(and(eq(verification.identifier, PREFIX + digest(token)), gt(verification.expiresAt, new Date())))
        .limit(1);
    if (!row) return null;
    try {
        const payload = JSON.parse(row.value) as InvitationPayload;
        if (!payload.companyId || !payload.email || (payload.role !== "user" && payload.role !== "admin")) return null;
        return { id: row.id, payload };
    } catch {
        return null;
    }
}

/** Usage unique : supprimé dès que le compte est lié à l'entreprise */
export async function consumeInvitation(id: string) {
    await db.delete(verification).where(eq(verification.id, id));
}

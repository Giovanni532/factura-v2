import { and, eq, isNull, or } from "drizzle-orm";
import { client, template } from "@/db/schema";
import { db } from "@/lib/drizzle";
import { ActionError } from "@/lib/safe-action";
import { predefinedTemplates } from "@/lib/templates";

// Tout identifiant venu du navigateur (client, modèle…) doit appartenir à
// l'entreprise de l'utilisateur avant d'être rattaché à un document : sans
// ça, un UUID d'une autre entreprise suffisait à afficher ses clients ou à
// imprimer avec ses modèles.

/** Condition SQL : modèles de l'entreprise ou modèles prédéfinis (sans entreprise) */
export const usableTemplate = (companyId: string) => or(eq(template.companyId, companyId), isNull(template.companyId));

export async function assertClientOwned(clientId: string | null | undefined, companyId: string) {
    if (!clientId) return;
    const [row] = await db.select({ id: client.id }).from(client).where(and(eq(client.id, clientId), eq(client.companyId, companyId))).limit(1);
    if (!row) throw new ActionError("Client introuvable");
}

export async function assertTemplateUsable(templateId: string | null | undefined, companyId: string) {
    if (!templateId) return;
    const [row] = await db.select({ companyId: template.companyId }).from(template).where(eq(template.id, templateId)).limit(1);
    if (row) {
        if (row.companyId && row.companyId !== companyId) throw new ActionError("Modèle introuvable");
        return;
    }
    // Modèles prédéfinis livrés dans le code (pas forcément en base)
    if (!predefinedTemplates.some((t) => (t as { id?: string }).id === templateId)) throw new ActionError("Modèle introuvable");
}

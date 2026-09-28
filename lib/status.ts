// Statuts des documents → libellé et ton sémantique de la DA « Registre ».
// Une facture est féminine (« Payée »), un devis masculin (« Accepté »).
export type StatusTone = "success" | "warning" | "info" | "destructive" | "muted"
export type DocumentKind = "invoice" | "quote"

const STATUS: Record<string, { tone: StatusTone; invoice: string; quote: string }> = {
    paid: { tone: "success", invoice: "Payée", quote: "Payé" },
    accepted: { tone: "success", invoice: "Acceptée", quote: "Accepté" },
    converted: { tone: "success", invoice: "Convertie", quote: "Converti" },
    sent: { tone: "info", invoice: "Envoyée", quote: "Envoyé" },
    draft: { tone: "muted", invoice: "Brouillon", quote: "Brouillon" },
    overdue: { tone: "destructive", invoice: "En retard", quote: "En retard" },
    rejected: { tone: "destructive", invoice: "Refusée", quote: "Refusé" },
    expired: { tone: "warning", invoice: "Expirée", quote: "Expiré" },
    cancelled: { tone: "muted", invoice: "Annulée", quote: "Annulé" },
}

export function getStatus(status: string, kind: DocumentKind = "invoice") {
    const entry = STATUS[status]
    return entry ? { tone: entry.tone, label: entry[kind] } : { tone: "muted" as StatusTone, label: status }
}

// Pastille de couleur (fond plein) pour les listes denses
export const toneDot: Record<StatusTone, string> = {
    success: "bg-success",
    warning: "bg-warning",
    info: "bg-info",
    destructive: "bg-destructive",
    muted: "bg-muted-foreground/50",
}

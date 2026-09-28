import type { ComponentType, ReactNode } from "react"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

// ── En-tête de page commun au dashboard ─────────────────────────────────────
export function PageHeader({
    eyebrow,
    title,
    description,
    actions,
    className,
}: {
    eyebrow?: ReactNode
    title: ReactNode
    description?: ReactNode
    actions?: ReactNode
    className?: string
}) {
    return (
        <header className={cn("flex flex-col gap-5 border-b pb-6 md:flex-row md:items-end md:justify-between", className)}>
            <div className="min-w-0">
                {eyebrow && <p className="ledger-label mb-2">{eyebrow}</p>}
                <h1 className="text-3xl font-semibold tracking-[-0.03em]">{title}</h1>
                {description && <p className="mt-1 text-muted-foreground">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
    )
}

// ── Bandeau d'indicateurs : une seule surface divisée par des filets ────────
export type LedgerStat = {
    label: string
    value: ReactNode
    detail?: ReactNode
    icon?: ComponentType<{ className?: string }>
    tone?: "success" | "destructive" | "warning" | "info"
    /** Variation en % (affichée si non nulle) */
    delta?: number | null
}

const toneText = {
    success: "text-success",
    destructive: "text-destructive",
    warning: "text-warning",
    info: "text-info",
}

export function LedgerStats({ items, className }: { items: LedgerStat[]; className?: string }) {
    return (
        <section
            aria-label="Indicateurs"
            className={cn(
                "grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border",
                items.length >= 4 ? "xl:grid-cols-4" : items.length === 3 ? "lg:grid-cols-3" : "",
                className,
            )}
        >
            {items.map((item) => {
                const Icon = item.icon
                const up = item.delta != null && item.delta >= 0
                return (
                    <div key={item.label} className="flex min-w-0 flex-col justify-between gap-5 bg-card p-4 sm:p-5 md:gap-6 md:p-6">
                        <div className="flex items-center justify-between gap-3">
                            <span className="ledger-label">{item.label}</span>
                            {Icon && <Icon aria-hidden="true" className="size-4 text-muted-foreground" />}
                        </div>
                        <div>
                            <p
                                className={cn(
                                    "truncate font-mono text-[19px] font-medium leading-none tracking-[-0.03em] sm:text-[26px] md:text-[28px]",
                                    item.tone && toneText[item.tone],
                                )}
                            >
                                {item.value}
                            </p>
                            {(item.detail || item.delta != null) && (
                                <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[12px] text-muted-foreground sm:text-[13px]">
                                    {item.detail && <span className="truncate">{item.detail}</span>}
                                    {item.delta != null && (
                                        <span
                                            className={cn(
                                                "inline-flex shrink-0 items-center gap-0.5 font-mono text-[12px]",
                                                up ? "text-success" : "text-destructive",
                                            )}
                                            title="Par rapport au mois précédent"
                                        >
                                            {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                                            {Math.abs(item.delta).toFixed(0)} %
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </section>
    )
}

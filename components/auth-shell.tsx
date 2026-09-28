import type { ReactNode } from "react"

const COPY = {
    login: {
        title: (
            <>
                Bon retour dans <em>votre registre.</em>
            </>
        ),
        text: "Vos factures, devis et encaissements vous attendent, exactement là où vous les avez laissés.",
    },
    signup: {
        title: (
            <>
                Ouvrez votre registre <em>en deux minutes.</em>
            </>
        ),
        text: "Créez votre compte, renseignez votre entreprise, émettez votre première facture. Le plan gratuit n'expire jamais.",
    },
}

const ENTRIES = [
    { date: "02.09", label: "F-2026-0117 · Atelier Léman", amount: "3 502,44" },
    { date: "14.09", label: "F-2026-0118 · Studio Nord", amount: "10 539,75" },
    { date: "21.09", label: "Encaissement · Galerie Onze", amount: "2 594,40" },
]

// Mise en page des écrans d'authentification : panneau « registre » + formulaire.
export function AuthShell({ variant, children }: { variant: "login" | "signup"; children: ReactNode }) {
    const copy = COPY[variant]
    return (
        <div className="grid min-h-[calc(100svh-4rem)] lg:grid-cols-2">
            <aside className="relative hidden overflow-hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
                <div aria-hidden="true" className="ledger-paper absolute inset-0 opacity-50" />
                <div className="relative">
                    <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-primary-foreground/70">Factura</p>
                    <h1 className="mt-6 max-w-md font-serif text-[clamp(2.6rem,3.6vw,3.8rem)] leading-[0.98]">{copy.title}</h1>
                    <p className="mt-6 max-w-md leading-relaxed text-primary-foreground/75">{copy.text}</p>
                </div>

                {/* Extrait de journal */}
                <div aria-hidden="true" className="relative max-w-md rounded-xl border border-primary-foreground/15 bg-primary-foreground/[0.06] p-5 font-mono text-[12px]">
                    <div className="flex justify-between pb-3 text-[10.5px] uppercase tracking-[0.1em] text-primary-foreground/60">
                        <span>Journal · Septembre</span>
                        <span>EUR</span>
                    </div>
                    {ENTRIES.map((entry) => (
                        <div key={entry.label} className="grid grid-cols-[auto_1fr_auto] gap-x-4 border-t border-dashed border-primary-foreground/15 py-2.5">
                            <span className="text-primary-foreground/60">{entry.date}</span>
                            <span className="truncate">{entry.label}</span>
                            <span>{entry.amount}</span>
                        </div>
                    ))}
                    <div className="mt-1 flex justify-between border-t border-primary-foreground/30 pt-3 font-semibold">
                        <span>Total</span>
                        <span className="ledger-total pb-0.5">16 636,59</span>
                    </div>
                </div>
            </aside>

            <main className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-12">
                <div className="w-full max-w-md">{children}</div>
            </main>
        </div>
    )
}

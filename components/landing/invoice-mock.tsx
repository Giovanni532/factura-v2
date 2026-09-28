"use client"

import { motion, useReducedMotion } from "framer-motion"
import { LogoMark } from "@/components/logo"

const EASE = [0.16, 1, 0.3, 1] as const

const LINES = [
    { label: "Maquettes UI — 10 écrans", qty: "1", unit: "1 800,00", total: "1 800,00" },
    { label: "Développement Next.js", qty: "24 h", unit: "120,00", total: "2 880,00" },
    { label: "Maintenance mensuelle", qty: "3", unit: "290,00", total: "870,00" },
]

// Facture de démonstration : les lignes s'inscrivent, le double filet du total
// se trace, puis le tampon « Payée » vient se poser.
export function InvoiceMock() {
    const reduce = useReducedMotion()
    const t = (delay: number) => (reduce ? { duration: 0 } : { duration: 0.7, delay, ease: EASE })

    return (
        <div className="relative mx-auto w-full max-w-[520px]" aria-hidden="true">
            {/* Feuille de dessous, pour la profondeur */}
            <div className="absolute inset-x-6 -bottom-3 top-6 rotate-[2.5deg] rounded-xl border bg-card/70" />

            <motion.div
                initial={reduce ? false : { opacity: 0, y: 24, rotate: -1 }}
                animate={{ opacity: 1, y: 0, rotate: -1 }}
                transition={t(0.1)}
                className="relative rounded-xl border bg-card p-6 shadow-[0_30px_60px_-30px_rgb(18_18_16/0.35)] md:p-8"
            >
                {/* En-tête du document */}
                <div className="flex items-start justify-between gap-6">
                    <div className="flex items-center gap-2.5">
                        <LogoMark className="size-8" title="" />
                        <div className="leading-tight">
                            <p className="text-sm font-semibold">Atelier Nord</p>
                            <p className="text-xs text-muted-foreground">12 rue des Arts, Lyon</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="ledger-label">Facture</p>
                        <p className="font-mono text-sm font-medium">F-2026-0142</p>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 border-y py-4 text-xs">
                    <div>
                        <p className="ledger-label">Client</p>
                        <p className="mt-1 font-medium">Studio Léman</p>
                    </div>
                    <div className="text-right">
                        <p className="ledger-label">Échéance</p>
                        <p className="mt-1 font-mono">28.10.2026</p>
                    </div>
                </div>

                {/* Lignes */}
                <div className="mt-4">
                    <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 pb-2">
                        <span className="ledger-label">Désignation</span>
                        <span className="ledger-label text-right">Qté</span>
                        <span className="ledger-label w-20 text-right">Montant</span>
                    </div>
                    {LINES.map((line, i) => (
                        <motion.div
                            key={line.label}
                            initial={reduce ? false : { opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={t(0.6 + i * 0.28)}
                            className="grid grid-cols-[1fr_auto_auto] gap-x-4 border-t border-dashed py-2.5 text-[13px]"
                        >
                            <span className="truncate">{line.label}</span>
                            <span className="text-right font-mono text-muted-foreground">{line.qty}</span>
                            <span className="w-20 text-right font-mono">{line.total}</span>
                        </motion.div>
                    ))}
                </div>

                {/* Totaux */}
                <div className="mt-2 ml-auto w-56 space-y-1.5 border-t pt-3 text-[13px]">
                    <div className="flex justify-between text-muted-foreground">
                        <span>Sous-total</span>
                        <span className="font-mono">5 550,00</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                        <span>TVA 20 %</span>
                        <span className="font-mono">1 110,00</span>
                    </div>
                    <div className="relative flex justify-between pb-1.5 pt-1 font-semibold">
                        <span>Total TTC</span>
                        <span className="font-mono">6 660,00 €</span>
                        {/* Double filet du total comptable */}
                        <motion.span
                            initial={reduce ? false : { scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={t(1.6)}
                            className="absolute inset-x-0 bottom-0 h-[5px] origin-right border-y border-foreground"
                        />
                    </div>
                </div>

                {/* Tampon */}
                <motion.div
                    initial={reduce ? false : { opacity: 0, scale: 1.8, rotate: -4 }}
                    animate={{ opacity: 1, scale: 1, rotate: -12 }}
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 18, delay: 2.2 }}
                    className="absolute bottom-9 left-8 rounded-md border-2 border-success px-3 py-1.5 font-mono text-lg font-semibold uppercase tracking-[0.18em] text-success md:left-10"
                >
                    Payée
                </motion.div>
            </motion.div>

            {/* Notification d'encaissement */}
            <motion.div
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={t(2.7)}
                className="absolute -bottom-6 -right-2 flex items-center gap-3 rounded-lg border bg-popover px-4 py-3 shadow-[0_16px_40px_-20px_rgb(18_18_16/0.4)] md:-right-8"
            >
                <span className="relative flex size-2">
                    <span className="absolute inset-0 animate-ping rounded-full bg-success opacity-60" />
                    <span className="relative size-2 rounded-full bg-success" />
                </span>
                <div className="leading-tight">
                    <p className="text-xs text-muted-foreground">Encaissement reçu</p>
                    <p className="font-mono text-sm font-medium">+ 6 660,00 €</p>
                </div>
            </motion.div>
        </div>
    )
}

"use client"

import { motion, useInView, useReducedMotion } from "framer-motion"
import Link from "next/link"
import { useRef, type ReactNode } from "react"
import { ArrowRight, BarChart3, Calculator, Check, FileText, Layout, Shield, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { paths } from "@/paths"
import { cn } from "@/lib/utils"

const EASE = [0.16, 1, 0.3, 1] as const

// Apparition douce à l'entrée dans le viewport
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
    const ref = useRef<HTMLDivElement>(null)
    const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" })
    const reduce = useReducedMotion()
    return (
        <motion.div
            ref={ref}
            className={className}
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.8, delay, ease: EASE }}
        >
            {children}
        </motion.div>
    )
}

function SectionTitle({ index, label, title, lede }: { index: string; label: string; title: ReactNode; lede?: string }) {
    return (
        <Reveal className="grid gap-6 border-b pb-10 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
                <p className="ledger-label">
                    {index} — {label}
                </p>
                <h2 className="mt-4 font-serif text-[clamp(2.4rem,4.6vw,4rem)] leading-[1] tracking-[-0.01em]">{title}</h2>
            </div>
            {lede && <p className="text-lg leading-relaxed text-muted-foreground md:col-span-5">{lede}</p>}
        </Reveal>
    )
}

// ── Fonctionnalités ─────────────────────────────────────────────────────────
const FEATURES = [
    { icon: FileText, title: "Factures & devis", text: "Créez des documents professionnels en quelques clics : numérotation automatique, TVA calculée, envoi par email et export PDF." },
    { icon: Users, title: "Clients", text: "Toutes les coordonnées au même endroit, avec l'historique des factures, des devis et du chiffre d'affaires de chaque client." },
    { icon: Calculator, title: "Comptabilité", text: "Plan comptable, écritures, exercices fiscaux : vos ventes alimentent le journal, sans ressaisie." },
    { icon: BarChart3, title: "Rapports", text: "Tableau de bord en temps réel, compte de résultat, bilan et flux de trésorerie pour piloter l'activité." },
    { icon: Layout, title: "Modèles", text: "Des modèles de documents classiques, modernes ou minimalistes, à personnaliser avec votre identité." },
    { icon: Shield, title: "Rôles & sécurité", text: "Invitez votre équipe avec des rôles propriétaire, administrateur ou utilisateur. Vos données restent les vôtres." },
]

export function Features() {
    return (
        <section id="features" className="scroll-mt-20 px-4 py-24 sm:px-6 md:py-32 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <SectionTitle
                    index="01"
                    label="Fonctionnalités"
                    title={<>Tout votre cycle de facturation, <em className="text-primary">au même endroit.</em></>}
                    lede="Du premier devis à l'écriture comptable, Factura garde chaque chiffre à sa place — et vous laisse le temps de travailler."
                />
                <div className="mt-12 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
                    {FEATURES.map(({ icon: Icon, title, text }, i) => (
                        <article key={title} className="group bg-card transition-colors hover:bg-background">
                            <Reveal delay={(i % 3) * 0.08} className="flex h-full flex-col gap-10 p-6 md:p-8">
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                                    <span className="flex size-10 items-center justify-center rounded-lg border bg-background transition-colors group-hover:border-primary/40 group-hover:text-primary">
                                        <Icon className="size-[18px]" />
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold tracking-[-0.02em]">{title}</h3>
                                    <p className="mt-2 leading-relaxed text-muted-foreground">{text}</p>
                                </div>
                            </Reveal>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}

// ── Méthode : du devis à l'encaissement ─────────────────────────────────────
const STEPS = [
    { title: "Chiffrez", text: "Composez un devis à partir de votre catalogue de prestations. Le client le reçoit par email." },
    { title: "Facturez", text: "Le devis accepté devient une facture en un clic, avec sa numérotation et sa TVA." },
    { title: "Encaissez", text: "Enregistrez le paiement : la facture passe à « Payée » et l'écriture rejoint votre journal." },
]

export function Method() {
    const ref = useRef<HTMLDivElement>(null)
    const inView = useInView(ref, { once: true, margin: "0px 0px -20% 0px" })
    const reduce = useReducedMotion()
    return (
        <section id="method" className="scroll-mt-20 border-y bg-secondary/50 px-4 py-24 sm:px-6 md:py-32 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <SectionTitle index="02" label="Méthode" title={<>Du devis à l&apos;encaissement, <em className="text-primary">sans ressaisie.</em></>} />
                <div ref={ref} className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
                    {/* Fil qui relie les étapes */}
                    <motion.span
                        aria-hidden="true"
                        initial={reduce ? false : { scaleX: 0 }}
                        animate={inView ? { scaleX: 1 } : undefined}
                        transition={{ duration: 1.6, ease: EASE }}
                        className="absolute left-0 right-0 top-5 hidden h-px origin-left bg-foreground/20 md:block"
                    />
                    {STEPS.map((step, i) => (
                        <motion.div
                            key={step.title}
                            initial={reduce ? false : { opacity: 0, y: 16 }}
                            animate={inView ? { opacity: 1, y: 0 } : undefined}
                            transition={{ duration: 0.8, delay: 0.3 + i * 0.25, ease: EASE }}
                            className="relative"
                        >
                            <span className="relative flex size-10 items-center justify-center rounded-full border bg-background font-mono text-sm">
                                {i + 1}
                            </span>
                            <h3 className="mt-6 font-serif text-3xl">{step.title}</h3>
                            <p className="mt-2 max-w-sm leading-relaxed text-muted-foreground">{step.text}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

// ── Tarifs ──────────────────────────────────────────────────────────────────
const PLANS = [
    {
        name: "Gratuit",
        price: "0",
        description: "Pour découvrir Factura",
        features: ["1 utilisateur", "10 clients", "20 factures par mois", "Modèles prédéfinis", "Support par email"],
        cta: "Commencer",
    },
    {
        name: "Petite entreprise",
        price: "29,99",
        description: "Pour les indépendants et petites équipes",
        features: ["10 utilisateurs", "100 clients", "500 factures par mois", "Modèles personnalisés", "Comptabilité de base", "Support prioritaire"],
        cta: "Choisir ce plan",
        featured: true,
    },
    {
        name: "Grande entreprise",
        price: "99,99",
        description: "Pour les organisations structurées",
        features: ["50 utilisateurs", "Clients illimités", "Factures illimitées", "Comptabilité avancée", "Rapports & analytics", "Support dédié"],
        cta: "Nous contacter",
    },
]

export function Pricing() {
    return (
        <section id="pricing" className="scroll-mt-20 px-4 py-24 sm:px-6 md:py-32 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <SectionTitle
                    index="03"
                    label="Tarifs"
                    title={<>Commencez gratuitement, <em className="text-primary">grandissez ensuite.</em></>}
                    lede="Sans engagement, sans carte bancaire pour le plan gratuit. Changez de plan quand votre activité le demande."
                />
                <div className="mt-12 grid gap-px overflow-hidden rounded-xl border bg-border lg:grid-cols-3">
                    {PLANS.map((plan, i) => (
                        <div key={plan.name} className={plan.featured ? "bg-primary text-primary-foreground" : "bg-card"}>
                            <Reveal delay={i * 0.08} className="flex h-full flex-col p-6 md:p-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                                    {plan.featured && (
                                        <span className="rounded-[5px] border border-primary-foreground/30 px-1.5 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.1em]">
                                            Recommandé
                                        </span>
                                    )}
                                </div>
                                <p className={cn("mt-1 text-sm", plan.featured ? "text-primary-foreground/70" : "text-muted-foreground")}>
                                    {plan.description}
                                </p>
                                <p className="mt-8 flex items-baseline gap-1.5">
                                    <span className="font-mono text-5xl font-medium tracking-[-0.04em]">{plan.price}</span>
                                    <span className={cn("text-sm", plan.featured ? "text-primary-foreground/70" : "text-muted-foreground")}>€ / mois</span>
                                </p>
                                <ul className={cn("mt-8 flex-1 space-y-3 border-t pt-6", plan.featured && "border-primary-foreground/20")}>
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-2.5 text-sm">
                                            <Check className={cn("size-4 shrink-0", plan.featured ? "text-primary-foreground" : "text-primary")} />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <Button
                                    asChild
                                    size="lg"
                                    variant={plan.featured ? "secondary" : "outline"}
                                    className={cn("mt-8 w-full", plan.featured && "bg-primary-foreground text-primary hover:bg-primary-foreground/90")}
                                >
                                    <Link href={paths.signup}>{plan.cta}</Link>
                                </Button>
                            </Reveal>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

// ── Appel final ─────────────────────────────────────────────────────────────
export function FinalCta() {
    return (
        <section className="px-4 pb-24 sm:px-6 md:pb-32 lg:px-8">
            <Reveal className="mx-auto max-w-7xl">
                <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-16 text-primary-foreground md:px-16 md:py-24">
                    <div aria-hidden="true" className="ledger-paper absolute inset-0 opacity-40" />
                    <div className="relative grid gap-10 md:grid-cols-12 md:items-end">
                        <h2 className="font-serif text-[clamp(2.6rem,5.5vw,5rem)] leading-[0.95] md:col-span-8">
                            Vos comptes, <em>enfin en ordre.</em>
                        </h2>
                        <div className="flex flex-col items-start gap-4 md:col-span-4 md:items-end">
                            <Button asChild size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                                <Link href={paths.signup}>
                                    Ouvrir mon registre
                                    <ArrowRight />
                                </Link>
                            </Button>
                            <p className="font-mono text-xs uppercase tracking-[0.1em] text-primary-foreground/70">
                                Gratuit · Sans carte bancaire
                            </p>
                        </div>
                    </div>
                </div>
            </Reveal>
        </section>
    )
}

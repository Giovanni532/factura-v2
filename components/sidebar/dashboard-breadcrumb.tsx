"use client"

import { motion } from "framer-motion"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import Link from "next/link"
import React from "react"
import { paths } from "@/paths"

// Mapping des mots anglais vers français
const frenchTranslations: Record<string, string> = {
    "invoices": "Factures",
    "quotes": "Devis",
    "clients": "Clients",
    "services": "Services",
    "templates": "Modèles",
    "accounting": "Comptabilité",
    "settings": "Paramètres",
    "profile": "Profil",
    "company": "Entreprise",
    "billing": "Facturation",
    "teams": "Équipe",
    "chart-of-accounts": "Plan comptable",
    "journal-entries": "Écritures comptables",
    "payments": "Paiements",
    "reports": "Rapports",
    "fiscal-years": "Exercices fiscaux",
    "categories": "Catégories",
    "create": "Créer",
    "edit": "Modifier"
}

export function DashboardBreadcrumb() {
    const pathname = usePathname()
    const pathSegments = pathname.split('/').filter(Boolean)

    // Si on est sur la page dashboard, afficher juste "Dashboard"
    if (pathSegments.length === 1 && pathSegments[0] === 'dashboard') {
        return (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex h-12 min-w-0 flex-1 shrink items-center gap-2"
            >
                <div className="flex w-full min-w-0 items-center justify-between">
                    <motion.div
                        className="flex min-w-0 items-center gap-1 lg:gap-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                    >
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink asChild>
                                        <Link href={paths.dashboard}>Tableau de bord</Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </motion.div>
                </div>
            </motion.div>
        )
    }

    // Construire le breadcrumb dynamiquement
    const buildBreadcrumbItems = () => {
        const items = [
            {
                label: "Tableau de bord",
                href: paths.dashboard,
                isLink: true
            }
        ]

        // Gérer les chemins spéciaux
        if (pathSegments.includes('accounting')) {
            items.push({
                label: frenchTranslations.accounting,
                href: paths.accounting.dashboard,
                isLink: true
            })

            // Sous-sections de comptabilité
            if (pathSegments.includes('chart-of-accounts')) {
                items.push({
                    label: frenchTranslations['chart-of-accounts'],
                    href: paths.accounting.chartOfAccounts,
                    isLink: false
                })
            } else if (pathSegments.includes('journal-entries')) {
                items.push({
                    label: frenchTranslations['journal-entries'],
                    href: paths.accounting.journalEntries,
                    isLink: false
                })
            } else if (pathSegments.includes('payments')) {
                items.push({
                    label: frenchTranslations.payments,
                    href: paths.accounting.payments,
                    isLink: false
                })
            } else if (pathSegments.includes('reports')) {
                items.push({
                    label: frenchTranslations.reports,
                    href: paths.accounting.reports,
                    isLink: false
                })
            } else if (pathSegments.includes('fiscal-years')) {
                items.push({
                    label: frenchTranslations['fiscal-years'],
                    href: paths.accounting.fiscalYears,
                    isLink: false
                })
            }
        } else if (pathSegments.includes('settings')) {
            items.push({
                label: frenchTranslations.settings,
                href: paths.settings.profile,
                isLink: true
            })

            // Sous-sections des paramètres
            if (pathSegments.includes('profile')) {
                items.push({
                    label: frenchTranslations.profile,
                    href: paths.settings.profile,
                    isLink: false
                })
            } else if (pathSegments.includes('company')) {
                items.push({
                    label: frenchTranslations.company,
                    href: paths.settings.company,
                    isLink: false
                })
            } else if (pathSegments.includes('billing')) {
                items.push({
                    label: frenchTranslations.billing,
                    href: paths.settings.billing,
                    isLink: false
                })
            } else if (pathSegments.includes('teams')) {
                items.push({
                    label: frenchTranslations.teams,
                    href: paths.settings.teams,
                    isLink: false
                })
            }
        } else {
            // Gérer les autres sections (invoices, quotes, clients, etc.)
            const mainSection = pathSegments[1] // dashboard/[section]
            if (mainSection && frenchTranslations[mainSection]) {
                items.push({
                    label: frenchTranslations[mainSection],
                    href: getMainSectionPath(mainSection),
                    isLink: true
                })

                // Gérer les sous-sections
                if (pathSegments.includes('create')) {
                    items.push({
                        label: frenchTranslations.create,
                        href: "",
                        isLink: false
                    })
                } else if (pathSegments.includes('edit')) {
                    items.push({
                        label: frenchTranslations.edit,
                        href: "",
                        isLink: false
                    })
                } else if (pathSegments.includes('categories')) {
                    items.push({
                        label: frenchTranslations.categories,
                        href: paths.services.categories,
                        isLink: false
                    })
                }
            }
        }

        return items
    }

    const breadcrumbItems = buildBreadcrumbItems()

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex h-12 min-w-0 flex-1 shrink items-center gap-2"
        >
            <div className="flex w-full min-w-0 items-center justify-between">
                <motion.div
                    className="flex min-w-0 items-center gap-1 lg:gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
                    <motion.div
                        className="min-w-0 text-sm font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                    >
                        <Breadcrumb>
                            <BreadcrumbList>
                                {breadcrumbItems.map((item, index) => (
                                    <React.Fragment key={index}>
                                        {/* En mobile, seul le dernier niveau reste visible */}
                                        <BreadcrumbItem className={index < breadcrumbItems.length - 1 ? "hidden sm:inline-flex" : "min-w-0"}>
                                            {item.isLink ? (
                                                <BreadcrumbLink asChild>
                                                    <Link href={item.href}>{item.label}</Link>
                                                </BreadcrumbLink>
                                            ) : (
                                                <span className="truncate text-foreground">{item.label}</span>
                                            )}
                                        </BreadcrumbItem>
                                        {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator className="hidden sm:inline-flex" />}
                                    </React.Fragment>
                                ))}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </motion.div>
                </motion.div>
            </div>
        </motion.div>
    )
}

// Fonction utilitaire pour obtenir le chemin principal d'une section
function getMainSectionPath(section: string): string {
    switch (section) {
        case 'invoices':
            return paths.invoices.list
        case 'quotes':
            return paths.quotes.list
        case 'clients':
            return paths.clients.list
        case 'services':
            return paths.services.list
        case 'templates':
            return paths.templates.list
        default:
            return paths.dashboard
    }
}
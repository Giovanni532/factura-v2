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
    "templates": "Modèles"
}

export function DashboardBreadcrumb() {

    const pathname = usePathname()
    const pathSegments = pathname.split('/').filter(Boolean)

    // Si on est sur la page dashboard, afficher juste "Dashboard"
    if (pathSegments.length === 1 && pathSegments[0] === 'dashboard') {
        return (
            <motion.header
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear"
            >
                <div className="flex w-full items-center justify-between px-4 lg:gap-2 lg:px-6">
                    <motion.div
                        className="flex items-center gap-1 lg:gap-2"
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
                                        <Link href={paths.dashboard}>Dashboard</Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </motion.div>
                </div>
            </motion.header>
        )
    }

    // Sinon, afficher "Dashboard > Page actuelle"
    const currentPage = pathSegments[pathSegments.length - 1]
    const displayText = frenchTranslations[currentPage] || currentPage.charAt(0).toUpperCase() + currentPage.slice(1)

    return (
        <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear"
        >
            <div className="flex w-full items-center justify-between px-4 lg:gap-2 lg:px-6">
                <motion.div
                    className="flex items-center gap-1 lg:gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
                    <motion.h1
                        className="text-base font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                    >
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink asChild>
                                        <Link href={paths.dashboard}>Dashboard</Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    {displayText}
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </motion.h1>
                </motion.div>
            </div>
        </motion.header>
    )
}
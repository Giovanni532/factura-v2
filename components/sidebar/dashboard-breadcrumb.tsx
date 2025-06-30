"use client"

import { motion } from "framer-motion"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import Link from "next/link"
import React from "react"

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
    const breadcrumbs = pathname.split('/').map((path, index) => {
        const pathLink = `/${pathname.split('/').slice(0, index + 1).join('/')}`

        // Traduire le mot si il existe dans le mapping, sinon utiliser la première lettre en majuscule
        const displayText = frenchTranslations[path] || path.charAt(0).toUpperCase() + path.slice(1)

        return (
            <React.Fragment key={path}>
                {index !== 0 && index !== 1 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/${pathLink}`}>{displayText}</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
            </React.Fragment>
        )
    })

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
                                {breadcrumbs}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </motion.h1>
                </motion.div>
            </div>
        </motion.header>
    )
}
"use client"

import * as React from "react"
import {
    IconDashboard,
    IconUsers,
    IconTemplate,
    IconReceipt,
    IconInnerShadowTop,
    Icon,
    IconFileInvoice,
    IconCalculator,
    IconChartBar,
    IconCreditCard,
    IconReportMoney,
    IconCalendarTime,
    IconBriefcase,
    IconCategory,
} from "@tabler/icons-react"

import { DashboardDocuments } from "@/components/sidebar/dashboard-recent"
import { DashboardMain } from "@/components/sidebar/dashboard-main"
import { DashboardUser } from "@/components/sidebar/dashboard-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { paths } from "@/paths"

interface NavItem {
    title: string
    url: string
    icon: Icon
    subItems?: {
        title: string
        url: string
        icon?: Icon
    }[]
}


const sidebarData = {
    mainNavigation: [
        {
            title: "Tableau de bord",
            url: paths.dashboard,
            icon: IconDashboard,
        },
        {
            title: "Factures",
            url: paths.invoices.list,
            icon: IconReceipt,
            subItems: [
                {
                    title: "Toutes les factures",
                    url: paths.invoices.list,
                },
                {
                    title: "Créer une facture",
                    url: paths.invoices.create,
                },
            ],
        },
        {
            title: "Devis",
            url: paths.quotes.list,
            icon: IconFileInvoice,
            subItems: [
                {
                    title: "Tous les devis",
                    url: paths.quotes.list,
                },
                {
                    title: "Créer un devis",
                    url: paths.quotes.create,
                },
            ],
        },
        {
            title: "Clients",
            url: paths.clients.list,
            icon: IconUsers,
            subItems: [
                {
                    title: "Tous les clients",
                    url: paths.clients.list,
                },
                {
                    title: "Ajouter un client",
                    url: paths.clients.create,
                },
            ],
        },
        {
            title: "Prestations",
            url: paths.services.list,
            icon: IconBriefcase,
            subItems: [
                {
                    title: "Mes prestations",
                    url: paths.services.list,
                },
                {
                    title: "Ajouter une prestation",
                    url: paths.services.create,
                },
                {
                    title: "Catégories",
                    url: paths.services.categories,
                    icon: IconCategory,
                },
            ],
        },
        {
            title: "Templates",
            url: paths.templates.list,
            icon: IconTemplate,
            subItems: [
                {
                    title: "Mes templates",
                    url: paths.templates.list,
                },
                {
                    title: "Créer un template",
                    url: paths.templates.create,
                },
            ],
        },
        {
            title: "Comptabilité",
            url: paths.accounting.dashboard,
            icon: IconCalculator,
            subItems: [
                {
                    title: "Tableau de bord",
                    url: paths.accounting.dashboard,
                    icon: IconChartBar,
                },
                {
                    title: "Plan comptable",
                    url: paths.accounting.chartOfAccounts,
                    icon: IconReportMoney,
                },
                {
                    title: "Écritures",
                    url: paths.accounting.journalEntries,
                    icon: IconCreditCard,
                },
                {
                    title: "Paiements",
                    url: paths.accounting.payments,
                    icon: IconCreditCard,
                },
                {
                    title: "Rapports",
                    url: paths.accounting.reports,
                    icon: IconChartBar,
                },
                {
                    title: "Exercices",
                    url: paths.accounting.fiscalYears,
                    icon: IconCalendarTime,
                },
            ],
        },
    ] as NavItem[],
}

interface DashboardSidebarProps extends React.ComponentProps<typeof Sidebar> {
    currentUser: {
        name: string
        email: string
        avatar: string
    }
}

export function DashboardSidebar({ currentUser, ...props }: DashboardSidebarProps) {
    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            <a href={paths.dashboard}>
                                <IconInnerShadowTop className="!size-5" />
                                <span className="text-base font-semibold">Factura</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <DashboardMain navigationItems={sidebarData.mainNavigation} />
                <DashboardDocuments />
            </SidebarContent>
            <SidebarFooter>
                <DashboardUser currentUser={currentUser} />
            </SidebarFooter>
        </Sidebar>
    )
}

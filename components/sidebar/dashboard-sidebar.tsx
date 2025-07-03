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
import Link from "next/link"

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
            icon: IconReceipt
        },
        {
            title: "Devis",
            url: paths.quotes.list,
            icon: IconFileInvoice,
        },
        {
            title: "Clients",
            url: paths.clients.list,
            icon: IconUsers,
        },
        {
            title: "Prestations",
            url: paths.services.list,
            icon: IconBriefcase,
        },
        {
            title: "Templates",
            url: paths.templates.list,
            icon: IconTemplate,
        },
        {
            title: "Comptabilité",
            url: paths.accounting.dashboard,
            icon: IconCalculator,
            subItems: [
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

interface RecentDocument {
    id: string
    number: string
    type: 'invoice' | 'quote'
    status: string
    total: number
    clientName: string
    createdAt: Date
}

interface DashboardSidebarProps extends React.ComponentProps<typeof Sidebar> {
    currentUser: {
        name: string
        email: string
        avatar: string
    }
    recentDocuments?: RecentDocument[]
}

export function DashboardSidebar({ currentUser, recentDocuments = [], ...props }: DashboardSidebarProps) {
    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            <Link href={paths.dashboard}>
                                <IconInnerShadowTop className="!size-5" />
                                <span className="text-base font-semibold">Factura</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <DashboardMain navigationItems={sidebarData.mainNavigation} />
                <DashboardDocuments recentDocuments={recentDocuments} />
            </SidebarContent>
            <SidebarFooter>
                <DashboardUser currentUser={currentUser} />
            </SidebarFooter>
        </Sidebar>
    )
}

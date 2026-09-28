"use client"

import { useRouter } from "next/navigation"
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { paths } from "@/paths"
import { formatDate, formatCurrency, cn } from "@/lib/utils"
import { getStatus, toneDot } from "@/lib/status"

interface RecentDocument {
    id: string
    number: string
    type: 'invoice' | 'quote'
    status: string
    total: number
    clientName: string
    createdAt: Date
}

interface DashboardDocumentsProps {
    recentDocuments: RecentDocument[]
}

export function DashboardDocuments({ recentDocuments }: DashboardDocumentsProps) {
    const router = useRouter()

    const handleDocumentClick = (document: RecentDocument) => {
        if (document.type === 'invoice') {
            router.push(`${paths.invoices.list}?id=${document.id}`)
        } else {
            router.push(`${paths.quotes.list}?id=${document.id}`)
        }
    }

    return (
        <SidebarGroup className="min-h-0 flex-1 group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Activité récente</SidebarGroupLabel>
            {recentDocuments.length === 0 ? (
                <p className="px-2 text-sm text-muted-foreground">Aucun document récent</p>
            ) : (
                <SidebarMenu className="hide-scrollbar max-h-[440px] gap-0 overflow-auto">
                    {recentDocuments.map((document) => {
                        const { tone, label } = getStatus(document.status, document.type)
                        return (
                            <SidebarMenuItem key={`${document.type}-${document.id}`}>
                                <button
                                    type="button"
                                    onClick={() => handleDocumentClick(document)}
                                    className="group/doc grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-2.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-sidebar-accent"
                                >
                                    <span
                                        aria-hidden="true"
                                        title={label}
                                        className={cn("size-1.5 rounded-full", toneDot[tone])}
                                    />
                                    <span className="min-w-0">
                                        <span className="block font-mono text-[12px] leading-tight">
                                            {document.number}
                                            <span className="sr-only"> — {label}</span>
                                        </span>
                                        <span className="block truncate text-[12px] text-muted-foreground">
                                            {document.clientName} · {formatDate(document.createdAt, true, true)}
                                        </span>
                                    </span>
                                    <span className="font-mono text-[12px] tabular-nums text-sidebar-foreground/80">
                                        {formatCurrency(document.total, "EUR")}
                                    </span>
                                </button>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            )}
        </SidebarGroup>
    )
}

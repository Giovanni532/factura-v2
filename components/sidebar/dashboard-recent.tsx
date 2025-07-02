"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { FileText, Receipt, Calendar, Euro } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { paths } from "@/paths"

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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
            case 'accepted':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            case 'sent':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
            case 'draft':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
            case 'overdue':
            case 'expired':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'paid': return 'Payée'
            case 'sent': return 'Envoyée'
            case 'draft': return 'Brouillon'
            case 'overdue': return 'En retard'
            case 'accepted': return 'Accepté'
            case 'expired': return 'Expiré'
            case 'cancelled': return 'Annulé'
            default: return status
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount)
    }

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: '2-digit',
        }).format(new Date(date))
    }

    const handleDocumentClick = (document: RecentDocument) => {
        if (document.type === 'invoice') {
            router.push(`${paths.invoices.list}?id=${document.id}`)
        } else {
            router.push(`${paths.quotes.list}?id=${document.id}`)
        }
    }

    if (recentDocuments.length === 0) {
        return (
            <SidebarGroup className="group-data-[collapsible=icon]:hidden">
                <SidebarGroupLabel>Activités récentes</SidebarGroupLabel>
                <SidebarMenu>
                    <SidebarMenuItem className="text-muted-foreground text-sm">
                        Aucun document récent
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroup>
        )
    }

    return (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Activités récentes</SidebarGroupLabel>
            <SidebarMenu>
                {recentDocuments.map((document) => (
                    <SidebarMenuItem
                        key={`${document.type}-${document.id}`}
                        onClick={() => handleDocumentClick(document)}
                        className="cursor-pointer hover:bg-accent"
                    >
                        <div className="flex items-center gap-2 w-full">
                            {document.type === 'invoice' ? (
                                <FileText className="w-4 h-4 text-blue-600" />
                            ) : (
                                <Receipt className="w-4 h-4 text-purple-600" />
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium truncate">
                                        {document.number}
                                    </span>
                                    <Badge
                                        variant="secondary"
                                        className={`text-xs ${getStatusColor(document.status)}`}
                                    >
                                        {getStatusLabel(document.status)}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="truncate">{document.clientName}</span>
                                    <span>•</span>
                                    <span>{formatCurrency(document.total)}</span>
                                    <span>•</span>
                                    <Calendar className="w-3 h-3" />
                                    <span>{formatDate(document.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}

"use client"

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
} from "@/components/ui/sidebar"

export function DashboardDocuments() {
    return (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Activités récentes</SidebarGroupLabel>
            <SidebarMenu>
                {/* Les activités récentes seront ajoutées ici plus tard */}
            </SidebarMenu>
        </SidebarGroup>
    )
}

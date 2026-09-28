"use client"

import { type Icon } from "@tabler/icons-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { paths } from "@/paths"

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"

type NavItem = {
    title: string
    url: string
    icon?: Icon
    subItems?: {
        title: string
        url: string
    }[]
}

export function DashboardMain({ navigationItems }: { navigationItems: NavItem[] }) {
    const pathname = usePathname()

    // Le tableau de bord n'est actif que sur sa propre URL ; les autres sections
    // le sont aussi sur leurs sous-pages.
    const isActive = (url: string) =>
        url === paths.dashboard ? pathname === url : pathname === url || pathname.startsWith(`${url}/`)

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Registre</SidebarGroupLabel>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    {navigationItems.map((item) => {
                        const active = isActive(item.url)
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                                    <Link href={item.url}>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                                {/* Sous-pages visibles dès qu'on est dans la section */}
                                {item.subItems && active && (
                                    <SidebarMenuSub>
                                        {item.subItems.map((subItem) => (
                                            <SidebarMenuSubItem key={subItem.title}>
                                                <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                                                    <Link href={subItem.url}>{subItem.title}</Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                )}
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}

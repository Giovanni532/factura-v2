"use client"

import {
    IconCirclePlusFilled,
    IconDots,
    type Icon
} from "@tabler/icons-react"
import Link from "next/link"
import { paths } from "@/paths"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"

export function DashboardMain({
    navigationItems,
}: {
    navigationItems: {
        title: string
        url: string
        icon?: Icon
        subItems?: {
            title: string
            url: string
        }[]
    }[]
}) {
    const { isMobile } = useSidebar()

    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    {navigationItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild>
                                <Link href={item.url}>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                            {item.subItems && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <SidebarMenuAction
                                            showOnHover
                                            className="data-[state=open]:bg-accent rounded-sm"
                                        >
                                            <IconDots />
                                            <span className="sr-only">Plus d'options</span>
                                        </SidebarMenuAction>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        className="w-48 rounded-lg"
                                        side={isMobile ? "bottom" : "right"}
                                        align={isMobile ? "end" : "start"}
                                    >
                                        {item.subItems.map((subItem) => (
                                            <DropdownMenuItem key={subItem.title} asChild>
                                                <Link href={subItem.url} className="flex items-center">
                                                    {item.icon && <item.icon className="mr-2" />}
                                                    <span>{subItem.title}</span>
                                                </Link>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}

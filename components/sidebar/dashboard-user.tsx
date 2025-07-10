"use client"

import {
    IconCreditCard,
    IconDotsVertical,
    IconLogout,
    IconNotification,
    IconUserCircle,
    IconBuilding,
    IconUsers,
} from "@tabler/icons-react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { paths } from "@/paths"
import Link from "next/link"
import { Button } from "../ui/button"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

export function DashboardUser({
    currentUser,
}: {
    currentUser: {
        name: string
        email: string
        avatar: string
        role: string
    }
}) {
    const { isMobile } = useSidebar()
    const router = useRouter()

    const handleSignOut = () => {
        authClient.signOut()
        router.push(paths.login)
        router.refresh()
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg grayscale">
                                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                                <AvatarFallback className="rounded-lg">{currentUser.name.charAt(0)} {currentUser.name.charAt(1)}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{currentUser.name}</span>
                                <span className="text-muted-foreground truncate text-xs">
                                    {currentUser.email}
                                </span>
                            </div>
                            <IconDotsVertical className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                                    <AvatarFallback className="rounded-lg">{currentUser.name.charAt(0)} {currentUser.name.charAt(1)}</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{currentUser.name}</span>
                                    <span className="text-muted-foreground truncate text-xs">
                                        {currentUser.email}
                                    </span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild>
                                <Link href={paths.settings.profile} className="cursor-pointer flex items-center">
                                    <IconUserCircle className="mr-2" />
                                    Mon profil
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={paths.settings.teams} className="cursor-pointer flex items-center">
                                    <IconUsers className="mr-2" />
                                    Equipes
                                </Link>
                            </DropdownMenuItem>
                            {currentUser.role === "owner" && (
                                <DropdownMenuItem asChild>
                                    <Link href={paths.settings.company} className="cursor-pointer flex items-center">
                                        <IconBuilding className="mr-2" />
                                        Mon entreprise
                                    </Link>
                                </DropdownMenuItem>
                            )}
                            {currentUser.role === "owner" && (
                                <DropdownMenuItem asChild>
                                    <Link href={paths.settings.billing} className="cursor-pointer flex items-center">
                                        <IconCreditCard className="mr-2" />
                                        Facturation
                                    </Link>
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="cursor-pointer">
                            <Button variant="destructive" className="flex items-center w-full" onClick={handleSignOut}>
                                <IconLogout className="mr-2 text-white" />
                                Déconnexion
                            </Button>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}

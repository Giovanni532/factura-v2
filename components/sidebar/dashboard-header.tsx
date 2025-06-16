import { IconSearch } from "@tabler/icons-react"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { paths } from "@/paths"
import Link from "next/link"

export function DashboardHeader() {
    return (
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mx-2 data-[orientation=vertical]:h-4"
                />
                <Link href={paths.dashboard} className="flex items-center gap-2">
                    <h1 className="text-base font-medium">Factura</h1>
                </Link>
                <div className="ml-auto flex items-center gap-2">
                    <div className="relative hidden sm:flex">
                        <IconSearch className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Rechercher..."
                            className="pl-8 w-64"
                        />
                    </div>
                    <ThemeSwitcher />
                </div>
            </div>
        </header>
    )
}

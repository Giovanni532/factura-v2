import { IconSearch } from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { DashboardBreadcrumb } from "./dashboard-breadcrumb"

export function DashboardHeader() {
    return (
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <DashboardBreadcrumb />
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

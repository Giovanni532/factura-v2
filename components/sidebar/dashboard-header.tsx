import { ThemeSwitcher } from "@/components/theme-switcher"
import { DashboardBreadcrumb } from "./dashboard-breadcrumb"
import SearchBar from "./dashboard-searchbar"

export function DashboardHeader() {
    return (
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <DashboardBreadcrumb />
                <div className="ml-auto flex items-center gap-2">
                    <SearchBar />
                    <ThemeSwitcher />
                </div>
            </div>
        </header>
    )
}

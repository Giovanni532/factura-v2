import { DashboardHeader } from "@/components/sidebar/dashboard-header"
import { DashboardSidebar } from "@/components/sidebar/dashboard-sidebar"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getUserWithCompany } from "@/db/queries/company"
import { getRecentDocuments } from "@/db/queries/invoice"

interface RecentDocument {
    id: string
    number: string
    type: 'invoice' | 'quote'
    status: string
    total: number
    clientName: string
    createdAt: Date
}


export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    const user = session?.user

    // Récupérer les documents récents côté serveur
    let recentDocuments: RecentDocument[] = []
    if (user) {
        try {
            const userWithCompany = await getUserWithCompany(user.id)
            const companyId = userWithCompany.company?.id

            if (companyId) {
                recentDocuments = await getRecentDocuments(companyId)
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des documents récents:", error)
        }
    }

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <DashboardSidebar
                variant="inset"
                currentUser={{
                    name: user?.name || "User",
                    email: user?.email || "",
                    avatar: user?.image || "/avatars/default.jpg"
                }}
                recentDocuments={recentDocuments}
            />
            <SidebarInset>
                <DashboardHeader />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                            <div className="px-4 lg:px-6">
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}

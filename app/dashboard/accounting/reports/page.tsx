import { ReportsClient } from "@/components/accounting/reports-client"
import { getAccountingStats } from "@/db/queries/accounting"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getUserWithCompany } from "@/db/queries/company"

export default async function ReportsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    const user = session?.user
    let stats = null

    if (user) {
        try {
            const userWithCompany = await getUserWithCompany(user.id)
            const companyId = userWithCompany.company?.id

            if (companyId) {
                stats = await getAccountingStats(companyId)
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des statistiques pour les rapports:", error)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Rapports</h1>
                <p className="text-muted-foreground">
                    Consultez vos rapports financiers et comptables.
                </p>
            </div>

            <ReportsClient initialStats={stats} />
        </div>
    )
} 
import { ReportsClient } from "@/components/accounting/reports-client"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getUserWithCompanyCached, getAccountingStatsCached } from "@/lib/cache"

export default async function ReportsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    const user = session?.user
    let stats = null

    if (user) {
        try {
            const userWithCompany = await getUserWithCompanyCached(user.id)
            const companyId = userWithCompany.company?.id

            if (companyId) {
                stats = await getAccountingStatsCached(companyId)
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des statistiques pour les rapports:", error)
        }
    }

    return (
        <div className="space-y-6">
            <ReportsClient initialStats={stats} />
        </div>
    )
} 
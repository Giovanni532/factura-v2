import { ReportsClient } from "@/components/accounting/reports-client"
import { getSession } from "@/lib/get-session"
import { getUserWithCompanyCached, getAccountingStatsCached } from "@/lib/cache"

export default async function ReportsPage() {
    const session = await getSession()

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
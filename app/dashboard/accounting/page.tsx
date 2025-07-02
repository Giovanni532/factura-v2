import { Suspense } from "react"
import { AccountingOverview } from "@/components/accounting/accounting-overview"
import { AccountingStatsCards } from "@/components/accounting/accounting-stats-cards"
import { getAccountingStats, getRevenueHistory, getRecentAccountingActivities } from "@/db/queries/accounting"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getUserWithCompany } from "@/db/queries/company"

export default async function AccountingPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    const user = session?.user
    let stats = undefined
    let revenueHistory = undefined
    let recentActivities = undefined

    if (user) {
        try {
            const userWithCompany = await getUserWithCompany(user.id)
            const companyId = userWithCompany.company?.id

            if (companyId) {
                // Récupérer les statistiques
                stats = await getAccountingStats(companyId)

                // Récupérer l'historique des revenus (12 derniers mois)
                revenueHistory = await getRevenueHistory(companyId, 12)

                // Récupérer les activités récentes (10 dernières activités)
                recentActivities = await getRecentAccountingActivities(companyId, 10)
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des données comptables:", error)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Comptabilité</h1>
                <p className="text-muted-foreground">
                    Gérez votre comptabilité, vos écritures et vos rapports financiers.
                </p>
            </div>

            <Suspense fallback={<div>Chargement...</div>}>
                <AccountingStatsCards stats={stats} />
            </Suspense>

            <Suspense fallback={<div>Chargement...</div>}>
                <AccountingOverview
                    stats={stats}
                    revenueHistory={revenueHistory}
                    recentActivities={recentActivities}
                />
            </Suspense>
        </div>
    )
} 
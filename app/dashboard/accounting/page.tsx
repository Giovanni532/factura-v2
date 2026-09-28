import { AccountingOverview } from "@/components/accounting/accounting-overview"
import { AccountingStatsCards } from "@/components/accounting/accounting-stats-cards"
import { getSession } from "@/lib/get-session"
import { getUserWithCompanyCached, getAccountingStatsCached, getRevenueHistoryCached, getRecentAccountingActivitiesCached } from "@/lib/cache"
import { PageHeader } from "@/components/ledger"

export default async function AccountingPage() {
    const session = await getSession()

    const user = session?.user
    let stats = undefined
    let revenueHistory = undefined
    let recentActivities = undefined

    if (user) {
        try {
            const userWithCompany = await getUserWithCompanyCached(user.id)
            const companyId = userWithCompany.company?.id

            if (companyId) {
                // Récupérer les données avec cache en parallèle
                const [statsData, revenueData, activitiesData] = await Promise.all([
                    getAccountingStatsCached(companyId),
                    getRevenueHistoryCached(companyId, 12),
                    getRecentAccountingActivitiesCached(companyId, 10)
                ]);

                stats = statsData;
                revenueHistory = revenueData;
                recentActivities = activitiesData;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des données comptables:", error)
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader title="Comptabilité" description="Vue d'ensemble de vos comptes, écritures et rapports financiers" />

            <AccountingStatsCards stats={stats} />

            <AccountingOverview
                stats={stats}
                revenueHistory={revenueHistory}
                recentActivities={recentActivities as any}
            />
        </div>
    )
} 
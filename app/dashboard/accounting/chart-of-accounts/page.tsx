import { ChartOfAccountsClient } from "@/components/accounting/chart-of-accounts-client"
import { getSession } from "@/lib/get-session"
import { getUserWithCompanyCached, getChartOfAccountsCached } from "@/lib/cache"
import { PageHeader } from "@/components/ledger"

export default async function ChartOfAccountsPage() {
    const session = await getSession()

    const user = session?.user
    let accounts: any[] = []

    if (user) {
        try {
            const userWithCompany = await getUserWithCompanyCached(user.id)
            const companyId = userWithCompany.company?.id

            if (companyId) {
                accounts = await getChartOfAccountsCached(companyId)
            }
        } catch (error) {
            console.error("Erreur lors de la récupération du plan comptable:", error)
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader eyebrow="Comptabilité" title="Plan comptable" description="Les comptes de votre entreprise, classés par nature" />

            <ChartOfAccountsClient accounts={accounts} />
        </div>
    )
} 
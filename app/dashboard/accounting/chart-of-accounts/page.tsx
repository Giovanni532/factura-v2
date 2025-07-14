import { ChartOfAccountsClient } from "@/components/accounting/chart-of-accounts-client"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getUserWithCompanyCached, getChartOfAccountsCached } from "@/lib/cache"

export default async function ChartOfAccountsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

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
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Plan Comptable</h1>
                <p className="text-muted-foreground">
                    Gérez votre plan comptable et vos comptes.
                </p>
            </div>

            <ChartOfAccountsClient accounts={accounts} />
        </div>
    )
} 
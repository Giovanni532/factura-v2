import { Suspense } from "react"
import { ChartOfAccountsClient } from "@/components/accounting/chart-of-accounts-client"
import { getChartOfAccounts } from "@/db/queries/accounting"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getUserWithCompany } from "@/db/queries/company"

export default async function ChartOfAccountsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    const user = session?.user
    let accounts: any[] = []

    if (user) {
        try {
            const userWithCompany = await getUserWithCompany(user.id)
            const companyId = userWithCompany.company?.id

            if (companyId) {
                accounts = await getChartOfAccounts(companyId)
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

            <Suspense fallback={<div>Chargement...</div>}>
                <ChartOfAccountsClient accounts={accounts} />
            </Suspense>
        </div>
    )
} 
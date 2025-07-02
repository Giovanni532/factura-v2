import { Suspense } from "react"
import { FiscalYearsClient } from "@/components/accounting/fiscal-years-client"
import { getFiscalYears } from "@/db/queries/accounting"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getUserWithCompany } from "@/db/queries/company"

export default async function FiscalYearsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    const user = session?.user
    let fiscalYears: any[] = []

    if (user) {
        try {
            const userWithCompany = await getUserWithCompany(user.id)
            const companyId = userWithCompany.company?.id

            if (companyId) {
                fiscalYears = await getFiscalYears(companyId)
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des exercices fiscaux:", error)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Exercices Fiscaux</h1>
                <p className="text-muted-foreground">
                    Gérez vos exercices fiscaux et vos périodes comptables.
                </p>
            </div>

            <Suspense fallback={<div>Chargement...</div>}>
                <FiscalYearsClient fiscalYears={fiscalYears} />
            </Suspense>
        </div>
    )
} 
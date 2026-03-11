import { FiscalYearsClient } from "@/components/accounting/fiscal-years-client"
import { getSession } from "@/lib/get-session"
import { getUserWithCompanyCached, getFiscalYearsCached } from "@/lib/cache"

export default async function FiscalYearsPage() {
    const session = await getSession()

    const user = session?.user
    let fiscalYears: any[] = []

    if (user) {
        try {
            const userWithCompany = await getUserWithCompanyCached(user.id)
            const companyId = userWithCompany.company?.id

            if (companyId) {
                fiscalYears = await getFiscalYearsCached(companyId)
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

            <FiscalYearsClient fiscalYears={fiscalYears} />
        </div>
    )
} 
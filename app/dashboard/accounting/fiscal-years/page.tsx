import { FiscalYearsClient } from "@/components/accounting/fiscal-years-client"
import { getSession } from "@/lib/get-session"
import { getUserWithCompanyCached, getFiscalYearsCached } from "@/lib/cache"
import { PageHeader } from "@/components/ledger"

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
            <PageHeader eyebrow="Comptabilité" title="Exercices fiscaux" description="Vos périodes comptables, ouvertes et clôturées" />

            <FiscalYearsClient fiscalYears={fiscalYears} />
        </div>
    )
} 
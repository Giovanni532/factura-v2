import { JournalEntriesClient } from "@/components/accounting/journal-entries-client"
import { getJournalEntries, getChartOfAccounts } from "@/db/queries/accounting"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getUserWithCompany } from "@/db/queries/company"
import { JournalEntriesProvider } from "@/hooks/use-journal-entries"

export default async function JournalEntriesPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    const user = session?.user
    let entries: any[] = []
    let accounts: any[] = []

    if (user) {
        try {
            const userWithCompany = await getUserWithCompany(user.id)
            const companyId = userWithCompany.company?.id

            if (companyId) {
                // Récupérer les écritures
                entries = await getJournalEntries(companyId, {
                    limit: 20,
                    offset: 0,
                    startDate: undefined,
                    endDate: undefined,
                    status: undefined,
                    search: undefined
                })

                // Récupérer les comptes pour la sélection
                accounts = await getChartOfAccounts(companyId)
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des données:", error)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Écritures Comptables</h1>
                <p className="text-muted-foreground">
                    Gérez vos écritures comptables et vos journaux.
                </p>
            </div>

            <JournalEntriesProvider entries={entries} accounts={accounts}>
                <JournalEntriesClient entries={entries} accounts={accounts} />
            </JournalEntriesProvider>
        </div>
    )
} 
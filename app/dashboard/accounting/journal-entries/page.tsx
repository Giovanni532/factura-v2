import { JournalEntriesClient } from "@/components/accounting/journal-entries-client"
import { getSession } from "@/lib/get-session"
import { getUserWithCompanyCached, getJournalEntriesCached, getChartOfAccountsCached } from "@/lib/cache"
import { JournalEntriesProvider } from "@/hooks/use-journal-entries"
import { PageHeader } from "@/components/ledger"

export default async function JournalEntriesPage() {
    const session = await getSession()

    const user = session?.user
    let entries: any[] = []
    let accounts: any[] = []

    if (user) {
        try {
            const userWithCompany = await getUserWithCompanyCached(user.id)
            const companyId = userWithCompany.company?.id

            if (companyId) {
                // Récupérer les données avec cache en parallèle
                const [entriesData, accountsData] = await Promise.all([
                    getJournalEntriesCached(companyId, {
                        limit: 20,
                        offset: 0,
                        startDate: undefined,
                        endDate: undefined,
                        status: undefined,
                        search: undefined
                    }),
                    getChartOfAccountsCached(companyId)
                ]);

                entries = entriesData;
                accounts = accountsData;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des données:", error)
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader eyebrow="Comptabilité" title="Écritures comptables" description="Le journal de toutes vos écritures, au débit et au crédit" />

            <JournalEntriesProvider entries={entries} accounts={accounts}>
                <JournalEntriesClient entries={entries} accounts={accounts} />
            </JournalEntriesProvider>
        </div>
    )
} 
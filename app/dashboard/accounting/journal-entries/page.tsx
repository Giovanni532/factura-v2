import { Suspense } from "react"
import { JournalEntriesClient } from "@/components/accounting/journal-entries-client"
import { getJournalEntries } from "@/db/queries/accounting"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getUserWithCompany } from "@/db/queries/company"

export default async function JournalEntriesPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    const user = session?.user
    let entries: any[] = []

    if (user) {
        try {
            const userWithCompany = await getUserWithCompany(user.id)
            const companyId = userWithCompany.company?.id

            if (companyId) {
                entries = await getJournalEntries(companyId, {
                    limit: 20,
                    offset: 0,
                    startDate: undefined,
                    endDate: undefined,
                    status: undefined,
                    search: undefined
                })
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des écritures:", error)
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

            <Suspense fallback={<div>Chargement...</div>}>
                <JournalEntriesClient entries={entries} />
            </Suspense>
        </div>
    )
} 
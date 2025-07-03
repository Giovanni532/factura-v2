import { PaymentsClient } from "@/components/accounting/payments-client"
import { getPayments } from "@/db/queries/accounting"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getUserWithCompany } from "@/db/queries/company"

export default async function PaymentsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    const user = session?.user
    let payments: any[] = []

    if (user) {
        try {
            const userWithCompany = await getUserWithCompany(user.id)
            const companyId = userWithCompany.company?.id

            if (companyId) {
                payments = await getPayments(companyId, {
                    limit: 20,
                    offset: 0,
                    startDate: undefined,
                    endDate: undefined,
                    status: undefined,
                    search: undefined
                })
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des paiements:", error)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Paiements</h1>
                <p className="text-muted-foreground">
                    Gérez vos paiements et vos transactions financières.
                </p>
            </div>

            <PaymentsClient payments={payments} />
        </div>
    )
} 
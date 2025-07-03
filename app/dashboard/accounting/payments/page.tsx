import { PaymentsClient } from "@/components/accounting/payments-client"
import { PaymentsProvider } from "@/hooks/payments-context"
import { getExtendedPayments, getSuppliers, getExpenseCategories, getInvoicesForPayments } from "@/db/queries/extended-accounting"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getUserWithCompany } from "@/db/queries/company"

export default async function PaymentsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    const user = session?.user
    let payments: any[] = []
    let invoices: any[] = []
    let suppliers: any[] = []
    let expenseCategories: any[] = []

    if (user) {
        try {
            const userWithCompany = await getUserWithCompany(user.id)
            const companyId = userWithCompany.company?.id

            if (companyId) {
                // Récupérer les paiements étendus
                payments = await getExtendedPayments(companyId, { limit: 100 })

                // Récupérer les factures pour le formulaire
                invoices = await getInvoicesForPayments(companyId)

                // Récupérer les fournisseurs
                suppliers = await getSuppliers(companyId)

                // Récupérer les catégories de dépenses
                expenseCategories = await getExpenseCategories(companyId)
            }
        } catch (error) {
            console.error("Error loading payments data:", error)
        }
    }

    return (
        <div className="space-y-6">
            <PaymentsProvider initialPayments={payments}>
                <PaymentsClient
                    initialPayments={payments}
                    invoices={invoices}
                    suppliers={suppliers}
                    expenseCategories={expenseCategories}
                />
            </PaymentsProvider>
        </div>
    )
} 
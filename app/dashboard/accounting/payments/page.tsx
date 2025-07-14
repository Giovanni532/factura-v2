import { PaymentsClient } from "@/components/accounting/payments-client"
import { PaymentsProvider } from "@/hooks/payments-context"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getUserWithCompanyCached, getExtendedPaymentsCached, getInvoicesForPaymentsCached, getSuppliersCached, getExpenseCategoriesCached } from "@/lib/cache"

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
            const userWithCompany = await getUserWithCompanyCached(user.id)
            const companyId = userWithCompany.company?.id

            if (companyId) {
                // Récupérer les données avec cache en parallèle
                const [paymentsData, invoicesData, suppliersData, categoriesData] = await Promise.all([
                    getExtendedPaymentsCached(companyId, { limit: 100 }),
                    getInvoicesForPaymentsCached(companyId),
                    getSuppliersCached(companyId),
                    getExpenseCategoriesCached(companyId)
                ]);

                payments = paymentsData;
                invoices = invoicesData;
                suppliers = suppliersData;
                expenseCategories = categoriesData;
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
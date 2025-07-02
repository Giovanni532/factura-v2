import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getPayments } from "@/db/queries/accounting"
import { getUserWithCompany } from "@/db/queries/company"
import { accountingFiltersSchema } from "@/validation/accounting-schema"
import { headers } from "next/headers"

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session?.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
        }

        const userWithCompany = await getUserWithCompany(session.user.id)
        const companyId = userWithCompany.company?.id

        if (!companyId) {
            return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 })
        }

        // Récupérer les paramètres de filtrage
        const { searchParams } = new URL(request.url)
        const filters = {
            startDate: searchParams.get('startDate') || undefined,
            endDate: searchParams.get('endDate') || undefined,
            status: searchParams.get('status') || undefined,
            type: searchParams.get('type') || undefined,
            search: searchParams.get('search') || undefined,
            limit: parseInt(searchParams.get('limit') || '20'),
            offset: parseInt(searchParams.get('offset') || '0'),
        }

        // Valider les filtres
        const validatedFilters = accountingFiltersSchema.parse(filters)

        const payments = await getPayments(companyId, validatedFilters)

        return NextResponse.json(payments)
    } catch (error) {
        console.error("Erreur lors de la récupération des paiements:", error)
        return NextResponse.json(
            { error: "Erreur interne du serveur" },
            { status: 500 }
        )
    }
} 
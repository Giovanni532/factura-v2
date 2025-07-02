import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getAccountingStats } from "@/db/queries/accounting"
import { getUserWithCompany } from "@/db/queries/company"
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

        const stats = await getAccountingStats(companyId)

        return NextResponse.json(stats)
    } catch (error) {
        console.error("Erreur lors de la récupération des statistiques:", error)
        return NextResponse.json(
            { error: "Erreur interne du serveur" },
            { status: 500 }
        )
    }
} 
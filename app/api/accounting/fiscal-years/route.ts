import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getFiscalYears } from "@/db/queries/accounting"
import { getUserWithCompany } from "@/db/queries/company"
import { headers } from "next/headers"

export async function GET() {
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

        const fiscalYears = await getFiscalYears(companyId)

        return NextResponse.json(fiscalYears)
    } catch (error) {
        console.error("Erreur lors de la récupération des exercices fiscaux:", error)
        return NextResponse.json(
            { error: "Erreur interne du serveur" },
            { status: 500 }
        )
    }
} 
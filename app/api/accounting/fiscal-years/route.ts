import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getFiscalYears } from "@/db/queries/accounting"
import { getUserWithCompany } from "@/db/queries/company"
import { headers } from "next/headers"

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_APP_URL;

function withCORS(response: Response) {
    response.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN || "");
    response.headers.set("Vary", "Origin");
    response.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return response;
}

export async function OPTIONS() {
    return withCORS(new Response(null, { status: 204 }));
}

export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session?.user) {
            return withCORS(NextResponse.json({ error: "Non autorisé" }, { status: 401 }))
        }

        const userWithCompany = await getUserWithCompany(session.user.id)
        const companyId = userWithCompany.company?.id

        if (!companyId) {
            return withCORS(NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 }))
        }

        const fiscalYears = await getFiscalYears(companyId)

        return withCORS(NextResponse.json(fiscalYears))
    } catch (error) {
        console.error("Erreur lors de la récupération des exercices fiscaux:", error)
        return withCORS(NextResponse.json(
            { error: "Erreur interne du serveur" },
            { status: 500 }
        ))
    }
} 
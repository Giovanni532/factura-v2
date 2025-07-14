import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getJournalEntries } from "@/db/queries/accounting"
import { getUserWithCompany } from "@/db/queries/company"
import { accountingFiltersSchema } from "@/validation/accounting-schema"
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

export async function GET(request: NextRequest) {
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

        const entries = await getJournalEntries(companyId, validatedFilters)

        return withCORS(NextResponse.json(entries))
    } catch (error) {
        console.error("Erreur lors de la récupération des écritures:", error)
        return withCORS(NextResponse.json(
            { error: "Erreur interne du serveur" },
            { status: 500 }
        ))
    }
} 
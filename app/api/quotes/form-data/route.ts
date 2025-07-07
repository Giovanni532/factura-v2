import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getClientsForQuote, getNextQuoteNumber } from "@/db/queries/quote";
import { db } from "@/lib/drizzle";
import { user, service, companyDefaultTemplate, template, userFavoriteTemplate } from "@/db/schema";
import { eq, and, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        // Récupérer l'utilisateur complet depuis la base de données
        const userData = await db
            .select()
            .from(user)
            .where(eq(user.id, session.user.id))
            .limit(1);

        if (!userData.length || !userData[0].companyId) {
            return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 400 });
        }

        const companyId = userData[0].companyId;
        const userId = session.user.id;

        // Récupérer les données en parallèle
        const [clients, nextQuoteNumber, services, defaultTemplate, templates] = await Promise.all([
            getClientsForQuote(companyId),
            getNextQuoteNumber(companyId),
            // Récupérer les prestations
            db.select({
                id: service.id,
                name: service.name,
                description: service.description,
                unitPrice: service.unitPrice,
                currency: service.currency,
                unit: service.unit,
                taxRate: service.taxRate,
            })
                .from(service)
                .where(eq(service.companyId, companyId))
                .orderBy(service.name),
            // Récupérer le template par défaut
            db.select({
                templateId: companyDefaultTemplate.templateId,
            })
                .from(companyDefaultTemplate)
                .where(eq(companyDefaultTemplate.companyId, companyId))
                .limit(1),
            // Récupérer tous les templates (entreprise + prédéfinis + favoris)
            db.select({
                id: template.id,
                name: template.name,
                type: template.type,
                isPredefined: template.isPredefined,
                companyId: template.companyId,
            })
                .from(template)
                .where(
                    and(
                        eq(template.type, 'quote'),
                        or(
                            eq(template.companyId, companyId),
                            eq(template.isPredefined, true)
                        )
                    )
                )
                .orderBy(template.name),
        ]);

        // Récupérer les templates favoris de l'utilisateur
        const favoriteTemplates = await db
            .select({
                templateId: userFavoriteTemplate.templateId,
            })
            .from(userFavoriteTemplate)
            .where(eq(userFavoriteTemplate.userId, userId));

        const favoriteTemplateIds = favoriteTemplates.map(ft => ft.templateId);

        // Organiser les templates avec les favoris en premier
        const organizedTemplates = templates.map(t => ({
            ...t,
            isFavorite: favoriteTemplateIds.includes(t.id),
        })).sort((a, b) => {
            // Favoris en premier
            if (a.isFavorite && !b.isFavorite) return -1;
            if (!a.isFavorite && b.isFavorite) return 1;
            // Puis par nom
            return a.name.localeCompare(b.name);
        });

        return NextResponse.json({
            clients,
            templates: organizedTemplates,
            nextQuoteNumber,
            services,
            defaultTemplateId: defaultTemplate.length > 0 ? defaultTemplate[0].templateId : null,
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des données du formulaire:", error);
        return NextResponse.json(
            { error: "Erreur interne du serveur" },
            { status: 500 }
        );
    }
} 
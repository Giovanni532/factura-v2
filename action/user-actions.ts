"use server"

import { useMutation } from "@/lib/safe-action";
import { updateProfileSchema, changePasswordSchema, updateAvatarSchema, searchFiltersSchema, type SearchResult } from "@/validation/user-schema";
import { ActionError } from "@/lib/safe-action";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/drizzle";
import { user, invoice, quote, client, service } from "@/db/schema";
import { eq, and, or, like, inArray } from "drizzle-orm";

// Action pour mettre à jour le profil utilisateur
export const updateProfileAction = useMutation(
    updateProfileSchema,
    async (input, { userId }) => {
        try {
            // Utiliser l'API Better Auth pour mettre à jour l'utilisateur
            const result = await auth.api.updateUser({
                body: {
                    name: input.name,
                },
                headers: await headers()
            });

            return {
                success: true,
                user: result,
                message: "Profil mis à jour avec succès"
            };
        } catch (error: any) {
            console.error("Erreur lors de la mise à jour du profil:", error);
            throw new ActionError("Erreur lors de la mise à jour du profil");
        }
    }
);

// Action pour changer le mot de passe  
export const changePasswordAction = useMutation(
    changePasswordSchema,
    async (input, { userId }) => {
        try {
            // Utiliser l'API Better Auth pour changer le mot de passe
            await auth.api.changePassword({
                body: {
                    newPassword: input.newPassword,
                    currentPassword: input.currentPassword,
                    revokeOtherSessions: false, // Optionnel: révoquer les autres sessions
                },
                headers: await headers()
            });

            return {
                success: true,
                message: "Mot de passe changé avec succès"
            };
        } catch (error: any) {
            console.error("Erreur lors du changement de mot de passe:", error);
            // Gérer les erreurs spécifiques de Better Auth
            if (error.message?.includes("Current password") || error.message?.includes("Invalid password")) {
                throw new ActionError("Mot de passe actuel incorrect");
            }
            throw new ActionError("Erreur lors du changement de mot de passe");
        }
    }
);

// Action pour mettre à jour l'avatar utilisateur
export const updateAvatarAction = useMutation(
    updateAvatarSchema,
    async (input, { userId }) => {
        try {
            // Utiliser l'API Better Auth pour mettre à jour l'image de l'utilisateur
            const result = await auth.api.updateUser({
                body: {
                    image: input.image,
                },
                headers: await headers()
            });

            return {
                success: true,
                user: result,
                message: "Avatar mis à jour avec succès"
            };
        } catch (error: any) {
            console.error("Erreur lors de la mise à jour de l'avatar:", error);
            throw new ActionError("Erreur lors de la mise à jour de l'avatar");
        }
    }
);

export const searchFiltersAction = useMutation(
    searchFiltersSchema,
    async (input, { userId }) => {
        try {
            // Récupérer l'utilisateur et sa société
            const currentUser = await db
                .select({
                    id: user.id,
                    companyId: user.companyId
                })
                .from(user)
                .where(eq(user.id, userId))
                .limit(1);

            if (!currentUser[0]?.companyId) {
                throw new Error("Aucune société trouvée pour cet utilisateur");
            }

            const companyId = currentUser[0].companyId;
            const searchQuery = `%${input.query}%`;

            // Recherche dans les factures
            const invoices = await db
                .select({
                    id: invoice.id,
                    number: invoice.number,
                    status: invoice.status,
                    total: invoice.total,
                    clientId: invoice.clientId
                })
                .from(invoice)
                .where(
                    and(
                        eq(invoice.companyId, companyId),
                        like(invoice.number, searchQuery)
                    )
                )
                .limit(5);

            // Recherche dans les devis
            const quotes = await db
                .select({
                    id: quote.id,
                    number: quote.number,
                    status: quote.status,
                    total: quote.total,
                    clientId: quote.clientId
                })
                .from(quote)
                .where(
                    and(
                        eq(quote.companyId, companyId),
                        like(quote.number, searchQuery)
                    )
                )
                .limit(5);

            // Recherche dans les clients
            const clients = await db
                .select({
                    id: client.id,
                    name: client.name,
                    email: client.email,
                    city: client.city
                })
                .from(client)
                .where(
                    and(
                        eq(client.companyId, companyId),
                        or(
                            like(client.name, searchQuery),
                            like(client.email, searchQuery),
                            like(client.city, searchQuery)
                        )
                    )
                )
                .limit(5);

            // Recherche dans les services
            const services = await db
                .select({
                    id: service.id,
                    name: service.name,
                    description: service.description,
                    unitPrice: service.unitPrice,
                    category: service.category
                })
                .from(service)
                .where(
                    and(
                        eq(service.companyId, companyId),
                        or(
                            like(service.name, searchQuery),
                            like(service.description, searchQuery),
                            like(service.category, searchQuery)
                        )
                    )
                )
                .limit(5);

            // Récupérer les noms des clients pour les factures et devis
            const clientIds = [...new Set([
                ...invoices.map(inv => inv.clientId),
                ...quotes.map(q => q.clientId)
            ].filter(Boolean))];

            const clientNames = clientIds.length > 0 ? await db
                .select({
                    id: client.id,
                    name: client.name
                })
                .from(client)
                .where(inArray(client.id, clientIds)) : [];

            const clientNameMap = new Map(clientNames.map(c => [c.id, c.name]));

            // Formater les résultats
            const results: SearchResult[] = [
                ...invoices.map(inv => ({
                    id: inv.id,
                    type: 'invoice' as const,
                    title: `Facture ${inv.number}`,
                    description: `${clientNameMap.get(inv.clientId) || 'Client inconnu'} - ${inv.total}€`,
                    url: `/dashboard/invoices/${inv.id}`
                })),
                ...quotes.map(quote => ({
                    id: quote.id,
                    type: 'quote' as const,
                    title: `Devis ${quote.number}`,
                    description: `${clientNameMap.get(quote.clientId) || 'Client inconnu'} - ${quote.total}€`,
                    url: `/dashboard/quotes/${quote.id}`
                })),
                ...clients.map(client => ({
                    id: client.id,
                    type: 'client' as const,
                    title: client.name,
                    description: `${client.email}${client.city ? ` - ${client.city}` : ''}`,
                    url: `/dashboard/clients/${client.id}`
                })),
                ...services.map(service => ({
                    id: service.id,
                    type: 'service' as const,
                    title: service.name,
                    description: `${service.unitPrice}€${service.category ? ` - ${service.category}` : ''}`,
                    url: `/dashboard/services/${service.id}`
                }))
            ];

            return {
                success: true,
                data: {
                    results,
                    total: results.length
                }
            };
        } catch (error) {
            console.error("Erreur lors de la recherche:", error);
            throw new Error("Erreur lors de la recherche");
        }
    }
);
import { createSafeActionClient } from "next-safe-action";
import { ZodError, ZodSchema } from "zod";
import { auth } from "./auth";
import { headers } from "next/headers";

// Classe d'erreur personnalisée pour les actions
class ActionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ActionError";
    }
}

// Client d'action de base qui gère les erreurs
const baseActionClient = createSafeActionClient({
    handleServerError(error) {
        console.error("Action error:", error.message);

        if (error instanceof ActionError) {
            return {
                message: error.message,
                code: "ACTION_ERROR",
            };
        }

        if (error instanceof ZodError) {
            return {
                message: "Validation des données échouée",
                code: "VALIDATION_ERROR",
                errors: error.flatten(),
            };
        }

        // Erreur inconnue - ne pas exposer les détails en production
        return {
            message: "Une erreur est survenue",
            code: "INTERNAL_ERROR",
        };
    },
});

// Client d'action avec middleware pour récupérer la session utilisateur
export const authActionClient = baseActionClient.use(async ({ next }) => {
    // Récupère la session de l'utilisateur
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })

    const user = session?.user;
    // Vérifie si l'utilisateur est connecté
    if (!user) {
        throw new ActionError("Vous devez être connecté pour effectuer cette action");
    }

    // Passe l'utilisateur dans le contexte pour les actions suivantes
    return next({
        ctx: {
            user: user,
            userId: user.id as string,
        },
    });
});

// Middleware optionnel pour vérifier des rôles spécifiques
export const createRoleMiddleware = (requiredRole: string) => {
    return authActionClient.use(async ({ next, ctx }) => {
        const user = ctx.user;

        // Vérifier si l'utilisateur a le rôle requis
        // Ici nous utilisons une approche sécurisée en cas d'absence de la propriété role
        const userRole = (user as any).role || "user";
        if (userRole !== requiredRole) {
            throw new ActionError(`Cette action nécessite le rôle ${requiredRole}`);
        }

        return next();
    });
};

// Client d'action standard sans authentification
export const safeAction = baseActionClient;

// Fonction pour créer des mutations qui nécessitent une authentification
export function useMutation<TInput, TOutput>(
    schema: ZodSchema<TInput>,
    handler: (input: TInput, ctx: { user: any; userId: string }) => Promise<TOutput>
) {
    return authActionClient
        .schema(schema)
        .action(async ({ parsedInput, ctx }) => {
            return handler(parsedInput, ctx);
        });
}

// Fonction pour créer des mutations qui nécessitent un rôle spécifique
export function useRoleMutation<TInput, TOutput>(
    schema: ZodSchema<TInput>,
    role: string,
    handler: (input: TInput, ctx: { user: any; userId: string }) => Promise<TOutput>
) {
    return createRoleMiddleware(role)
        .schema(schema)
        .action(async ({ parsedInput, ctx }) => {
            return handler(parsedInput, ctx);
        });
}

// Exporter aussi l'erreur ActionError pour pouvoir l'utiliser ailleurs
export { ActionError };
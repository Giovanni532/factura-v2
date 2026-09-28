import { betterAuth } from "better-auth";
import { db } from "./drizzle";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { account as accountTable, schema, session as sessionTable, user as userTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "sqlite",
        schema: schema,
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false, // Changez à true en production
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 jours
        updateAge: 60 * 60 * 24, // 1 jour
    },
    databaseHooks: {
        account: {
            create: {
                // Anti pré-détournement : si quelqu'un a créé un compte mot de passe avec
                // l'adresse d'autrui (jamais vérifiée), la connexion Google du vrai
                // propriétaire supprime ce mot de passe et les sessions de l'intrus.
                after: async (created) => {
                    if (created.providerId === "credential") return;
                    const [owner] = await db.select({ emailVerified: userTable.emailVerified }).from(userTable).where(eq(userTable.id, created.userId)).limit(1);
                    if (!owner || owner.emailVerified) return;
                    await db.delete(accountTable).where(and(eq(accountTable.userId, created.userId), eq(accountTable.providerId, "credential")));
                    await db.delete(sessionTable).where(eq(sessionTable.userId, created.userId));
                    await db.update(userTable).set({ emailVerified: true, updatedAt: new Date() }).where(eq(userTable.id, created.userId));
                },
            },
        },
    },
    secret: process.env.BETTER_AUTH_SECRET!,
    baseURL: process.env.BETTER_AUTH_URL,
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    },
});
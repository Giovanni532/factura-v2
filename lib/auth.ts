import { betterAuth } from "better-auth";
import { db } from "./drizzle";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { schema } from "@/db/schema";

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
    secret: process.env.BETTER_AUTH_SECRET!,
    baseURL: process.env.BETTER_AUTH_URL!,
});
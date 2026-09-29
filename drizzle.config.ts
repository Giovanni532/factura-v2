import { defineConfig } from 'drizzle-kit';

// Fichier local (file:local.db) en développement, Turso en production : le dialecte
// « turso » exige un jeton, inutile pour une base locale
const url = process.env.DATABASE_URL!;

export default defineConfig(
    url.startsWith('file:')
        ? { out: './drizzle', schema: './db/schema.ts', dialect: 'sqlite', dbCredentials: { url } }
        : {
              out: './drizzle',
              schema: './db/schema.ts',
              dialect: 'turso',
              dbCredentials: { url, authToken: process.env.DATABASE_AUTH_TOKEN! },
          },
);

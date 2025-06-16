# Quickstarter Drizzle - Next.js avec Drizzle ORM + Better Auth

Ce projet Next.js utilise Drizzle ORM avec SQLite (better-sqlite3) et Better Auth pour l'authentification avec middleware de protection des routes.

## Variables d'environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
DB_FILE_NAME=local.db
BETTER_AUTH_SECRET=your-secret-key-here-change-this-in-production
BETTER_AUTH_URL=http://localhost:3000
```

**Important :** 
- `DB_FILE_NAME` : Chemin vers le fichier SQLite (sans le préfixe `file:`)
- `BETTER_AUTH_SECRET` doit être une chaîne aléatoire sécurisée en production
- `BETTER_AUTH_URL` est nécessaire pour le client React

## Installation et configuration

1. **Installer les dépendances** :
   ```bash
   npm install
   # ou
   yarn install
   # ou
   pnpm install
   # ou
   bun install
   ```

2. **Créer le fichier .env** avec les variables ci-dessus

3. **Initialiser la base de données** :
   ```bash
   pnpm run db:push
   ```

4. **Lancer le projet** :
   ```bash
   npm run dev
   # ou
   yarn dev
   # ou
   pnpm dev
   # ou
   bun dev
   ```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur pour voir le résultat.

## Architecture Edge Runtime Compatible

### 🔧 **Séparation des configurations**
- `lib/drizzle.ts` : Configuration Drizzle unifiée (compatible Edge Runtime)
- `middleware.ts` : Utilise l'API Better Auth via fetch (pas d'import direct)

### 🔐 **Middleware de protection**
- **Toutes les routes sont protégées** par défaut
- Vérification de session via API `/api/auth/get-session`
- Redirection automatique vers `/login` si non connecté
- Routes publiques : `/login`, `/signup`, `/api/auth`
- Redirection vers la page d'origine après connexion

### 📝 Pages disponibles
- `/login` - Connexion utilisateur
- `/signup` - Inscription utilisateur  
- `/` - Tableau de bord (protégé)

### 🎯 Composants d'authentification
- `LoginForm` - Formulaire de connexion
- `SignupForm` - Formulaire d'inscription
- `UserProfile` - Profil utilisateur avec déconnexion

## Scripts disponibles

- `npm run dev` - Lance le serveur de développement
- `npm run build` - Construit l'application pour la production
- `npm run start` - Lance le serveur de production
- `npm run lint` - Lance le linter ESLint
- `npm run db:generate` - Génère les fichiers de migration
- `npm run db:migrate` - Applique les migrations
- `npm run db:push` - Pousse directement les changements de schéma (dev)
- `npm run db:studio` - Lance Drizzle Studio pour visualiser la DB
- `npm run auth:generate` - Génère le schéma Better Auth

## Structure des fichiers

```
├── middleware.ts              # Middleware Edge Runtime compatible
├── db/
│   └── schema.ts             # Schéma Drizzle avec tables Better Auth
├── lib/
│   ├── drizzle.ts            # Configuration Drizzle unifiée
│   ├── auth.ts               # Configuration Better Auth (serveur)
│   ├── auth-client.ts        # Client Better Auth (React)
│   └── db-example.ts         # Exemples d'utilisation
├── components/
│   └── auth/
│       ├── login-form.tsx    # Formulaire de connexion
│       ├── signup-form.tsx   # Formulaire d'inscription
│       ├── user-profile.tsx  # Profil utilisateur
│       └── index.ts          # Exports
├── app/
│   ├── login/page.tsx        # Page de connexion
│   ├── signup/page.tsx       # Page d'inscription
│   ├── page.tsx              # Tableau de bord
│   └── [api]/[auth]/[...all]/route.ts  # Routes API Better Auth
├── drizzle.config.ts         # Configuration Drizzle Kit
└── .env                      # Variables d'environnement
```

## Utilisation

### Authentification côté client

```typescript
import { authClient } from '@/lib/auth-client';

// Hook de session
const { data: session, isPending } = authClient.useSession();

// Connexion
await authClient.signIn.email({
  email: 'user@example.com',
  password: 'password123'
});

// Inscription
await authClient.signUp.email({
  email: 'user@example.com',
  password: 'password123',
  name: 'John Doe'
});

// Déconnexion
await authClient.signOut();
```

### Authentification côté serveur

```typescript
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// Vérifier la session
const session = await auth.api.getSession({
  headers: await headers()
});

if (!session?.user) {
  // Utilisateur non connecté
}
```

### Avec Drizzle ORM

```typescript
import { db } from '@/lib/drizzle';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Récupérer un utilisateur
const userData = await db.select().from(user).where(eq(user.email, 'user@example.com'));

// Créer un utilisateur
await db.insert(user).values({
  id: 'user-id',
  name: 'John Doe',
  email: 'john@example.com',
  emailVerified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
});
```

## Sécurité

- ✅ Middleware de protection automatique
- ✅ Validation des mots de passe (min 8 caractères)
- ✅ Gestion des erreurs avec notifications
- ✅ Sessions sécurisées avec Better Auth
- ✅ Protection CSRF intégrée
- ✅ Compatible Edge Runtime

## Technologies utilisées

- **[Next.js](https://nextjs.org)** - Framework React pour la production
- **[Drizzle ORM](https://orm.drizzle.team)** - ORM TypeScript moderne
- **[Better Auth](https://www.better-auth.com)** - Solution d'authentification complète
- **[SQLite](https://www.sqlite.org)** - Base de données embarquée
- **[Tailwind CSS](https://tailwindcss.com)** - Framework CSS utilitaire
- **[TypeScript](https://www.typescriptlang.org)** - JavaScript avec typage statique

## Ressources

- [Documentation Next.js](https://nextjs.org/docs) - Fonctionnalités et API Next.js
- [Documentation Drizzle ORM](https://orm.drizzle.team/docs/get-started/sqlite-new)
- [Documentation Better Auth](https://www.better-auth.com/docs/basic-usage#sign-up)
- [Drizzle Studio](https://orm.drizzle.team/drizzle-studio/overview) - Interface graphique pour votre base de données

## Déploiement

Le moyen le plus simple de déployer votre application Next.js est d'utiliser la [plateforme Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) des créateurs de Next.js.

Consultez la [documentation de déploiement Next.js](https://nextjs.org/docs/app/building-your-application/deploying) pour plus de détails.

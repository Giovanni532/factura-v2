# Factura

Facturation, devis et comptabilité pour les petites entreprises, dans une seule application : clients, prestations, documents PDF, envoi par e-mail, écritures comptables et abonnement Stripe, pour plusieurs entreprises et plusieurs membres par entreprise.

**[Démo en ligne](https://factura-v2.vercel.app)** · [Présentation dans mon portfolio](https://www.giovannisalcuni.dev/projects/factura)

![Page d'accueil de Factura](https://www.giovannisalcuni.dev/projets/factura/accueil.png)

| Tableau de bord | Factures | Comptabilité |
| --- | --- | --- |
| ![Tableau de bord](https://www.giovannisalcuni.dev/projets/factura/tableau-de-bord.png) | ![Factures](https://www.giovannisalcuni.dev/projets/factura/factures.png) | ![Comptabilité](https://www.giovannisalcuni.dev/projets/factura/comptabilite.png) |

## Fonctionnalités

- **Factures et devis** : création et modification, statuts, aperçu, téléchargement en PDF, envoi par e-mail et relances.
- **Modèles de documents** : modèles prédéfinis et modèles propres à chaque entreprise.
- **Clients et prestations** : carnet de clients et catalogue de prestations réutilisables.
- **Comptabilité** : plan comptable, exercices, écritures, paiements et rapports.
- **Équipes** : plusieurs entreprises, rôles propriétaire, administrateur et membre, invitations par lien.
- **Abonnement** : formules et paiement avec Stripe (webhook de synchronisation).
- **Connexion** : e-mail et mot de passe, ou compte Google (Better-Auth).

## Stack

Next.js 16 (App Router, Server Actions) · TypeScript · Tailwind CSS · Drizzle ORM · SQLite / Turso · Better-Auth · Stripe · Resend · Zod · next-safe-action · Zustand

## Organisation du code

```
app/          pages (tableau de bord, comptabilité, réglages) et routes API
action/       Server Actions, une par domaine (factures, devis, comptabilité…)
db/           schéma Drizzle et requêtes
lib/          authentification, invitations, contrôles d'appartenance, PDF, Stripe, e-mails
validation/   schémas Zod partagés entre formulaires et serveur
components/   interface (composants UI, registre, badges de statut)
scripts/      initialisation des modèles et des formules d'abonnement
```

## Sécurité

Une application multi-entreprise ne doit jamais laisser une entreprise lire ou modifier les données d'une autre. Les points travaillés :

- **Isolation par entreprise** : chaque requête comptable et statistique est filtrée par entreprise, et tout identifiant venu du navigateur (client, modèle, compte comptable) est vérifié avant d'être rattaché à un document. Voir [`lib/ownership.ts`](lib/ownership.ts).
- **Invitations** : un jeton à usage unique, haché en base, remplace l'ancien lien qui permettait de devenir propriétaire d'une autre entreprise. Voir [`lib/invitation.ts`](lib/invitation.ts).
- **Surface d'attaque réduite** : les routes d'envoi d'e-mails et de revalidation non authentifiées ont été supprimées, et le rendu PDF est durci ([`lib/pdf-render.ts`](lib/pdf-render.ts)).

## Démarrer en local

Prérequis : Node.js 20 ou plus.

```bash
npm install
cp .env.example .env   # puis remplir BETTER_AUTH_SECRET (openssl rand -base64 32)
npm run db:push        # crée le schéma dans la base locale (file:local.db)
npm run templates:init
npm run subscriptions:init
npm run dev
```

L'application tourne sur http://localhost:3000. En local, la base est un simple fichier SQLite : aucun compte Turso n'est nécessaire. Les clés Google, Resend et Stripe ne servent qu'à la connexion Google, à l'envoi d'e-mails et aux paiements.

| Script | Rôle |
| --- | --- |
| `npm run dev` | serveur de développement |
| `npm run build` / `npm start` | build et serveur de production |
| `npm run db:push` | applique le schéma Drizzle à la base |
| `npm run db:studio` | explore la base dans Drizzle Studio |
| `npm run templates:init` | ajoute les modèles de documents prédéfinis |
| `npm run subscriptions:init` | ajoute les formules d'abonnement |

---

Conçu et développé par [Giovanni Salcuni](https://www.giovannisalcuni.dev).

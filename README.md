# 🧾 Factura - Plateforme de Facturation et Comptabilité

**Factura** est une application web complète de facturation et de gestion comptable, conçue pour les entreprises de toutes tailles. Elle offre une solution tout-en-un pour gérer vos factures, devis, clients, comptabilité et rapports financiers.

## ✨ Fonctionnalités Principales

### 📊 **Tableau de Bord Intelligent**
- **Statistiques en temps réel** : Revenus, factures, devis, clients actifs
- **Graphiques interactifs** : Évolution mensuelle des ventes et bénéfices
- **Échéances à venir** : Suivi des factures et devis en attente
- **Documents récents** : Accès rapide aux derniers documents créés

### 🧾 **Gestion des Factures**
- **Création rapide** : Interface intuitive pour créer des factures professionnelles
- **Templates personnalisables** : Modèles prédéfinis et personnalisés
- **Calculs automatiques** : TVA, taxes, remises et totaux
- **Statuts multiples** : Brouillon, envoyée, payée, en retard
- **Envoi par email** : Intégration avec templates d'email personnalisés
- **Export PDF** : Génération automatique de documents PDF
- **Numérotation automatique** : Séquence personnalisable par entreprise

### 📋 **Gestion des Devis**
- **Création de devis** : Interface similaire aux factures
- **Validité configurable** : Dates d'expiration personnalisables
- **Conversion en facture** : Transformation automatique des devis acceptés
- **Suivi des statuts** : Envoyé, accepté, refusé, expiré
- **Acceptation en ligne** : Liens directs pour les clients

### 👥 **Gestion des Clients**
- **Base de données clients** : Informations complètes (contact, adresse, SIRET, TVA)
- **Historique complet** : Toutes les factures et devis par client
- **Statistiques clients** : Chiffre d'affaires, nombre de documents
- **Import/Export** : Gestion en lot des données clients
- **Recherche avancée** : Filtres multiples et recherche textuelle

### 🛠️ **Gestion des Prestations/Services**
- **Catalogue de services** : Définition des prestations et tarifs
- **Catégorisation** : Organisation par catégories métier
- **Prix dynamiques** : Tarifs variables selon les clients
- **Gestion des stocks** : Suivi des quantités disponibles
- **Statistiques de vente** : Analyse des services les plus populaires

### 📄 **Templates Personnalisables**
- **Templates prédéfinis** : Modèles classiques, modernes, minimalistes
- **Personnalisation complète** : Couleurs, logos, mise en page
- **Système de favoris** : Templates préférés par utilisateur
- **Prévisualisation** : Aperçu en temps réel des modifications
- **Export/Import** : Partage de templates entre entreprises

### 💰 **Comptabilité Avancée**
- **Plan comptable** : Gestion complète du plan de comptes
- **Écritures comptables** : Saisie et validation des écritures
- **Journaux comptables** : Organisation par types d'opérations
- **Exercices fiscaux** : Gestion des périodes comptables
- **Balance de vérification** : Contrôle de l'équilibre comptable

### 💳 **Gestion des Paiements**
- **Suivi des paiements** : Enregistrement et suivi des encaissements
- **Rapprochement bancaire** : Association paiements/factures
- **Gestion des fournisseurs** : Base de données des partenaires
- **Catégories de dépenses** : Classification des charges
- **Rapports de trésorerie** : Analyse des flux de trésorerie

### 📈 **Rapports et Analytics**
- **Bilan comptable** : Situation financière à date
- **Compte de résultat** : Analyse des produits et charges
- **Tableau des flux de trésorerie** : Évolution des encaissements/décaissements
- **Balance de vérification** : Contrôle de l'équilibre des comptes
- **Rapports personnalisables** : Création de rapports sur mesure

### 🔐 **Authentification et Sécurité**
- **Better Auth** : Système d'authentification moderne et sécurisé
- **Rôles utilisateurs** : Propriétaire, administrateur, utilisateur
- **Invitations d'équipe** : Système d'invitation par email
- **Protection des routes** : Middleware de sécurité automatique
- **Sessions sécurisées** : Gestion des sessions avec expiration

### 💳 **Intégration Paiements (Stripe)**
- **Abonnements** : Plans mensuels et annuels
- **Paiements sécurisés** : Intégration Stripe complète
- **Webhooks** : Synchronisation automatique des statuts
- **Gestion des factures** : Facturation automatique des abonnements
- **Portail client** : Interface de gestion des abonnements

### 📧 **Système d'Email**
- **Templates d'email** : Modèles personnalisables pour factures et devis
- **Envoi automatique** : Notifications et rappels
- **Intégration Resend** : Service d'envoi d'emails professionnel
- **Suivi des envois** : Historique des emails envoyés
- **Notifications d'équipe** : Invitations et alertes

### 🎨 **Interface Utilisateur**
- **Design moderne** : Interface utilisateur intuitive et responsive
- **Thème sombre/clair** : Basculement automatique selon les préférences
- **Composants Shadcn** : Bibliothèque de composants cohérente
- **Animations fluides** : Transitions et micro-interactions
- **Accessibilité** : Conformité aux standards d'accessibilité

## 🚀 Technologies Utilisées

### **Frontend**
- **[Next.js 15](https://nextjs.org)** - Framework React avec App Router
- **[React 19](https://react.dev)** - Bibliothèque UI moderne
- **[TypeScript](https://www.typescriptlang.org)** - Typage statique
- **[Tailwind CSS](https://tailwindcss.com)** - Framework CSS utilitaire
- **[Shadcn/ui](https://ui.shadcn.com)** - Composants UI réutilisables
- **[Framer Motion](https://www.framer.com/motion)** - Animations fluides

### **Backend & Base de Données**
- **[Drizzle ORM](https://orm.drizzle.team)** - ORM TypeScript moderne
- **[SQLite](https://www.sqlite.org)** - Base de données embarquée
- **[Better Auth](https://www.better-auth.com)** - Authentification complète
- **[Next Safe Action](https://next-safe-action.dev)** - Actions serveur sécurisées

### **Paiements & Services**
- **[Stripe](https://stripe.com)** - Plateforme de paiement
- **[Resend](https://resend.com)** - Service d'envoi d'emails
- **[Puppeteer](https://pptr.dev)** - Génération de PDF

### **Outils de Développement**
- **[ESLint](https://eslint.org)** - Linting du code
- **[Drizzle Kit](https://orm.drizzle.team/kit-docs/overview)** - Outils de migration
- **[Zod](https://zod.dev)** - Validation de schémas

## 📋 Variables d'Environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
# Authentification
BETTER_AUTH_SECRET=your-secret-key-here-change-this-in-production
BETTER_AUTH_URL=http://localhost:3000

# Base de données
DATABASE_URL=file:./local.db
DATABASE_AUTH_TOKEN=your-database-auth-token

# Stripe (Paiements)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PUBLIC_KEY=pk_test_your_public_key
STRIPE_PRIVATE_KEY=sk_test_your_private_key
STRIPE_PRICE_FREE=price_free_plan_id
STRIPE_PRICE_BUSINESS=price_business_plan_id
STRIPE_PRICE_ENTERPRISE=price_enterprise_plan_id

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OAuth Google (Optionnel)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email (Resend)
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

## 🛠️ Installation et Configuration

### **Prérequis**
- Node.js 18+ 
- pnpm, npm, yarn ou bun
- Compte Stripe (pour les paiements)
- Compte Resend (pour les emails)

### **Installation**

1. **Cloner le repository**
   ```bash
   git clone <repository-url>
   cd factura-v2
   ```

2. **Installer les dépendances**
   ```bash
   pnpm install
   # ou
   npm install
   # ou
   yarn install
   ```

3. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env
   # Éditer le fichier .env avec vos valeurs
   ```

4. **Initialiser la base de données**
   ```bash
   pnpm run db:push
   ```

5. **Générer les données initiales**
   ```bash
   pnpm run templates:init
   pnpm run subscriptions:init
   ```

6. **Lancer l'application**
   ```bash
   pnpm run dev
   ```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📚 Scripts Disponibles

```bash
# Développement
pnpm run dev          # Serveur de développement avec Turbopack
pnpm run build        # Build de production
pnpm run start        # Serveur de production
pnpm run lint         # Linting ESLint

# Base de données
pnpm run db:generate  # Générer les migrations
pnpm run db:migrate   # Appliquer les migrations
pnpm run db:push      # Pousser les changements de schéma
pnpm run db:studio    # Interface Drizzle Studio

# Authentification
pnpm run auth:generate # Générer le schéma Better Auth

# Données initiales
pnpm run templates:init      # Initialiser les templates
pnpm run subscriptions:init  # Initialiser les plans d'abonnement
```

## 🏗️ Architecture

### **Structure des Dossiers**
```
factura-v2/
├── app/                    # Pages Next.js (App Router)
│   ├── api/               # Routes API
│   ├── dashboard/         # Interface principale
│   ├── login/             # Page de connexion
│   └── signup/            # Page d'inscription
├── components/            # Composants React
│   ├── ui/               # Composants Shadcn
│   ├── forms/            # Formulaires
│   └── features/         # Composants métier
├── lib/                   # Utilitaires et configurations
├── db/                    # Schémas et requêtes Drizzle
├── validation/           # Schémas Zod
├── hooks/                # Hooks React personnalisés
└── store/                # État global (Zustand)
```

### **Sécurité**
- ✅ **Middleware de protection** : Toutes les routes protégées
- ✅ **Validation Zod** : Validation stricte des données
- ✅ **Sessions sécurisées** : Gestion des sessions avec Better Auth
- ✅ **CSRF Protection** : Protection contre les attaques CSRF
- ✅ **Edge Runtime** : Compatible avec les fonctions Edge

## 🎯 Fonctionnalités Avancées

### **Gestion d'Équipe**
- Invitations par email avec rôles
- Gestion des permissions par utilisateur
- Collaboration en temps réel
- Historique des actions par utilisateur

### **Automatisation**
- Envoi automatique des factures
- Rappels de paiement
- Notifications d'échéances
- Génération automatique de rapports

### **Intégrations**
- **Stripe** : Paiements et abonnements
- **Resend** : Envoi d'emails professionnels
- **Google OAuth** : Connexion avec Google
- **PDF Generation** : Export automatique des documents

## 📄 Licence et Droits

**© 2025 - Tous droits réservés**

Cette application est la propriété exclusive de Giovanni Salcuni. Toute reproduction, distribution, modification ou utilisation commerciale de ce code source, de sa documentation ou de ses fonctionnalités est strictement interdite sans autorisation écrite préalable.

**Interdictions :**
- ❌ Réutilisation du code source
- ❌ Distribution ou vente de l'application
- ❌ Modification sans autorisation
- ❌ Utilisation commerciale non autorisée

**Contact :** Pour toute demande d'utilisation ou de collaboration, veuillez contacter Giovanni Salcuni.

---

**Factura** - Simplifiez votre facturation, optimisez votre comptabilité. 🚀

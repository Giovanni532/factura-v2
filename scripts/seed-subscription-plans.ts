import { db } from "../lib/drizzle";
import { billingPlan } from "../db/schema";

async function seedSubscriptionPlans() {
    console.log("🌱 Seeding subscription plans...");

    try {
        // Insérer les plans d'abonnement
        await db.insert(billingPlan).values([
            {
                id: 'free-plan',
                name: 'Gratuit',
                description: 'Plan gratuit pour découvrir Factura',
                price: 0,
                currency: 'EUR',
                interval: 'monthly',
                maxUsers: 1,
                maxClients: 10,
                maxInvoices: 20,
                features: JSON.stringify([
                    'Facturation de base',
                    'Gestion clients limitée',
                    'Templates prédéfinis',
                    'Support par email'
                ]),
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'small-business-plan',
                name: 'Petite Entreprise',
                description: 'Plan adapté aux petites entreprises',
                price: 29.99,
                currency: 'EUR',
                interval: 'monthly',
                maxUsers: 10,
                maxClients: 100,
                maxInvoices: 500,
                features: JSON.stringify([
                    'Facturation avancée',
                    'Gestion équipe jusqu\'à 10 utilisateurs',
                    'Templates personnalisés',
                    'Devis et factures illimités',
                    'Comptabilité de base',
                    'Support prioritaire'
                ]),
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'enterprise-plan',
                name: 'Grande Entreprise',
                description: 'Plan pour les grandes entreprises',
                price: 99.99,
                currency: 'EUR',
                interval: 'monthly',
                maxUsers: 50,
                maxClients: -1, // Illimité
                maxInvoices: -1, // Illimité
                features: JSON.stringify([
                    'Fonctionnalités complètes',
                    'Gestion équipe jusqu\'à 50 utilisateurs',
                    'Templates entièrement personnalisables',
                    'Comptabilité avancée',
                    'Rapports et analytics',
                    'API access',
                    'Support dédié 24/7'
                ]),
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]).onConflictDoNothing();

        console.log("✅ Subscription plans seeded successfully!");
    } catch (error) {
        console.error("❌ Error seeding subscription plans:", error);
        throw error;
    }
}

// Exécuter le script si appelé directement
if (require.main === module) {
    seedSubscriptionPlans()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

export { seedSubscriptionPlans }; 
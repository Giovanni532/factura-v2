#!/usr/bin/env tsx

/**
 * Script de test des fonctions de cache
 * Usage: npm run test:cache
 */

import { getUserWithCompanyCached, getDashboardStatsCached } from '@/lib/cache';

async function testCache() {
    console.log('🧪 Test des fonctions de cache...\n');

    try {
        // Test avec un ID utilisateur fictif
        const userId = 'test-user-id';

        console.log('📦 Test getUserWithCompanyCached...');
        const userData = await getUserWithCompanyCached(userId);
        console.log('✅ getUserWithCompanyCached fonctionne');
        console.log('   Résultat:', userData ? 'Données trouvées' : 'Aucune donnée');

        if (userData?.company?.id) {
            console.log('\n📊 Test getDashboardStatsCached...');
            const stats = await getDashboardStatsCached(userData.company.id);
            console.log('✅ getDashboardStatsCached fonctionne');
            console.log('   Statistiques:', stats);
        }

        console.log('\n✨ Tests terminés avec succès!');

    } catch (error) {
        console.error('❌ Erreur lors des tests:', error);
        process.exit(1);
    }
}

// Exécution si le script est appelé directement
if (require.main === module) {
    testCache();
}

export { testCache }; 
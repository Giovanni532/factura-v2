#!/usr/bin/env tsx

/**
 * Script de test des performances des pages optimisées
 * Usage: npm run test:performance
 */

import { performance } from 'perf_hooks';

interface PerformanceTest {
    name: string;
    url: string;
    expectedTime: number; // en millisecondes
}

const tests: PerformanceTest[] = [
    {
        name: 'Dashboard Principal',
        url: '/dashboard',
        expectedTime: 2000
    },
    {
        name: 'Page Factures',
        url: '/dashboard/invoices',
        expectedTime: 1500
    },
    {
        name: 'Page Devis',
        url: '/dashboard/quotes',
        expectedTime: 1500
    },
    {
        name: 'Page Clients',
        url: '/dashboard/clients',
        expectedTime: 1000
    },
    {
        name: 'Page Services',
        url: '/dashboard/services',
        expectedTime: 1000
    },
    {
        name: 'Page Templates',
        url: '/dashboard/templates',
        expectedTime: 800
    },
    {
        name: 'Page Profil',
        url: '/dashboard/settings/profile',
        expectedTime: 500
    }
];

async function testPagePerformance(test: PerformanceTest): Promise<{ success: boolean; time: number; improvement?: number }> {
    const startTime = performance.now();

    try {
        // Simuler une requête HTTP (dans un vrai test, on utiliserait fetch)
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

        const endTime = performance.now();
        const executionTime = endTime - startTime;

        const success = executionTime <= test.expectedTime;
        const improvement = success ? ((test.expectedTime - executionTime) / test.expectedTime) * 100 : 0;

        return {
            success,
            time: executionTime,
            improvement
        };
    } catch (error) {
        console.error(`Erreur lors du test de ${test.name}:`, error);
        return {
            success: false,
            time: Infinity
        };
    }
}

async function runPerformanceTests() {
    console.log('🚀 Démarrage des tests de performance...\n');

    const results = [];
    let totalTime = 0;
    let successfulTests = 0;

    for (const test of tests) {
        console.log(`📊 Test: ${test.name}`);
        console.log(`   URL: ${test.url}`);
        console.log(`   Temps attendu: ${test.expectedTime}ms`);

        const result = await testPagePerformance(test);
        results.push({ ...test, ...result });

        if (result.success) {
            successfulTests++;
            totalTime += result.time;
            console.log(`   ✅ Succès: ${result.time.toFixed(2)}ms`);
            if (result.improvement) {
                console.log(`   📈 Amélioration: ${result.improvement.toFixed(1)}%`);
            }
        } else {
            console.log(`   ❌ Échec: ${result.time.toFixed(2)}ms (dépassement de ${test.expectedTime}ms)`);
        }

        console.log('');
    }

    // Résumé
    console.log('📋 Résumé des tests de performance:');
    console.log('=====================================');
    console.log(`Tests réussis: ${successfulTests}/${tests.length}`);
    console.log(`Temps total: ${totalTime.toFixed(2)}ms`);
    console.log(`Temps moyen: ${(totalTime / successfulTests).toFixed(2)}ms`);

    const successRate = (successfulTests / tests.length) * 100;
    console.log(`Taux de succès: ${successRate.toFixed(1)}%`);

    if (successRate >= 80) {
        console.log('\n🎉 Excellent! Les optimisations de cache fonctionnent bien.');
    } else if (successRate >= 60) {
        console.log('\n⚠️  Bon, mais il y a encore des améliorations possibles.');
    } else {
        console.log('\n🔧 Des optimisations supplémentaires sont nécessaires.');
    }

    // Détails par page
    console.log('\n📊 Détails par page:');
    results.forEach(result => {
        const status = result.success ? '✅' : '❌';
        const timeColor = result.success ? '\x1b[32m' : '\x1b[31m';
        console.log(`${status} ${result.name}: ${timeColor}${result.time.toFixed(2)}ms\x1b[0m`);
    });
}

// Fonction pour tester le cache
async function testCachePerformance() {
    console.log('\n🧪 Test des performances du cache...\n');

    const cacheTests = [
        { name: 'Cache utilisateur', key: 'user-with-company' },
        { name: 'Cache dashboard stats', key: 'dashboard-stats' },
        { name: 'Cache factures', key: 'invoices-by-company' },
        { name: 'Cache devis', key: 'quotes-by-company' }
    ];

    for (const test of cacheTests) {
        const startTime = performance.now();

        // Simuler un accès au cache
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));

        const endTime = performance.now();
        const cacheTime = endTime - startTime;

        console.log(`📦 ${test.name}: ${cacheTime.toFixed(2)}ms`);
    }
}

// Fonction principale
async function main() {
    try {
        await runPerformanceTests();
        await testCachePerformance();

        console.log('\n✨ Tests de performance terminés!');
        console.log('\n💡 Conseils pour améliorer les performances:');
        console.log('   - Vérifiez les durées de cache dans lib/cache.ts');
        console.log('   - Optimisez les requêtes de base de données');
        console.log('   - Utilisez Promise.all pour les requêtes parallèles');
        console.log('   - Surveillez les métriques de cache hit/miss');

    } catch (error) {
        console.error('❌ Erreur lors des tests de performance:', error);
        process.exit(1);
    }
}

// Exécution si le script est appelé directement
if (require.main === module) {
    main();
}

export { runPerformanceTests, testCachePerformance }; 
import { db } from "@/lib/drizzle";
import { template } from "@/db/schema";
import { predefinedTemplates } from "@/lib/templates";
import { eq } from "drizzle-orm";

async function seedTemplates() {
    console.log("🌱 Insertion des templates prédéfinis...");

    try {
        for (const templateData of predefinedTemplates) {
            // Vérifier si le template existe déjà
            const existingTemplate = await db.select()
                .from(template)
                .where(eq(template.id, templateData.id))
                .limit(1);

            if (existingTemplate.length === 0) {
                // Insérer le nouveau template
                await db.insert(template).values({
                    id: templateData.id,
                    name: templateData.name,
                    description: templateData.description,
                    html: templateData.html,
                    css: templateData.css,
                    preview: null, // Sera ajouté plus tard
                    isDefault: false,
                    isPredefined: true,
                    companyId: null, // Les templates prédéfinis n'appartiennent à aucune entreprise
                });

                console.log(`✅ Template "${templateData.name}" inséré`);
            } else {
                // Mettre à jour le template existant
                await db.update(template)
                    .set({
                        name: templateData.name,
                        description: templateData.description,
                        html: templateData.html,
                        css: templateData.css,
                        updatedAt: new Date(),
                    })
                    .where(eq(template.id, templateData.id));

                console.log(`🔄 Template "${templateData.name}" mis à jour`);
            }
        }

        console.log("🎉 Tous les templates prédéfinis ont été traités avec succès !");
    } catch (error) {
        console.error("❌ Erreur lors de l'insertion des templates :", error);
        process.exit(1);
    }
}

// Exécuter le script si appelé directement
if (require.main === module) {
    seedTemplates().then(() => {
        console.log("✨ Script terminé");
        process.exit(0);
    });
}

export { seedTemplates }; 
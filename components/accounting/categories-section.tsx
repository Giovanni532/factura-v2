"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CategoryCard } from "./category-card"
import { IconTag } from "@tabler/icons-react"

interface CategoriesSectionProps {
    categories: any[]
    onEdit: (category: any) => void
    onDelete: (category: any) => void
}

export function CategoriesSection({ categories, onEdit, onDelete }: CategoriesSectionProps) {
    return (
        <div className="mt-6">
            {categories.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center">
                        <IconTag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Aucune catégorie trouvée.</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Ajoutez des catégories pour classer vos dépenses.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                categories.map((category) => (
                    <CategoryCard
                        key={category.id}
                        category={category}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))
            )}
        </div>
    )
} 
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { SupplierCard } from "./supplier-card"
import { IconBuilding } from "@tabler/icons-react"

interface SuppliersSectionProps {
    suppliers: any[]
    onEdit: (supplier: any) => void
    onDelete: (supplier: any) => void
}

export function SuppliersSection({ suppliers, onEdit, onDelete }: SuppliersSectionProps) {
    return (
        <div className="mt-6">
            {suppliers.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center">
                        <IconBuilding className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Aucun fournisseur trouvé.</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Ajoutez des fournisseurs pour mieux organiser vos décaissements.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                suppliers.map((supplier) => (
                    <SupplierCard
                        key={supplier.id}
                        supplier={supplier}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))
            )}
        </div>
    )
} 
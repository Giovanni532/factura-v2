import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IconEdit, IconTrash, IconBuilding } from "@tabler/icons-react"

interface SupplierCardProps {
    supplier: any
    onEdit: (supplier: any) => void
    onDelete: (supplier: any) => void
}

export function SupplierCard({ supplier, onEdit, onDelete }: SupplierCardProps) {
    return (
        <Card className="mb-4">
            <CardContent className="p-4">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <IconBuilding className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">{supplier.name}</span>
                            <Badge variant={supplier.isActive ? "default" : "secondary"}>
                                {supplier.isActive ? "Actif" : "Inactif"}
                            </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                            {supplier.email && <p><span className="font-medium">Email:</span> {supplier.email}</p>}
                            {supplier.phone && <p><span className="font-medium">Téléphone:</span> {supplier.phone}</p>}
                            {supplier.address && <p><span className="font-medium">Adresse:</span> {supplier.address}, {supplier.city} {supplier.postalCode}</p>}
                            {supplier.siret && <p><span className="font-medium">SIRET:</span> {supplier.siret}</p>}
                            {supplier.vatNumber && <p><span className="font-medium">TVA:</span> {supplier.vatNumber}</p>}
                            {supplier.notes && <p><span className="font-medium">Notes:</span> {supplier.notes}</p>}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(supplier)}
                        >
                            <IconEdit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onDelete(supplier)}
                        >
                            <IconTrash className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
} 
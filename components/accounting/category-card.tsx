import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IconEdit, IconTrash } from "@tabler/icons-react"

interface CategoryCardProps {
    category: any
    onEdit: (category: any) => void
    onDelete: (category: any) => void
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
    return (
        <Card className="mb-4">
            <CardContent className="p-4">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            {category.color && (
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: category.color }}
                                />
                            )}
                            <span className="font-medium">{category.name}</span>
                            <Badge variant={category.isActive ? "default" : "secondary"}>
                                {category.isActive ? "Active" : "Inactive"}
                            </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                            {category.description && <p><span className="font-medium">Description:</span> {category.description}</p>}
                            <p><span className="font-medium">Couleur:</span> {category.color}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(category)}
                        >
                            <IconEdit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onDelete(category)}
                        >
                            <IconTrash className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
} 
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { IconEdit, IconTrash } from "@tabler/icons-react"
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react"
import { ExtendedPaymentWithDetails } from "@/db/queries/extended-accounting"

interface PaymentCardProps {
    payment: ExtendedPaymentWithDetails
    onEdit: (payment: ExtendedPaymentWithDetails) => void
    onDelete: (payment: ExtendedPaymentWithDetails) => void
}

export function PaymentCard({ payment, onEdit, onDelete }: PaymentCardProps) {
    return (
        <Card className="mb-4">
            <CardContent className="p-4">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            {payment.type === 'incoming' ? (
                                <ArrowDownCircle className="h-4 w-4 text-green-600" />
                            ) : (
                                <ArrowUpCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span className="font-medium">{payment.description}</span>
                            <Badge variant={payment.type === 'incoming' ? 'default' : 'destructive'} className={payment.type === 'incoming' ? 'bg-green-500' : 'bg-red-500'}>
                                {payment.type === 'incoming' ? 'Encaissement' : 'Décaissement'}
                            </Badge>
                        </div>

                        <div className="text-sm text-muted-foreground space-y-1">
                            <p><span className="font-medium">Montant:</span> {payment.amount.toFixed(2)} €</p>
                            <p><span className="font-medium">Date:</span> {format(payment.paymentDate, "dd/MM/yyyy")}</p>
                            <p><span className="font-medium">Méthode:</span> {payment.method}</p>
                            {payment.reference && (
                                <p><span className="font-medium">Référence:</span> {payment.reference}</p>
                            )}

                            {/* Informations contextuelles */}
                            {payment.invoice && (
                                <p><span className="font-medium">Facture:</span> {payment.invoice.number} - {payment.invoice.client.name}</p>
                            )}
                            {payment.supplier && (
                                <p><span className="font-medium">Fournisseur:</span> {payment.supplier.name}</p>
                            )}
                            {payment.expenseCategory && (
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Catégorie:</span>
                                    {payment.expenseCategory.color && (
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: payment.expenseCategory.color }}
                                        />
                                    )}
                                    <span>{payment.expenseCategory.name}</span>
                                </div>
                            )}

                            {payment.notes && (
                                <p><span className="font-medium">Notes:</span> {payment.notes}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(payment)}
                        >
                            <IconEdit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onDelete(payment)}
                        >
                            <IconTrash className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
} 
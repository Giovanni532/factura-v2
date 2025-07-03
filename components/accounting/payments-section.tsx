"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PaymentCard } from "./payment-card"
import { ExtendedPaymentWithDetails } from "@/db/queries/extended-accounting"
import { Badge } from "@/components/ui/badge"

interface PaymentsSectionProps {
    filteredPayments: ExtendedPaymentWithDetails[]
    incomingPayments: ExtendedPaymentWithDetails[]
    outgoingPayments: ExtendedPaymentWithDetails[]
    onEdit: (payment: ExtendedPaymentWithDetails) => void
    onDelete: (payment: ExtendedPaymentWithDetails) => void
}

export function PaymentsSection({
    filteredPayments,
    incomingPayments,
    outgoingPayments,
    onEdit,
    onDelete
}: PaymentsSectionProps) {
    return (
        <Tabs defaultValue="all" className="w-full">
            <TabsList>
                <TabsTrigger value="all">Tous <Badge variant="secondary">{filteredPayments.length}</Badge></TabsTrigger>
                <TabsTrigger value="incoming">Encaissements <Badge variant="secondary">{incomingPayments.length}</Badge></TabsTrigger>
                <TabsTrigger value="outgoing">Décaissements <Badge variant="secondary">{outgoingPayments.length}</Badge></TabsTrigger>
            </TabsList>

            <TabsContent value="all">
                <div className="mt-6">
                    {filteredPayments.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <p className="text-muted-foreground">Aucun paiement trouvé.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredPayments.map((payment) => (
                            <PaymentCard
                                key={payment.id}
                                payment={payment}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))
                    )}
                </div>
            </TabsContent>

            <TabsContent value="incoming">
                <div className="mt-6">
                    {incomingPayments.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <p className="text-muted-foreground">Aucun encaissement trouvé.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        incomingPayments.map((payment) => (
                            <PaymentCard
                                key={payment.id}
                                payment={payment}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))
                    )}
                </div>
            </TabsContent>

            <TabsContent value="outgoing">
                <div className="mt-6">
                    {outgoingPayments.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <p className="text-muted-foreground">Aucun décaissement trouvé.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        outgoingPayments.map((payment) => (
                            <PaymentCard
                                key={payment.id}
                                payment={payment}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))
                    )}
                </div>
            </TabsContent>
        </Tabs>
    )
} 
"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { createCheckoutSessionAction, createBillingPortalAction, switchToFreePlanAction } from "@/action/billing-actions";
import { BillingPlan, CompanySubscription } from "@/db/queries/billing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Check, Crown, CreditCard, Users, Building2, FileText, AlertCircle, ExternalLink, Calendar } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface BillingSettingsClientProps {
    plans: BillingPlan[];
    currentSubscription: CompanySubscription;
    userRole: 'owner' | 'admin' | 'user';
}

export function BillingSettingsClient({ plans, currentSubscription, userRole }: BillingSettingsClientProps) {
    const [loadingPlanId, setLoadingPlanId] = useState<string | null>();
    const [showFreePlanModal, setShowFreePlanModal] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const isOwner = userRole === 'owner';

    // Vérifier les paramètres de retour de Stripe
    const paymentSuccess = searchParams.get('success');
    const paymentCanceled = searchParams.get('canceled');

    // Actions
    const { execute: createCheckoutSession, isPending: isCreatingCheckout } = useAction(createCheckoutSessionAction, {
        onSuccess: (data) => {
            if (data.data?.checkoutUrl) {
                window.location.href = data.data.checkoutUrl;
            } else {
                toast.error("Erreur lors de la création de la session de paiement");
            }
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de la création de la session de paiement");
        },
    });

    const { execute: switchToFreePlan, isPending: isSwitchingToFree } = useAction(switchToFreePlanAction, {
        onSuccess: (data) => {
            toast.success(data.data?.message || "Votre abonnement sera annulé à la fin de la période de facturation");
            setShowFreePlanModal(false);
            router.refresh();
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors du passage au plan gratuit");
            setShowFreePlanModal(false);
        },
    });

    // Gérer le paiement avec Stripe
    const handleSubscribe = async (planId: string) => {
        if (!isOwner) {
            toast.error("Seul le propriétaire peut gérer l'abonnement");
            return;
        }

        // Cas spécial pour le plan gratuit
        if (planId === 'free-plan') {
            setShowFreePlanModal(true);
            return;
        }

        setLoadingPlanId(planId);
        try {
            createCheckoutSession({
                billingPlanId: planId,
            });
            // Pas d'await car la redirection va se faire automatiquement
        } catch (error) {
            console.error("Erreur lors de la création de la session de checkout:", error);
            toast.error("Erreur lors de la création de la session de paiement");
            setLoadingPlanId(null);
        }
    };

    // Confirmer le passage au plan gratuit
    const handleConfirmFreePlan = () => {
        if (!currentSubscription.company) {
            toast.error("Informations de l'entreprise non trouvées");
            return;
        }

        switchToFreePlan({
            companyId: currentSubscription.company.id,
        });
    };



    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: currency.toUpperCase(),
            minimumFractionDigits: 2,
        }).format(price);
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Obtenir la date de fin de période la plus récente (Stripe en priorité)
    const getCurrentPeriodEnd = () => {
        // Priorité aux données Stripe si disponibles
        if (currentSubscription.stripeSubscription?.current_period_end) {
            const timestamp = currentSubscription.stripeSubscription.current_period_end;
            const date = new Date(timestamp * 1000);
            date.setMonth(date.getMonth() + 1);
            return date;
        }
        // Sinon utiliser les données de la base
        const dbDate = currentSubscription.subscription?.currentPeriodEnd;
        if (dbDate) {
            const adjustedDate = new Date(dbDate);
            adjustedDate.setMonth(adjustedDate.getMonth());
            return adjustedDate;
        }

        return dbDate;
    };

    // Obtenir le statut d'annulation le plus récent
    const getCancelAtPeriodEnd = () => {
        // Priorité aux données Stripe si disponibles
        if (currentSubscription.stripeSubscription) {
            return currentSubscription.stripeSubscription.cancel_at_period_end;
        }
        // Sinon utiliser les données de la base
        return currentSubscription.subscription?.cancelAtPeriodEnd || false;
    };

    const getCurrentPlanId = () => {
        return currentSubscription.plan?.id || 'free-plan';
    };

    const isCurrentPlan = (planId: string) => {
        return getCurrentPlanId() === planId;
    };

    return (
        <div className="space-y-6">
            {/* En-tête de la page */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Facturation et abonnements</h1>
                <p className="text-muted-foreground">
                    Gérez votre abonnement et choisissez le plan qui convient à votre entreprise
                </p>
            </div>

            {/* Alertes de statut */}
            {paymentSuccess && (
                <Alert className="border-green-200 bg-green-50">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                        <strong>Paiement réussi !</strong> Votre abonnement a été mis à jour avec succès.
                    </AlertDescription>
                </Alert>
            )}

            {paymentCanceled && (
                <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                        <strong>Paiement annulé.</strong> Votre abonnement n&apos;a pas été modifié.
                    </AlertDescription>
                </Alert>
            )}

            {/* Abonnement actuel */}
            {currentSubscription.subscription && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Crown className="h-5 w-5" />
                            Abonnement actuel
                        </CardTitle>
                        <CardDescription>
                            Votre plan et les détails de facturation
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-lg">{currentSubscription.plan?.name}</span>
                                    <Badge variant="default">
                                        {currentSubscription.subscription.status === 'active' ? 'Actif' : 'Inactif'}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {formatPrice(currentSubscription.plan?.price || 0, currentSubscription.plan?.currency || 'EUR')}
                                    / {currentSubscription.plan?.interval === 'monthly' ? 'mois' : 'an'}
                                </p>
                            </div>
                        </div>

                        {getCurrentPeriodEnd() && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                {getCancelAtPeriodEnd()
                                    ? `Expire le ${formatDate(getCurrentPeriodEnd()!)}`
                                    : `Renouvelé le ${formatDate(getCurrentPeriodEnd()!)}`
                                }
                            </div>
                        )}

                        {getCancelAtPeriodEnd() && (
                            <Alert className="border-yellow-200 bg-yellow-50">
                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                                <AlertDescription className="text-yellow-800">
                                    Votre abonnement sera annulé à la fin de la période de facturation actuelle.
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Plans de facturation */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Plans disponibles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <Card key={plan.id} className={`relative ${isCurrentPlan(plan.id) ? 'ring-2 ring-primary' : ''}`}>
                            {isCurrentPlan(plan.id) && (
                                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                                    <Badge className="bg-primary text-primary-foreground">
                                        Plan actuel
                                    </Badge>
                                </div>
                            )}

                            <CardHeader className="text-center">
                                <CardTitle className="text-xl">{plan.name}</CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                                <div className="mt-4">
                                    <span className="text-3xl font-bold">
                                        {formatPrice(plan.price, plan.currency)}
                                    </span>
                                    <span className="text-muted-foreground ml-1">
                                        / {plan.interval === 'monthly' ? 'mois' : 'an'}
                                    </span>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Users className="h-4 w-4 text-primary" />
                                        <span>
                                            {plan.maxUsers === -1 ? 'Utilisateurs illimités' : `${plan.maxUsers} utilisateur${plan.maxUsers > 1 ? 's' : ''}`}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Building2 className="h-4 w-4 text-primary" />
                                        <span>
                                            {plan.maxClients === -1 ? 'Clients illimités' : `${plan.maxClients} client${plan.maxClients > 1 ? 's' : ''}`}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <FileText className="h-4 w-4 text-primary" />
                                        <span>
                                            {plan.maxInvoices === -1 ? 'Documents illimités' : `${plan.maxInvoices} document${plan.maxInvoices > 1 ? 's' : ''}`}
                                        </span>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Fonctionnalités incluses :</h4>
                                    {plan.features.map((feature, index) => (
                                        <div key={index} className="flex items-center gap-2 text-sm">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4">
                                    {isCurrentPlan(plan.id) ? (
                                        <Button variant="outline" className="w-full" disabled>
                                            Plan actuel
                                        </Button>
                                    ) : plan.id === 'free-plan' ? (
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => handleSubscribe(plan.id)}
                                            disabled={!isOwner || loadingPlanId === plan.id}
                                        >
                                            {!isOwner ? "Accès propriétaire uniquement" :
                                                loadingPlanId === plan.id ? "Chargement..." : "Passer au plan gratuit"}
                                        </Button>
                                    ) : (
                                        <Button
                                            className="w-full gap-2"
                                            onClick={() => handleSubscribe(plan.id)}
                                            disabled={!isOwner || loadingPlanId === plan.id}
                                        >
                                            <CreditCard className="h-4 w-4" />
                                            {!isOwner ? "Accès propriétaire uniquement" :
                                                loadingPlanId === plan.id ? "Chargement..." : "Choisir ce plan"}
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Informations supplémentaires */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Informations importantes
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>• Vous pouvez changer de plan à tout moment</p>
                    <p>• Les changements prennent effet immédiatement</p>
                    <p>• Vous pouvez annuler votre abonnement à tout moment</p>
                    <p>• Seul le propriétaire de l&apos;entreprise peut modifier l&apos;abonnement</p>
                    <p>• Tous les paiements sont sécurisés par Stripe</p>
                </CardContent>
            </Card>

            {/* Modal de confirmation pour le plan gratuit */}
            <Dialog open={showFreePlanModal} onOpenChange={setShowFreePlanModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Passer au plan gratuit</DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir passer au plan gratuit ?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                <div className="space-y-2">
                                    <h4 className="font-medium text-yellow-800">Important</h4>
                                    <p className="text-sm text-yellow-700">
                                        Votre abonnement actuel restera actif jusqu&apos;à la fin de votre période de facturation.
                                    </p>
                                    {getCurrentPeriodEnd() && (
                                        <p className="text-sm text-yellow-700">
                                            <strong>Date d&apos;expiration :</strong> {formatDate(getCurrentPeriodEnd()!)}
                                        </p>
                                    )}
                                    <p className="text-sm text-yellow-700">
                                        Après cette date, vous passerez automatiquement au plan gratuit.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-medium">Ce qui va changer :</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Retour aux limitations du plan gratuit</li>
                                <li>• Aucun nouvel abonnement ne sera créé</li>
                                <li>• Vous pouvez toujours souscrire à nouveau à tout moment</li>
                            </ul>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowFreePlanModal(false)}
                            disabled={isSwitchingToFree}
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleConfirmFreePlan}
                            disabled={isSwitchingToFree}
                        >
                            {isSwitchingToFree ? "Confirmation..." : "Confirmer le passage au gratuit"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 
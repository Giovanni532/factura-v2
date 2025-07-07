"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  FileText,
  Users,
  Calculator,
  TrendingUp,
  Shield,
  Zap,
  CheckCircle,
  Star,
  Building2,
  CreditCard,
  BarChart3,
  Layout
} from "lucide-react";
import { paths } from "@/paths";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        setIsAuthenticated(!!session.data?.user);
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleAuthAction = (action: 'login' | 'signup') => {
    router.push(`/${action}`);
  };

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return router.push(paths.dashboard);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Simplifiez votre{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                facturation
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              La solution complète pour gérer vos factures, devis, clients et comptabilité.
              Factura vous fait gagner du temps et optimise votre gestion administrative.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => handleAuthAction('signup')} className="text-lg px-8 py-4">
                Commencer gratuitement
              </Button>
              <Button size="lg" variant="outline" onClick={() => handleAuthAction('login')} className="text-lg px-8 py-4">
                Se connecter
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Gratuit pour toujours • Pas de carte de crédit requise
            </p>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Des fonctionnalités complètes pour gérer votre entreprise efficacement
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Facturation intelligente</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Créez des factures et devis professionnels en quelques clics.
                  Templates personnalisables et envoi automatique.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-10 w-10 text-green-600 mb-2" />
                <CardTitle>Gestion clients</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Centralisez toutes les informations de vos clients.
                  Historique complet et suivi personnalisé.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Calculator className="h-10 w-10 text-purple-600 mb-2" />
                <CardTitle>Comptabilité avancée</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Plan comptable, exercices fiscaux, écritures comptables.
                  Tout pour une gestion financière complète.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-orange-600 mb-2" />
                <CardTitle>Rapports & Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Tableaux de bord détaillés, statistiques en temps réel
                  et rapports financiers pour piloter votre activité.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Layout className="h-10 w-10 text-red-600 mb-2" />
                <CardTitle>Templates personnalisés</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Créez vos propres modèles de documents avec votre
                  branding et vos couleurs d'entreprise.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-10 w-10 text-teal-600 mb-2" />
                <CardTitle>Sécurité & Conformité</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Vos données sont sécurisées et sauvegardées.
                  Conformité RGPD et normes comptables françaises.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Plans adaptés à vos besoins
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Commencez gratuitement et évoluez selon la croissance de votre entreprise
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Plan Gratuit */}
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Gratuit</CardTitle>
                <div className="text-4xl font-bold text-gray-900 mt-2">
                  0€<span className="text-lg font-normal text-gray-600">/mois</span>
                </div>
                <p className="text-gray-600 mt-2">Parfait pour découvrir Factura</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>1 utilisateur</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>10 clients maximum</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>20 factures/mois</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Facturation de base</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Templates prédéfinis</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Support par email</span>
                  </div>
                </div>
                <Separator />
                <Button className="w-full" onClick={() => handleAuthAction('signup')}>
                  Commencer gratuitement
                </Button>
              </CardContent>
            </Card>

            {/* Plan Petite Entreprise */}
            <Card className="border-2 border-blue-200 hover:shadow-lg transition-shadow relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white">Recommandé</Badge>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Petite Entreprise</CardTitle>
                <div className="text-4xl font-bold text-gray-900 mt-2">
                  29,99€<span className="text-lg font-normal text-gray-600">/mois</span>
                </div>
                <p className="text-gray-600 mt-2">Idéal pour les petites entreprises</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>10 utilisateurs</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>100 clients</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>500 factures/mois</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Facturation avancée</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Templates personnalisés</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Comptabilité de base</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Support prioritaire</span>
                  </div>
                </div>
                <Separator />
                <Button className="w-full" onClick={() => handleAuthAction('signup')}>
                  Commencer l'essai gratuit
                </Button>
              </CardContent>
            </Card>

            {/* Plan Grande Entreprise */}
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Grande Entreprise</CardTitle>
                <div className="text-4xl font-bold text-gray-900 mt-2">
                  99,99€<span className="text-lg font-normal text-gray-600">/mois</span>
                </div>
                <p className="text-gray-600 mt-2">Pour les grandes organisations</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>50 utilisateurs</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Clients illimités</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Factures illimitées</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Comptabilité avancée</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Rapports et analytics</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>API access</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Support dédié 24/7</span>
                  </div>
                </div>
                <Separator />
                <Button className="w-full" onClick={() => handleAuthAction('signup')}>
                  Contactez-nous
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Prêt à simplifier votre facturation ?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d'entreprises qui font confiance à Factura
            pour gérer leur facturation et leur comptabilité.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => handleAuthAction('signup')} className="text-lg px-8 py-4">
              Commencer gratuitement
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 text-white border-white hover:bg-white hover:text-blue-600">
              Planifier une démo
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}

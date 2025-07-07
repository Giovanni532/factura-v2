"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50"
    >
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              Simplifiez votre{" "}
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"
              >
                facturation
              </motion.span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              La solution complète pour gérer vos factures, devis, clients et comptabilité.
              Factura vous fait gagner du temps et optimise votre gestion administrative.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="lg" onClick={() => handleAuthAction('signup')} className="text-lg px-8 py-4">
                  Commencer gratuitement
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="lg" variant="outline" onClick={() => handleAuthAction('login')} className="text-lg px-8 py-4">
                  Se connecter
                </Button>
              </motion.div>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-sm text-gray-500 mt-4"
            >
              Gratuit pour toujours • Pas de carte de crédit requise
            </motion.p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* Pricing Section */}
      <PricingSection handleAuthAction={handleAuthAction} />

      {/* CTA Section */}
      <CTASection handleAuthAction={handleAuthAction} />

    </motion.div>
  );
}

// Features Section Component
function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: FileText,
      title: "Facturation intelligente",
      description: "Créez des factures et devis professionnels en quelques clics. Templates personnalisables et envoi automatique.",
      color: "text-blue-600"
    },
    {
      icon: Users,
      title: "Gestion clients",
      description: "Centralisez toutes les informations de vos clients. Historique complet et suivi personnalisé.",
      color: "text-green-600"
    },
    {
      icon: Calculator,
      title: "Comptabilité avancée",
      description: "Plan comptable, exercices fiscaux, écritures comptables. Tout pour une gestion financière complète.",
      color: "text-purple-600"
    },
    {
      icon: BarChart3,
      title: "Rapports & Analytics",
      description: "Tableaux de bord détaillés, statistiques en temps réel et rapports financiers pour piloter votre activité.",
      color: "text-orange-600"
    },
    {
      icon: Layout,
      title: "Templates personnalisés",
      description: "Créez vos propres modèles de documents avec votre branding et vos couleurs d'entreprise.",
      color: "text-red-600"
    },
    {
      icon: Shield,
      title: "Sécurité & Conformité",
      description: "Vos données sont sécurisées et sauvegardées. Conformité RGPD et normes comptables françaises.",
      color: "text-teal-600"
    }
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Des fonctionnalités complètes pour gérer votre entreprise efficacement
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              whileHover={{
                y: -8,
                transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
              }}
              className="group"
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-gray-200 group-hover:border-blue-200">
                <CardHeader>
                  <feature.icon className={`h-10 w-10 ${feature.color} mb-2`} />
                  <CardTitle className="group-hover:text-blue-600 transition-colors duration-300">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Pricing Section Component
function PricingSection({ handleAuthAction }: { handleAuthAction: (action: 'login' | 'signup') => void }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const plans = [
    {
      name: "Gratuit",
      price: "0€",
      description: "Parfait pour découvrir Factura",
      features: [
        "1 utilisateur",
        "10 clients maximum",
        "20 factures/mois",
        "Facturation de base",
        "Templates prédéfinis",
        "Support par email"
      ],
      isPopular: false
    },
    {
      name: "Petite Entreprise",
      price: "29,99€",
      description: "Idéal pour les petites entreprises",
      features: [
        "10 utilisateurs",
        "100 clients",
        "500 factures/mois",
        "Facturation avancée",
        "Templates personnalisés",
        "Comptabilité de base",
        "Support prioritaire"
      ],
      isPopular: true
    },
    {
      name: "Grande Entreprise",
      price: "99,99€",
      description: "Pour les grandes organisations",
      features: [
        "50 utilisateurs",
        "Clients illimités",
        "Factures illimitées",
        "Comptabilité avancée",
        "Rapports et analytics",
        "API access",
        "Support dédié 24/7"
      ],
      isPopular: false
    }
  ];

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Plans adaptés à vos besoins
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Commencez gratuitement et évoluez selon la croissance de votre entreprise
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{
                duration: 0.6,
                delay: index * 0.15,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              whileHover={{
                y: -8,
                transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
              }}
              className="group"
            >
              <Card className={`h-full border-2 hover:shadow-xl transition-all duration-300 relative ${plan.isPopular
                ? 'border-blue-300 shadow-lg bg-gradient-to-b from-blue-50 to-white'
                : 'border-gray-200 group-hover:border-blue-200'
                }`}>
                {plan.isPopular && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                    className="absolute -top-3 left-1/2 transform -translate-x-1/2"
                  >
                    <Badge className="bg-blue-600 text-white shadow-lg">Recommandé</Badge>
                  </motion.div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    className="text-4xl font-bold text-gray-900 mt-2"
                  >
                    {plan.price}<span className="text-lg font-normal text-gray-600">/mois</span>
                  </motion.div>
                  <p className="text-gray-600 mt-2">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col">
                  <div className="space-y-3 flex-1">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.div
                        key={featureIndex}
                        initial={{ opacity: 0, x: -10 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                        transition={{
                          duration: 0.4,
                          delay: 0.4 + featureIndex * 0.05,
                          ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                        className="flex items-center gap-2 text-sm"
                      >
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                  <Separator />
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      className="w-full"
                      onClick={() => handleAuthAction('signup')}
                      variant={plan.isPopular ? "default" : "outline"}
                    >
                      {index === 2 ? "Contactez-nous" : "Commencer"}
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section Component
function CTASection({ handleAuthAction }: { handleAuthAction: (action: 'login' | 'signup') => void }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto text-center"
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-3xl sm:text-4xl font-bold text-white mb-6"
        >
          Prêt à simplifier votre facturation ?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto"
        >
          Rejoignez des milliers d&apos;entreprises qui font confiance à Factura
          pour gérer leur facturation et leur comptabilité.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button size="lg" variant="secondary" onClick={() => handleAuthAction('signup')} className="text-lg px-8 py-4">
              Commencer gratuitement
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

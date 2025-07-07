"use client";

import { FileText, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function Footer() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
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

    if (isLoading) {
        return null;
    }

    if (isAuthenticated) {
        return null;
    }

    return (
        <footer id="contact" className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center mb-4">
                            <FileText className="h-8 w-8 text-blue-400" />
                            <span className="ml-2 text-xl font-bold">Factura</span>
                        </div>
                        <p className="text-gray-400 mb-4">
                            La solution complète pour votre facturation et comptabilité.
                        </p>
                        <div className="flex space-x-4">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Mail className="h-4 w-4" />
                                <span>contact@factura.fr</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Produit</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                            <li><a href="#pricing" className="hover:text-white transition-colors">Tarifs</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Mises à jour</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Ressources</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Guides</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Entreprise</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Carrières</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Confidentialité</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Mentions légales</a></li>
                        </ul>
                    </div>
                </div>

                <Separator className="my-8 bg-gray-800" />

                <div className="flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-400 text-sm">
                        © 2024 Factura. Tous droits réservés.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">
                            Conditions d'utilisation
                        </a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">
                            Politique de confidentialité
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
} 
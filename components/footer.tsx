"use client";

import { FileText, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";

export function Footer() {
    const { data: session } = authClient.useSession();

    if (session?.user) {
        return null;
    }

    return (
        <footer id="contact" className="bg-muted text-foreground py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center mb-4">
                            <FileText className="h-8 w-8 text-primary" />
                            <span className="ml-2 text-xl font-bold">Factura</span>
                        </div>
                        <p className="text-muted-foreground mb-4">
                            La solution complète pour votre facturation et comptabilité.
                        </p>
                        <div className="flex space-x-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                <span>contact@factura.fr</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Produit</h3>
                        <ul className="space-y-2 text-muted-foreground">
                            <li><a href="#features" className="hover:text-foreground transition-colors">Fonctionnalités</a></li>
                            <li><a href="#pricing" className="hover:text-foreground transition-colors">Tarifs</a></li>
                            <li><a href="#" className="hover:text-foreground transition-colors">Mises à jour</a></li>
                            <li><a href="#" className="hover:text-foreground transition-colors">Roadmap</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Ressources</h3>
                        <ul className="space-y-2 text-muted-foreground">
                            <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                            <li><a href="#" className="hover:text-foreground transition-colors">Guides</a></li>
                            <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-foreground transition-colors">Support</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Entreprise</h3>
                        <ul className="space-y-2 text-muted-foreground">
                            <li><a href="#" className="hover:text-foreground transition-colors">À propos</a></li>
                            <li><a href="#" className="hover:text-foreground transition-colors">Carrières</a></li>
                            <li><a href="#" className="hover:text-foreground transition-colors">Confidentialité</a></li>
                            <li><a href="#" className="hover:text-foreground transition-colors">Mentions légales</a></li>
                        </ul>
                    </div>
                </div>

                <Separator className="my-8" />

                <div className="flex flex-col md:flex-row justify-between items-center">
                    <p className="text-muted-foreground text-sm">
                        © 2024 Factura. Tous droits réservés.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                            Conditions d&apos;utilisation
                        </a>
                        <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                            Politique de confidentialité
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
} 
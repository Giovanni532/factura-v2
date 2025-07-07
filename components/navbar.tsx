"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const router = useRouter();
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

    const handleAuthAction = (action: 'login' | 'signup') => {
        router.push(`/${action}`);
    };

    return (
        <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center">
                            <FileText className="h-8 w-8 text-blue-600" />
                            <span className="ml-2 text-xl font-bold text-gray-900">Factura</span>
                        </div>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">
                            Fonctionnalités
                        </a>
                        <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">
                            Tarifs
                        </a>
                        <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors">
                            Contact
                        </a>
                        <Button variant="outline" onClick={() => handleAuthAction('login')}>
                            Se connecter
                        </Button>
                        <Button onClick={() => handleAuthAction('signup')}>
                            Commencer gratuitement
                        </Button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
                            <a href="#features" className="block px-3 py-2 text-gray-600 hover:text-blue-600">
                                Fonctionnalités
                            </a>
                            <a href="#pricing" className="block px-3 py-2 text-gray-600 hover:text-blue-600">
                                Tarifs
                            </a>
                            <a href="#contact" className="block px-3 py-2 text-gray-600 hover:text-blue-600">
                                Contact
                            </a>
                            <div className="flex flex-col space-y-2 px-3 py-2">
                                <Button variant="outline" onClick={() => handleAuthAction('login')}>
                                    Se connecter
                                </Button>
                                <Button onClick={() => handleAuthAction('signup')}>
                                    Commencer gratuitement
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
} 
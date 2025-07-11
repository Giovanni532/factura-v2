"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Home, ArrowLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { paths } from "@/paths";
import Link from "next/link";

export default function NotFound() {
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

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="max-w-lg mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-8"
                >
                    {/* Logo et icône 404 */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="flex flex-col items-center space-y-4"
                    >
                        <motion.div
                            animate={{
                                rotateY: [0, 360],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="flex items-center justify-center"
                        >
                            <FileText className="h-16 w-16 text-primary" />
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-6xl font-bold text-foreground"
                        >
                            404
                        </motion.h1>
                    </motion.div>

                    {/* Message d'erreur */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="space-y-3"
                    >
                        <h2 className="text-xl font-semibold text-foreground">
                            Page introuvable
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            La page que vous cherchez n&apos;existe pas ou a été déplacée.
                        </p>
                    </motion.div>

                    {/* Suggestions */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <Card className="bg-muted/50 border-border">
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2 mb-3">
                                    <Search className="h-4 w-4 text-primary" />
                                    <h3 className="font-medium text-foreground text-sm">Suggestions :</h3>
                                </div>
                                <ul className="text-xs text-muted-foreground space-y-1 text-left">
                                    <li>• Vérifiez l&apos;URL dans la barre d&apos;adresse</li>
                                    <li>• Utilisez le bouton retour de votre navigateur</li>
                                    <li>• Retournez à l&apos;accueil</li>
                                    {isAuthenticated && <li>• Consultez votre tableau de bord</li>}
                                </ul>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Boutons d'action */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="flex flex-col sm:flex-row gap-3 justify-center"
                    >
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button
                                onClick={() => router.back()}
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Retour
                            </Button>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button
                                asChild
                                size="sm"
                                className="w-full sm:w-auto"
                            >
                                <Link href={isAuthenticated ? paths.dashboard : paths.home}>
                                    <Home className="h-4 w-4 mr-2" />
                                    {isAuthenticated ? "Tableau de bord" : "Accueil"}
                                </Link>
                            </Button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
} 
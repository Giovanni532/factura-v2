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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-slate-900 dark:via-background dark:to-blue-950">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-slate-900 dark:via-background dark:to-blue-950 px-4">
            <div className="max-w-2xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-8"
                >
                    {/* Logo et icône 404 */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
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
                            <FileText className="h-20 w-20 text-primary" />
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"
                        >
                            404
                        </motion.h1>
                    </motion.div>

                    {/* Message d'erreur */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="space-y-4"
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                            Oups ! Page introuvable
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-md mx-auto">
                            La page que vous cherchez n'existe pas ou a été déplacée.
                            Pas de panique, retournons à l'essentiel !
                        </p>
                    </motion.div>

                    {/* Suggestions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        className="space-y-4"
                    >
                        <Card className="bg-background/50 backdrop-blur-sm border-border/50">
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-2 mb-4">
                                    <Search className="h-5 w-5 text-primary" />
                                    <h3 className="font-semibold text-foreground">Suggestions :</h3>
                                </div>
                                <ul className="text-sm text-muted-foreground space-y-1 text-left">
                                    <li>• Vérifiez l'URL dans la barre d'adresse</li>
                                    <li>• Utilisez le bouton retour de votre navigateur</li>
                                    <li>• Retournez à l'accueil et naviguez depuis là</li>
                                    {isAuthenticated && <li>• Consultez votre tableau de bord</li>}
                                </ul>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Boutons d'action */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                onClick={() => router.back()}
                                variant="outline"
                                size="lg"
                                className="w-full sm:w-auto"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Retour
                            </Button>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                asChild
                                size="lg"
                                className="w-full sm:w-auto"
                            >
                                <Link href={isAuthenticated ? paths.dashboard : paths.home}>
                                    <Home className="h-4 w-4 mr-2" />
                                    {isAuthenticated ? "Tableau de bord" : "Accueil"}
                                </Link>
                            </Button>
                        </motion.div>
                    </motion.div>

                    {/* Animation de décoration */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 1.2 }}
                        className="flex justify-center space-x-2 mt-8"
                    >
                        {[0, 1, 2, 3, 4].map((index) => (
                            <motion.div
                                key={index}
                                className="w-1 h-1 bg-primary/30 rounded-full"
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.3, 0.8, 0.3]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: index * 0.2,
                                    ease: "easeInOut"
                                }}
                            />
                        ))}
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
} 
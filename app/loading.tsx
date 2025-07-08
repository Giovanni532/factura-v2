"use client";

import { motion } from "framer-motion";
import { FileText } from "lucide-react";

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-slate-900 dark:via-background dark:to-blue-950">
            <div className="flex flex-col items-center space-y-8">
                {/* Logo animé */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center"
                >
                    <motion.div
                        animate={{
                            rotateY: [0, 360],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="flex items-center justify-center mb-4"
                    >
                        <FileText className="h-16 w-16 text-primary" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Factura
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Simplifiez votre facturation
                    </p>
                </motion.div>

                {/* Indicateur de chargement avec animation moderne */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="relative w-64 h-2 bg-muted rounded-full overflow-hidden"
                >
                    <motion.div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                        animate={{
                            x: [-256, 256],
                            width: [64, 128, 64]
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </motion.div>

                {/* Texte de chargement */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="text-center"
                >
                    <motion.p
                        className="text-muted-foreground font-medium"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        Chargement en cours...
                    </motion.p>
                </motion.div>

                {/* Dots animés en bas */}
                <div className="flex space-x-2">
                    {[0, 1, 2].map((index) => (
                        <motion.div
                            key={index}
                            className="w-2 h-2 bg-primary rounded-full"
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: index * 0.2,
                                ease: "easeInOut"
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
} 
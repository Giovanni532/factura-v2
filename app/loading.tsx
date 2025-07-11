"use client";

import { motion } from "framer-motion";
import { FileText } from "lucide-react";

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center space-y-8">
                {/* Logo animé */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
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
                        <FileText className="h-12 w-12 text-primary" />
                    </motion.div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Factura
                    </h1>
                    <p className="text-muted-foreground mt-2 text-sm">
                        Simplifiez votre facturation
                    </p>
                </motion.div>

                {/* Indicateur de chargement simple */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="relative w-48 h-1 bg-muted rounded-full overflow-hidden"
                >
                    <motion.div
                        className="absolute top-0 left-0 h-full bg-primary rounded-full"
                        animate={{
                            x: [-192, 192],
                            width: [48, 96, 48]
                        }}
                        transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </motion.div>

                {/* Texte de chargement */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="text-center"
                >
                    <motion.p
                        className="text-muted-foreground text-sm"
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        Chargement en cours...
                    </motion.p>
                </motion.div>
            </div>
        </div>
    );
} 
"use client";

import { authClient } from "@/lib/auth-client";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export function AuthLoading() {
    const { isPending } = authClient.useSession();
    const [showLoading, setShowLoading] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        // Ne montrer le loading que lors du chargement initial de la page
        if (isInitialLoad && isPending) {
            setShowLoading(true);
        } else if (!isPending) {
            setShowLoading(false);
            setIsInitialLoad(false);
        }
    }, [isPending, isInitialLoad]);

    if (!showLoading) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center space-y-4"
            >
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                    <Loader2 className="h-6 w-6 text-primary" />
                </motion.div>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="text-muted-foreground text-sm"
                >
                    Nous préparons au mieux votre expérience...
                </motion.p>
            </motion.div>
        </motion.div>
    );
} 
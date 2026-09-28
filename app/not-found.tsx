"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { paths } from "@/paths";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function NotFound() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();
    const reduce = useReducedMotion();

    // La page s'affiche immédiatement ; la session ne change que la destination du bouton.
    useEffect(() => {
        authClient
            .getSession()
            .then((session) => setIsAuthenticated(!!session.data?.user))
            .catch((error) => console.error("Error checking auth:", error));
    }, []);

    return (
        <main className="flex min-h-[calc(100svh-4rem)] items-center justify-center px-4 py-16">
            <motion.div
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE }}
                className="w-full max-w-lg"
            >
                {/* Écriture introuvable, présentée comme une ligne de journal */}
                <div className="rounded-xl border bg-card p-6 font-mono text-[13px] md:p-8">
                    <div className="flex justify-between pb-3">
                        <span className="ledger-label">Référence</span>
                        <span className="ledger-label">Montant</span>
                    </div>
                    <div className="flex justify-between border-t border-dashed py-3">
                        <span>ERR-404 · page introuvable</span>
                        <span className="text-muted-foreground">—</span>
                    </div>
                    <div className="flex justify-between border-t pt-3 font-semibold">
                        <span>Solde</span>
                        <span className="ledger-total pb-0.5">0,00</span>
                    </div>
                </div>

                <h1 className="mt-10 font-serif text-5xl leading-none md:text-6xl">
                    Cette page n&apos;est <em className="text-primary">pas au registre.</em>
                </h1>
                <p className="mt-4 text-muted-foreground">
                    Le lien est peut-être erroné, ou la page a été déplacée.
                </p>

                <div className="mt-8 flex flex-wrap gap-2">
                    <Button asChild>
                        <Link href={isAuthenticated ? paths.dashboard : paths.home}>
                            <Home />
                            {isAuthenticated ? "Tableau de bord" : "Accueil"}
                        </Link>
                    </Button>
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft />
                        Page précédente
                    </Button>
                </div>
            </motion.div>
        </main>
    );
}

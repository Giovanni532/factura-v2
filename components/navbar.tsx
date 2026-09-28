"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { paths } from "@/paths";
import { authClient } from "@/lib/auth-client";

// Ancres absolues : fonctionnent aussi depuis /login et /signup.
const LINKS = [
    { href: "/#features", label: "Fonctionnalités" },
    { href: "/#method", label: "Méthode" },
    { href: "/#pricing", label: "Tarifs" },
];

export function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { data: session, isPending } = authClient.useSession();

    useEffect(() => {
        // Éviter l'hydratation en ne rendant qu'après le montage
        setShouldRender(true);
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Masquer la navbar pendant le loading ou si l'utilisateur est connecté
    if (!shouldRender || isPending || session?.user) {
        return null;
    }

    return (
        <nav
            aria-label="Navigation principale"
            className={`sticky top-0 z-50 border-b transition-colors duration-300 ${scrolled || mobileMenuOpen ? "border-border bg-background/85 backdrop-blur-md" : "border-transparent bg-background/0"}`}
        >
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href={paths.home} aria-label="Factura — accueil">
                    <Logo />
                </Link>

                <div className="hidden items-center gap-8 md:flex">
                    {LINKS.map((link) => (
                        <a key={link.href} href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                            {link.label}
                        </a>
                    ))}
                </div>

                <div className="hidden items-center gap-2 md:flex">
                    <Button asChild variant="ghost">
                        <Link href={paths.login}>Se connecter</Link>
                    </Button>
                    <Button asChild>
                        <Link href={paths.signup}>Commencer</Link>
                    </Button>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-expanded={mobileMenuOpen}
                    aria-controls="mobile-nav"
                    aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                >
                    {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                </Button>
            </div>

            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        id="mobile-nav"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden border-t md:hidden"
                    >
                        <div className="space-y-1 px-4 py-4">
                            {LINKS.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block rounded-md px-3 py-2.5 text-[15px] hover:bg-accent"
                                >
                                    {link.label}
                                </a>
                            ))}
                            <div className="grid grid-cols-2 gap-2 pt-3">
                                <Button asChild variant="outline">
                                    <Link href={paths.login}>Se connecter</Link>
                                </Button>
                                <Button asChild>
                                    <Link href={paths.signup}>Commencer</Link>
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

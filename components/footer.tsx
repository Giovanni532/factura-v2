"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { authClient } from "@/lib/auth-client";
import { paths } from "@/paths";

const COLUMNS = [
    {
        title: "Produit",
        links: [
            { href: "/#features", label: "Fonctionnalités" },
            { href: "/#method", label: "Méthode" },
            { href: "/#pricing", label: "Tarifs" },
        ],
    },
    {
        title: "Compte",
        links: [
            { href: paths.login, label: "Se connecter" },
            { href: paths.signup, label: "Créer un compte" },
        ],
    },
];

export function Footer() {
    const { data: session, isPending } = authClient.useSession();
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        // Éviter l'hydratation en ne rendant qu'après le montage
        setShouldRender(true);
    }, []);

    // Masquer le footer pendant le loading ou si l'utilisateur est connecté
    if (!shouldRender || isPending || session?.user) {
        return null;
    }

    return (
        <footer id="contact" className="border-t px-4 pb-10 pt-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="grid gap-12 md:grid-cols-12">
                    <div className="md:col-span-6">
                        <Logo />
                        <p className="mt-4 max-w-sm text-muted-foreground">
                            La facturation et la comptabilité des indépendants et des petites entreprises, tenues avec la
                            rigueur d&apos;un registre.
                        </p>
                        <a
                            href="mailto:contact@factura.fr"
                            className="mt-6 inline-block font-mono text-sm underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground"
                        >
                            contact@factura.fr
                        </a>
                    </div>
                    {COLUMNS.map((column) => (
                        <div key={column.title} className="md:col-span-3">
                            <p className="ledger-label">{column.title}</p>
                            <ul className="mt-4 space-y-2.5">
                                {column.links.map((link) => (
                                    <li key={link.href}>
                                        <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-16 flex flex-col gap-2 border-t pt-6 font-mono text-xs text-muted-foreground md:flex-row md:justify-between">
                    <span>© {new Date().getFullYear()} Factura. Tous droits réservés.</span>
                    <span>Facturation · Devis · Comptabilité</span>
                </div>
            </div>
        </footer>
    );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { paths } from "@/paths";
import { InvoiceMock } from "@/components/landing/invoice-mock";
import { Features, FinalCta, Method, Pricing } from "@/components/landing/sections";

const EASE = [0.16, 1, 0.3, 1] as const;

const FACTS = ["Numérotation automatique", "TVA calculée", "Export PDF & envoi par email", "Écritures comptables générées"];

export default function Home() {
  const router = useRouter();
  const reduce = useReducedMotion();

  // La page s'affiche tout de suite ; un utilisateur connecté est ensuite
  // redirigé vers son tableau de bord.
  useEffect(() => {
    authClient
      .getSession()
      .then((session) => {
        if (session.data?.user) router.replace(paths.dashboard);
      })
      .catch((error) => console.error("Error checking auth:", error));
  }, [router]);

  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay, ease: EASE },
  });

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-24 pt-14 sm:px-6 md:pb-32 md:pt-20 lg:px-8">
        <div aria-hidden="true" className="ledger-paper pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-6">
            <motion.p {...rise(0)} className="ledger-label">
              Facturation · Devis · Comptabilité
            </motion.p>
            <motion.h1
              {...rise(0.08)}
              className="mt-6 font-serif text-[clamp(3.2rem,7vw,6.2rem)] leading-[0.92] tracking-[-0.015em]"
            >
              La facturation, tenue comme un <em className="text-primary">registre.</em>
            </motion.h1>
            <motion.p {...rise(0.18)} className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Factures, devis, clients et comptabilité au même endroit. Factura numérote, calcule, envoie et range
              chaque document — vous n&apos;avez plus qu&apos;à encaisser.
            </motion.p>
            <motion.div {...rise(0.28)} className="mt-10 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="h-12 px-6 text-[15px]">
                <Link href={paths.signup}>
                  Commencer gratuitement
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6 text-[15px]">
                <Link href={paths.login}>Se connecter</Link>
              </Button>
            </motion.div>
            <motion.p {...rise(0.36)} className="mt-5 font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground">
              Gratuit pour toujours · Sans carte bancaire
            </motion.p>
          </div>

          <div className="lg:col-span-6">
            <InvoiceMock />
          </div>
        </div>

        {/* Ce que Factura fait pour vous, en une ligne de registre */}
        <motion.ul
          {...rise(0.5)}
          className="relative mx-auto mt-24 grid max-w-7xl grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border md:grid-cols-4"
        >
          {FACTS.map((fact, i) => (
            <li key={fact} className="flex items-center gap-3 bg-card px-5 py-4 text-sm">
              <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              {fact}
            </li>
          ))}
        </motion.ul>
      </section>

      <Features />
      <Method />
      <Pricing />
      <FinalCta />
    </main>
  );
}

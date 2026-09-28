"use client";

import { motion, useReducedMotion } from "framer-motion";
import { LOGO } from "@/components/logo";

// Chargement : les deux traits du « f » se tracent en boucle, comme un total
// qu'on souligne.
export default function Loading() {
    const reduce = useReducedMotion();
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background">
            <svg viewBox={LOGO.viewBox} className="size-14" role="img" aria-label="Chargement">
                <rect width="48" height="48" rx={LOGO.radius} className="fill-primary" />
                <path d={LOGO.stem} strokeWidth={LOGO.stroke} fill="none" className="stroke-primary-foreground" />
                {LOGO.bars.map((bar, i) => (
                    <motion.rect
                        key={bar.y}
                        {...bar}
                        className="fill-primary-foreground"
                        style={{ originX: 0 }}
                        initial={{ scaleX: reduce ? 1 : 0 }}
                        animate={reduce ? undefined : { scaleX: [0, 1, 1, 0] }}
                        transition={{ duration: 1.6, delay: i * 0.18, repeat: Infinity, times: [0, 0.35, 0.8, 1], ease: "easeInOut" }}
                    />
                ))}
            </svg>
            <p className="ledger-label">Chargement du registre</p>
        </div>
    );
}

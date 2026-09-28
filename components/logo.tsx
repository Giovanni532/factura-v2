import { cn } from "@/lib/utils"

// Marque Factura : un « f » barré d'un double trait — à la fois signe monétaire
// (comme ₣) et double soulignement du total comptable.
// Géométrie unique (grille 48), réutilisée par l'icône et l'image OG.
export const LOGO = {
  viewBox: "0 0 48 48",
  radius: 11,
  stem: "M27.5 12.5h-2.2a5 5 0 0 0-5 5V37",
  stroke: 5,
  bars: [
    { x: 13, y: 21, width: 20, height: 2.6 },
    { x: 13, y: 25.6, width: 20, height: 2.6 },
  ],
  green: "#0E5A43",
  paper: "#F6F4EE",
} as const

export function LogoMark({ className, title = "Factura" }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox={LOGO.viewBox}
      role="img"
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
      className={cn("size-7 shrink-0", className)}
    >
      <rect width="48" height="48" rx={LOGO.radius} className="fill-primary" />
      <path d={LOGO.stem} strokeWidth={LOGO.stroke} fill="none" className="stroke-primary-foreground" />
      {LOGO.bars.map((bar) => (
        <rect key={bar.y} {...bar} className="fill-primary-foreground" />
      ))}
    </svg>
  )
}

export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={markClassName} title="" />
      <span className="text-[17px] font-semibold leading-none tracking-[-0.03em]">factura</span>
    </span>
  )
}

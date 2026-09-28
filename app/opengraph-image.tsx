import { ImageResponse } from "next/og"
import { LOGO } from "@/components/logo"
import { loadOgFonts } from "@/lib/og-fonts"

export const alt = "Factura — La facturation, tenue comme un registre"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const LINES = [
    ["Maquettes UI — 10 écrans", "1 800,00"],
    ["Développement Next.js", "2 880,00"],
    ["Maintenance mensuelle", "870,00"],
]

export default async function Image() {
    const fonts = await loadOgFonts(
        "factura La facturation, tenue comme un registre. Factures · Devis · Comptabilité FACTURE F-2026-0142 Total TTC 6 660,00 € PAYÉE" +
            LINES.flat().join(""),
    )
    const ink = "#121210"
    return new ImageResponse(
        (
            <div style={{ width: "100%", height: "100%", display: "flex", background: LOGO.paper, color: ink, padding: 64, fontFamily: "Instrument Sans" }}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 640 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <svg width="48" height="48" viewBox={LOGO.viewBox}>
                            <rect width="48" height="48" rx={LOGO.radius} fill={LOGO.green} />
                            <path d={LOGO.stem} stroke={LOGO.paper} strokeWidth={LOGO.stroke} fill="none" />
                            {LOGO.bars.map((bar) => (
                                <rect key={bar.y} {...bar} fill={LOGO.paper} />
                            ))}
                        </svg>
                        <span style={{ fontSize: 30, fontWeight: 600, letterSpacing: -1 }}>factura</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", fontFamily: "Instrument Serif", fontSize: 88, lineHeight: 0.95, letterSpacing: -1 }}>
                            La facturation, tenue comme un&nbsp;<span style={{ fontStyle: "italic", color: LOGO.green }}>registre.</span>
                        </div>
                        <div style={{ display: "flex", marginTop: 28, fontSize: 24, color: "#5f5c55" }}>Factures · Devis · Comptabilité</div>
                    </div>
                </div>
                <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "flex-end" }}>
                    <div style={{ display: "flex", flexDirection: "column", width: 400, padding: 32, background: "#fcfbf8", border: "1px solid #e1ddd2", borderRadius: 16, transform: "rotate(-2deg)", fontSize: 18 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "#5f5c55", fontSize: 14, letterSpacing: 2 }}>
                            <span>FACTURE</span>
                            <span>F-2026-0142</span>
                        </div>
                        {LINES.map(([label, amount]) => (
                            <div key={label} style={{ display: "flex", justifyContent: "space-between", marginTop: 18, paddingTop: 14, borderTop: "1px dashed #d6d1c4" }}>
                                <span>{label}</span>
                                <span>{amount}</span>
                            </div>
                        ))}
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22, paddingTop: 14, paddingBottom: 8, borderTop: `1px solid ${ink}`, fontWeight: 600 }}>
                            <span>Total TTC</span>
                            <span>6 660,00 €</span>
                        </div>
                        {/* Double filet du total (Satori ne gère pas border-style: double) */}
                        <div style={{ display: "flex", height: 6, borderTop: `1.5px solid ${ink}`, borderBottom: `1.5px solid ${ink}` }} />
                        <div style={{ display: "flex", alignSelf: "flex-start", marginTop: 26, padding: "6px 14px", border: `3px solid ${LOGO.green}`, borderRadius: 8, color: LOGO.green, fontWeight: 600, letterSpacing: 4, transform: "rotate(-10deg)" }}>
                            PAYÉE
                        </div>
                    </div>
                </div>
            </div>
        ),
        { ...size, fonts },
    )
}

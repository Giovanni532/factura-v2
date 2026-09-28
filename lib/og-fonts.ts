// Polices pour les images générées (Satori exige du TTF, pas le woff2 de next/font).
// Sous-ensemble limité au texte affiché ; si le réseau manque, police par défaut.
type OgFont = { name: string; data: ArrayBuffer; weight: 400 | 600; style: "normal" | "italic" }

async function load(family: string, spec: string, text: string, meta: Omit<OgFont, "data">): Promise<OgFont | null> {
    try {
        const url = `https://fonts.googleapis.com/css2?family=${family}${spec ? `:${spec}` : ""}&text=${encodeURIComponent(text)}`
        const css = await (await fetch(url)).text()
        const src = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1]
        if (!src) return null
        const res = await fetch(src)
        return res.ok ? { ...meta, data: await res.arrayBuffer() } : null
    } catch {
        return null
    }
}

export async function loadOgFonts(text: string) {
    const t = Array.from(new Set(text)).join("")
    const fonts = await Promise.all([
        load("Instrument+Serif", "", t, { name: "Instrument Serif", weight: 400, style: "normal" }),
        load("Instrument+Serif", "ital@1", t, { name: "Instrument Serif", weight: 400, style: "italic" }),
        load("Instrument+Sans", "wght@400", t, { name: "Instrument Sans", weight: 400, style: "normal" }),
        load("Instrument+Sans", "wght@600", t, { name: "Instrument Sans", weight: 600, style: "normal" }),
    ])
    return fonts.filter((f): f is OgFont => f !== null)
}

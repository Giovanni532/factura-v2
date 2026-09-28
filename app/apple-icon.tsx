import { ImageResponse } from "next/og"
import { LOGO } from "@/components/logo"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

// Fond plein (iOS arrondit lui-même les coins)
export default function AppleIcon() {
    return new ImageResponse(
        (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: LOGO.green }}>
                <svg width="150" height="150" viewBox={LOGO.viewBox}>
                    <path d={LOGO.stem} stroke={LOGO.paper} strokeWidth={LOGO.stroke} fill="none" />
                    {LOGO.bars.map((bar) => (
                        <rect key={bar.y} {...bar} fill={LOGO.paper} />
                    ))}
                </svg>
            </div>
        ),
        size,
    )
}

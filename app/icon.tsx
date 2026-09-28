import { ImageResponse } from "next/og"
import { LOGO } from "@/components/logo"

export const size = { width: 64, height: 64 }
export const contentType = "image/png"

export default function Icon() {
    return new ImageResponse(
        (
            <svg width="64" height="64" viewBox={LOGO.viewBox}>
                <rect width="48" height="48" rx={LOGO.radius} fill={LOGO.green} />
                <path d={LOGO.stem} stroke={LOGO.paper} strokeWidth={LOGO.stroke} fill="none" />
                {LOGO.bars.map((bar) => (
                    <rect key={bar.y} {...bar} fill={LOGO.paper} />
                ))}
            </svg>
        ),
        size,
    )
}

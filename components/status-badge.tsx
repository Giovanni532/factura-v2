import { Badge } from "@/components/ui/badge"
import { getStatus, toneDot, type DocumentKind } from "@/lib/status"
import { cn } from "@/lib/utils"

export function StatusBadge({
    status,
    kind = "invoice",
    className,
}: {
    status: string
    kind?: DocumentKind
    className?: string
}) {
    const { tone, label } = getStatus(status, kind)
    return (
        <Badge variant={tone} className={cn("gap-1.5", className)}>
            <span aria-hidden="true" className={cn("size-1.5 rounded-full", toneDot[tone])} />
            {label}
        </Badge>
    )
}

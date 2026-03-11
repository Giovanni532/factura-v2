import { getSession } from "@/lib/get-session"
import { getUserWithCompanyCached } from "@/lib/cache"
import { paths } from "@/paths"
import { redirect } from "next/navigation"



export default async function AccountingLayout({ children }: { children: React.ReactNode }) {
    const session = await getSession()

    if (!session?.user) {
        redirect(paths.home);
    }

    const user = await getUserWithCompanyCached(session.user.id)

    if (!user.company?.id) {
        redirect(paths.dashboard);
    }

    return children
}

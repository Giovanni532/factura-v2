import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getUserWithCompany } from "@/db/queries/company"
import { paths } from "@/paths"
import { redirect } from "next/navigation"



export default async function AccountingLayout({ children }: { children: React.ReactNode }) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user) {
        redirect(paths.home);
    }

    const user = await getUserWithCompany(session?.user?.id)

    if (!user.company?.id) {
        redirect(paths.dashboard);
    }

    return children
}

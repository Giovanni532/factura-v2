import { db } from "@/lib/drizzle";
import { user, company } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUserWithCompany(userId: string) {
    const result = await db
        .select({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                companyId: user.companyId,
                role: user.role,
            },
            company: {
                id: company.id,
                name: company.name,
                email: company.email,
                phone: company.phone,
                address: company.address,
                city: company.city,
                postalCode: company.postalCode,
                country: company.country,
                siret: company.siret,
                vatNumber: company.vatNumber,
                logo: company.logo,
            }
        })
        .from(user)
        .leftJoin(company, eq(user.companyId, company.id))
        .where(eq(user.id, userId))
        .limit(1);

    return result[0] || null;
} 
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

export async function getCompanyWithMembers(companyId: string) {
    // Récupérer les informations de l'entreprise
    const companyData = await db
        .select({
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
            createdAt: company.createdAt,
            updatedAt: company.updatedAt,
        })
        .from(company)
        .where(eq(company.id, companyId))
        .limit(1);

    if (!companyData.length) {
        return null;
    }

    // Récupérer tous les membres de l'entreprise
    const members = await db
        .select({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
        })
        .from(user)
        .where(eq(user.companyId, companyId))
        .orderBy(user.role, user.name); // Owner en premier, puis par nom

    return {
        ...companyData[0],
        subscription: {
            plan: "Pro", // Exemple statique
            maxUsers: 10,
            currentUsers: members.length,
        },
        members,
    };
} 
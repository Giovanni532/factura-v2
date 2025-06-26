"use server"
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { CreateInvoiceForm } from "@/components/invoices/create-invoice-form";

interface CreateInvoicePageProps {
    searchParams: {
        client?: string;
    };
}

export default async function CreateInvoicePage({ searchParams }: CreateInvoicePageProps) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.id) {
        redirect("/login");
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Nouvelle facture</h1>
                <p className="text-muted-foreground">
                    Créez une nouvelle facture pour votre client
                </p>
            </div>

            <CreateInvoiceForm
                onClose={() => redirect("/dashboard/invoices")}
                onInvoiceCreated={() => redirect("/dashboard/invoices")}
                defaultClientId={searchParams.client}
            />
        </div>
    );
} 
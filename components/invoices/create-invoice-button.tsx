"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { CreateInvoiceForm } from "@/components/invoices/create-invoice-form";

export function CreateInvoiceButton() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const clientId = searchParams.get('client');

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleInvoiceCreated = () => {
        setIsOpen(false);
        // Recharger la page pour afficher la nouvelle facture
        router.refresh();
    };

    return (
        <>
            <Button onClick={() => setIsOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle facture
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] min-w-[50vw] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Créer une nouvelle facture</DialogTitle>
                    </DialogHeader>
                    <CreateInvoiceForm
                        onClose={handleClose}
                        onInvoiceCreated={handleInvoiceCreated}
                        defaultClientId={clientId || undefined}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
} 
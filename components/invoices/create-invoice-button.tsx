"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus } from "lucide-react";
import { CreateInvoiceForm } from "@/components/invoices/create-invoice-form";

interface CreateInvoiceButtonProps {
    formData?: any;
    newInvoice: boolean;
    disabled?: boolean;
    limitReached?: boolean;
    planName?: string;
    maxInvoices?: number;
}

export function CreateInvoiceButton({
    formData,
    newInvoice,
    disabled = false,
    limitReached = false,
    planName = "",
    maxInvoices = 0
}: CreateInvoiceButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const searchParams = useSearchParams();
    const clientId = searchParams.get('client');

    useEffect(() => {
        setIsOpen(newInvoice);
    }, [newInvoice]);

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleInvoiceCreated = () => {
        setIsOpen(false);
    };

    const handleClick = () => {
        if (!disabled) {
            setIsOpen(true);
        }
    };

    const buttonContent = (
        <Button
            onClick={handleClick}
            disabled={disabled}
            variant={disabled ? "outline" : "default"}
        >
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle facture
        </Button>
    );

    return (
        <>
            {limitReached ? (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            {buttonContent}
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Limite atteinte pour le plan {planName}</p>
                            <p>Maximum: {maxInvoices} factures</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            ) : (
                buttonContent
            )}

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] min-w-[50vw] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Créer une nouvelle facture</DialogTitle>
                    </DialogHeader>
                    <CreateInvoiceForm
                        onClose={handleClose}
                        onInvoiceCreated={handleInvoiceCreated}
                        defaultClientId={clientId || undefined}
                        formData={formData}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
} 
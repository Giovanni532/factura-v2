"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus } from "lucide-react";
import { CreateQuoteForm } from "./create-quote-form";

interface CreateQuoteButtonProps {
    formData?: any;
    newQuote: boolean;
    disabled?: boolean;
    limitReached?: boolean;
    planName?: string;
    maxDocuments?: number;
    currentDocuments?: number;
}

export function CreateQuoteButton({
    formData,
    newQuote,
    disabled = false,
    limitReached = false,
    planName = "",
    maxDocuments = 0,
    currentDocuments = 0
}: CreateQuoteButtonProps) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setOpen(newQuote);
    }, [newQuote]);

    const handleClick = () => {
        if (!disabled) {
            setOpen(true);
        }
    };

    const buttonContent = (
        <Button
            onClick={handleClick}
            disabled={disabled}
            variant={disabled ? "outline" : "default"}
        >
            <Plus className="mr-2 h-4 w-4" />
            Nouveau devis
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
                            <p>Maximum: {maxDocuments} documents (devis + factures)</p>
                            <p>Actuellement: {currentDocuments} documents</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            ) : (
                buttonContent
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] min-w-[50vw] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Créer un nouveau devis</DialogTitle>
                    </DialogHeader>
                    <CreateQuoteForm
                        onClose={() => setOpen(false)}
                        onQuoteCreated={() => setOpen(false)}
                        formData={formData}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
} 
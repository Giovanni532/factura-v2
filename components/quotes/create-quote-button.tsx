"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { CreateQuoteForm } from "./create-quote-form";

interface CreateQuoteButtonProps {
    formData?: any;
}

export function CreateQuoteButton({ formData }: CreateQuoteButtonProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau devis
            </Button>
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
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { CreateQuoteForm } from "./create-quote-form";

export function CreateQuoteButton() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau devis
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl min-w-2xl min-h-l max-h-2xl">
                    <DialogHeader>
                        <DialogTitle>Créer un nouveau devis</DialogTitle>
                    </DialogHeader>
                    <CreateQuoteForm onClose={() => setOpen(false)} onQuoteCreated={() => setOpen(false)} />
                </DialogContent>
            </Dialog>
        </>
    );
} 
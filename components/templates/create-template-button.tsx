"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateTemplateForm } from "./create-template-form";

export function CreateTemplateButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Créer un template
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl min-w-[90vw] min-h-[90vh] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Créer un nouveau template</DialogTitle>
                </DialogHeader>
                <CreateTemplateForm onClose={() => setIsOpen(false)} />
            </DialogContent>
        </Dialog>
    );
} 
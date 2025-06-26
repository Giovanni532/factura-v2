"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { IconReceipt, IconFileInvoice } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateTemplateForm } from "./create-template-form";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CreateTemplateButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [templateType, setTemplateType] = useState<'invoice' | 'quote'>('invoice');

    const handleCreateTemplate = (type: 'invoice' | 'quote') => {
        setTemplateType(type);
        setIsOpen(true);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Créer un template
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleCreateTemplate('invoice')}>
                        <IconReceipt className="w-4 h-4 mr-2" />
                        Template de facture
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCreateTemplate('quote')}>
                        <IconFileInvoice className="w-4 h-4 mr-2" />
                        Template de devis
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <DialogContent className="max-w-4xl min-w-[90vw] min-h-[90vh] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        Créer un nouveau template de {templateType === 'invoice' ? 'facture' : 'devis'}
                    </DialogTitle>
                </DialogHeader>
                <CreateTemplateForm onClose={() => setIsOpen(false)} />
            </DialogContent>
        </Dialog>
    );
} 
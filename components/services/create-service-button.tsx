"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateServiceForm } from "@/components/services/create-service-form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export function CreateServiceButton() {
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    return (
        <>
            <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle prestation
            </Button>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Créer une nouvelle prestation</DialogTitle>
                        <DialogDescription>
                            Ajoutez les informations de votre nouvelle prestation.
                        </DialogDescription>
                    </DialogHeader>
                    <CreateServiceForm onClose={() => setShowCreateDialog(false)} />
                </DialogContent>
            </Dialog>
        </>
    );
} 
"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateClientForm } from "@/components/clients/create-client-form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export function CreateClientButton({ newClient }: { newClient: boolean }) {
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    useEffect(() => {
        setShowCreateDialog(newClient);
    }, [newClient]);

    return (
        <>
            <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau client
            </Button>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Créer un nouveau client</DialogTitle>
                        <DialogDescription>
                            Ajoutez les informations de votre nouveau client.
                        </DialogDescription>
                    </DialogHeader>
                    <CreateClientForm onClose={() => setShowCreateDialog(false)} />
                </DialogContent>
            </Dialog>
        </>
    );
} 
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CreateClientButtonProps {
    newClient: boolean;
    disabled?: boolean;
    limitReached?: boolean;
    planName?: string;
    maxClients?: number;
}

export function CreateClientButton({
    newClient,
    disabled = false,
    limitReached = false,
    planName = "",
    maxClients = 0
}: CreateClientButtonProps) {
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    useEffect(() => {
        setShowCreateDialog(newClient);
    }, [newClient]);

    const handleClick = () => {
        if (!disabled) {
            setShowCreateDialog(true);
        }
    };

    const buttonContent = (
        <Button
            onClick={handleClick}
            disabled={disabled}
            variant={disabled ? "outline" : "default"}
        >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau client
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
                            <p>Maximum: {maxClients} clients</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            ) : (
                buttonContent
            )}

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
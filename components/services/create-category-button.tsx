"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateCategoryForm } from "@/components/services/create-category-form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export function CreateCategoryButton() {
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    return (
        <>
            <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle catégorie
            </Button>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Créer une nouvelle catégorie</DialogTitle>
                        <DialogDescription>
                            Ajoutez une catégorie pour organiser vos prestations.
                        </DialogDescription>
                    </DialogHeader>
                    <CreateCategoryForm onClose={() => setShowCreateDialog(false)} />
                </DialogContent>
            </Dialog>
        </>
    );
} 
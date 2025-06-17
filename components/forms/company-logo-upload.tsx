"use client";

import React, { useState } from 'react';
import { useAction } from 'next-safe-action/hooks';
import { updateCompanyLogoAction } from '@/action/company-actions';
import { ImageUpload } from '@/components/ui/image-upload';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface CompanyLogoUploadProps {
    currentLogo?: string;
    onLogoUpdated?: (newLogo: string) => void;
}

export function CompanyLogoUpload({ currentLogo, onLogoUpdated }: CompanyLogoUploadProps) {
    const [logo, setLogo] = useState<string>(currentLogo || '');
    const [hasChanges, setHasChanges] = useState(false);

    const { execute: updateLogo, isPending } = useAction(updateCompanyLogoAction, {
        onSuccess: (result) => {
            if (result.data?.success) {
                toast.success(result.data.message);
                setHasChanges(false);
                onLogoUpdated?.(logo);
            }
        },
        onError: (error) => {
            const errorMessage = typeof error.error.serverError === 'string'
                ? error.error.serverError
                : 'Erreur lors de la mise à jour du logo';
            toast.error(errorMessage);
        }
    });

    const handleLogoChange = (newLogo: string) => {
        setLogo(newLogo);
        setHasChanges(newLogo !== currentLogo);
    };

    const handleSave = () => {
        if (!logo.trim()) {
            toast.error('Veuillez sélectionner un logo');
            return;
        }

        updateLogo({ logo });
    };

    const handleCancel = () => {
        setLogo(currentLogo || '');
        setHasChanges(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Logo de l'entreprise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <ImageUpload
                    value={logo}
                    onChange={handleLogoChange}
                    disabled={isPending}
                />

                {hasChanges && (
                    <div className="flex gap-3">
                        <Button
                            onClick={handleSave}
                            disabled={isPending || !logo}
                            className="flex-1"
                        >
                            {isPending ? 'Sauvegarde...' : 'Sauvegarder'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isPending}
                        >
                            Annuler
                        </Button>
                    </div>
                )}

                {!hasChanges && logo && (
                    <p className="text-sm text-muted-foreground">
                        Logo actuel de votre entreprise
                    </p>
                )}

                {!hasChanges && !logo && (
                    <p className="text-sm text-muted-foreground">
                        Aucun logo défini pour votre entreprise
                    </p>
                )}
            </CardContent>
        </Card>
    );
} 
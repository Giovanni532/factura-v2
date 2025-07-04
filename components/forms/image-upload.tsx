"use client";

import React, { useState } from 'react';
import { useAction } from 'next-safe-action/hooks';
import { updateCompanyLogoAction } from '@/action/company-actions';
import { updateAvatarAction } from '@/action/user-actions';
import { ImageUpload as ImageUploadBase } from '@/components/ui/image-upload';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Building2, User } from 'lucide-react';

type ImageUploadType = 'company-logo' | 'user-avatar';

interface ImageUploadProps {
    type: ImageUploadType;
    currentImage?: string;
    onImageUpdated?: (newImage: string) => void;
}

export function ImageUpload({ type, currentImage, onImageUpdated }: ImageUploadProps) {
    const [image, setImage] = useState<string>(currentImage || '');
    const [hasChanges, setHasChanges] = useState(false);

    const isCompanyLogo = type === 'company-logo';
    const isUserAvatar = type === 'user-avatar';

    // Action pour le logo de l'entreprise
    const { execute: updateCompanyLogo, isPending: isUpdatingCompanyLogo } = useAction(updateCompanyLogoAction, {
        onSuccess: (result) => {
            if (result.data?.success) {
                toast.success(result.data.message);
                setHasChanges(false);
                onImageUpdated?.(image);
            }
        },
        onError: (error) => {
            const errorMessage = typeof error.error.serverError === 'string'
                ? error.error.serverError
                : 'Erreur lors de la mise à jour du logo';
            toast.error(errorMessage);
        }
    });

    // Action pour l'avatar utilisateur
    const { execute: updateUserAvatar, isPending: isUpdatingUserAvatar } = useAction(updateAvatarAction, {
        onSuccess: (result) => {
            if (result.data?.success) {
                toast.success(result.data.message);
                setHasChanges(false);
                onImageUpdated?.(image);
            }
        },
        onError: (error) => {
            const errorMessage = typeof error.error.serverError === 'string'
                ? error.error.serverError
                : 'Erreur lors de la mise à jour de l\'avatar';
            toast.error(errorMessage);
        }
    });

    const isPending = isUpdatingCompanyLogo || isUpdatingUserAvatar;

    const handleImageChange = (newImage: string) => {
        setImage(newImage);
        setHasChanges(newImage !== currentImage);
    };

    const handleSave = () => {
        if (!image.trim()) {
            toast.error(`Veuillez sélectionner ${isCompanyLogo ? 'un logo' : 'un avatar'}`);
            return;
        }

        if (isCompanyLogo) {
            updateCompanyLogo({ logo: image });
        } else if (isUserAvatar) {
            // Pour l'avatar utilisateur, on utilise updateAvatarAction
            updateUserAvatar({ image });
        }
    };

    const handleCancel = () => {
        setImage(currentImage || '');
        setHasChanges(false);
    };

    const getTitle = () => {
        if (isCompanyLogo) return "Logo de l'entreprise";
        if (isUserAvatar) return "Avatar utilisateur";
        return "Image";
    };

    const getIcon = () => {
        if (isCompanyLogo) return <Building2 className="h-5 w-5" />;
        if (isUserAvatar) return <User className="h-5 w-5" />;
        return null;
    };

    const getEmptyMessage = () => {
        if (isCompanyLogo) return "Aucun logo défini pour votre entreprise";
        if (isUserAvatar) return "Aucun avatar défini";
        return "Aucune image définie";
    };

    const getCurrentMessage = () => {
        if (isCompanyLogo) return "Logo actuel de votre entreprise";
        if (isUserAvatar) return "Avatar actuel";
        return "Image actuelle";
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    {getIcon()}
                    {getTitle()}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <ImageUploadBase
                    value={image}
                    onChange={handleImageChange}
                    disabled={isPending}
                />

                {hasChanges && (
                    <div className="flex gap-3">
                        <Button
                            onClick={handleSave}
                            disabled={isPending || !image}
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

                {!hasChanges && image && (
                    <p className="text-sm text-muted-foreground">
                        {getCurrentMessage()}
                    </p>
                )}

                {!hasChanges && !image && (
                    <p className="text-sm text-muted-foreground">
                        {getEmptyMessage()}
                    </p>
                )}
            </CardContent>
        </Card>
    );
} 
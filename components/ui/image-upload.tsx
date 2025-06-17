import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
    value?: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    className?: string;
}

export function ImageUpload({
    value,
    onChange,
    disabled = false,
    className
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];

        // Vérifier la taille du fichier (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Le fichier ne doit pas dépasser 5MB');
            return;
        }

        setIsUploading(true);

        try {
            // Convertir en base64
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result as string;
                onChange(base64);
                setIsUploading(false);
            };
            reader.onerror = () => {
                alert('Erreur lors du chargement du fichier');
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Erreur upload:', error);
            alert('Erreur lors du téléchargement');
            setIsUploading(false);
        }
    }, [onChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.svg']
        },
        maxFiles: 1,
        disabled: disabled || isUploading
    });

    const removeImage = () => {
        onChange('');
    };

    return (
        <div className={cn("space-y-4", className)}>
            {value ? (
                <div className="relative">
                    <div className="relative aspect-square w-32 h-32 rounded-lg overflow-hidden border border-border bg-muted">
                        <img
                            src={value}
                            alt="Logo de l'entreprise"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <Button
                        type="button"
                        onClick={removeImage}
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        disabled={disabled}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            ) : (
                <div
                    {...getRootProps()}
                    className={cn(
                        "border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-primary/50",
                        isDragActive && "border-primary bg-primary/5",
                        (disabled || isUploading) && "opacity-50 cursor-not-allowed"
                    )}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-4">
                        <div className="p-3 rounded-full bg-muted">
                            {isUploading ? (
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            ) : (
                                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            )}
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium">
                                {isUploading ? 'Téléchargement en cours...' :
                                    isDragActive ? 'Déposez l\'image ici' : 'Glissez une image ou cliquez pour parcourir'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                PNG, JPG, JPEG, WebP ou SVG (max. 5MB)
                            </p>
                        </div>
                        {!isUploading && (
                            <Button type="button" variant="outline" size="sm" disabled={disabled}>
                                <Upload className="h-4 w-4 mr-2" />
                                Choisir un fichier
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
} 
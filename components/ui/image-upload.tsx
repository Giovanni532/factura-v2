import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react';
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
        <div className={cn("space-y-6", className)}>
            {value ? (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Image actuelle</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div
                                {...getRootProps()}
                                className="cursor-pointer"
                            >
                                <input {...getInputProps()} />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    disabled={disabled || isUploading}
                                    className="h-8 w-8 p-0 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"
                                >
                                    <Upload className="h-4 w-4" />
                                </Button>
                            </div>
                            <Button
                                type="button"
                                onClick={removeImage}
                                variant="ghost"
                                size="sm"
                                disabled={disabled}
                                className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 rounded-full"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="relative mx-auto w-fit">
                        <div className="aspect-square w-24 h-24 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-sm">
                            <img
                                src={value}
                                alt="Image uploadée"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    <div className="text-center mt-4">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            Cliquez sur les icônes pour modifier ou supprimer
                        </p>
                    </div>
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
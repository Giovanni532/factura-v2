"use client";

import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createServiceCategorySchema, ServiceCategory } from "@/validation/service-schema";
import { createServiceCategoryAction } from "@/action/service-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useServicesContext } from "./services-context";
import type { z } from "zod";

type CreateCategoryFormData = z.infer<typeof createServiceCategorySchema>;

interface CreateCategoryFormProps {
    onClose: () => void;
}

export function CreateCategoryForm({ onClose }: CreateCategoryFormProps) {
    const { onCategoryCreated } = useServicesContext();

    const form = useForm<CreateCategoryFormData>({
        resolver: zodResolver(createServiceCategorySchema),
        defaultValues: {
            name: "",
            description: "",
            color: "#3b82f6", // Bleu par défaut
        },
    });

    const { execute, isPending } = useAction(createServiceCategoryAction, {
        onSuccess: (result) => {
            if (result?.data) {
                toast.success(result.data.message);
                // Ajouter les propriétés manquantes pour ServiceCategory
                const categoryWithStats: ServiceCategory = {
                    ...result.data.category,
                    serviceCount: 0,
                };
                onCategoryCreated(categoryWithStats);
                onClose();
                form.reset();
            }
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de la création de la catégorie");
        }
    });

    const onSubmit = (data: CreateCategoryFormData) => {
        execute(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nom de la catégorie *</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Développement" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Description de la catégorie..."
                                    rows={3}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Couleur</FormLabel>
                            <FormControl>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="color"
                                        className="w-16 h-10 p-1"
                                        {...field}
                                    />
                                    <Input
                                        type="text"
                                        placeholder="#3b82f6"
                                        {...field}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Annuler
                    </Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Création...
                            </>
                        ) : (
                            "Créer la catégorie"
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
} 
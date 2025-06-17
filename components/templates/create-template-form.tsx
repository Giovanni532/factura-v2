"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTemplateSchema } from "@/validation/template-schema";
import { createTemplateAction } from "@/action/template-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { z } from "zod";

type CreateTemplateFormData = z.infer<typeof createTemplateSchema>;

interface CreateTemplateFormProps {
    onClose: () => void;
}

export function CreateTemplateForm({ onClose }: CreateTemplateFormProps) {
    const [previewMode, setPreviewMode] = useState<"edit" | "preview">("edit");

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        reset,
    } = useForm<CreateTemplateFormData>({
        resolver: zodResolver(createTemplateSchema),
        defaultValues: {
            name: "",
            description: "",
            html: `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facture</title>
    <style>{{CSS}}</style>
</head>
<body>
    <div class="invoice-container">
        <h1>{{company.name}}</h1>
        <p>{{company.address}}</p>
        
        <h2>FACTURE N° {{invoice.number}}</h2>
        <p>Date: {{invoice.issueDate}}</p>
        
        <h3>Facturé à:</h3>
        <p>{{client.name}}</p>
        
        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Quantité</th>
                    <th>Prix unitaire</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                {{#each items}}
                <tr>
                    <td>{{description}}</td>
                    <td>{{quantity}}</td>
                    <td>{{unitPrice}}€</td>
                    <td>{{total}}€</td>
                </tr>
                {{/each}}
            </tbody>
        </table>
        
        <div class="totals">
            <p>Sous-total: {{invoice.subtotal}}€</p>
            <p>TVA: {{invoice.taxAmount}}€</p>
            <p><strong>Total: {{invoice.total}}€</strong></p>
        </div>
    </div>
</body>
</html>`,
            css: `body {
    font-family: Arial, sans-serif;
    margin: 20px;
    color: #333;
}

.invoice-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ddd;
}

h1, h2, h3 {
    color: #2c3e50;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
}

th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}

th {
    background-color: #f2f2f2;
}

.totals {
    text-align: right;
    margin-top: 20px;
}`,
        },
    });

    const { execute: createTemplate, isPending } = useAction(createTemplateAction, {
        onSuccess: (result) => {
            if (result?.data) {
                toast.success(result.data.message);
                reset();
                onClose();
                // Recharger la page pour afficher le nouveau template
                window.location.reload();
            }
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de la création du template");
        }
    });

    const onSubmit = (data: CreateTemplateFormData) => {
        createTemplate(data);
    };

    const watchedHtml = watch("html");
    const watchedCss = watch("css");

    return (
        <div className="space-y-6">
            {/* Section d'aide pour les variables */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Variables disponibles</h3>
                <p className="text-sm text-blue-800 mb-3">
                    Utilisez ces variables dans votre HTML pour rendre votre template dynamique :
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                        <h4 className="font-semibold text-blue-900 mb-1">Entreprise</h4>
                        <ul className="space-y-1 text-blue-700 font-mono">
                            <li>{'{{company.name}}'}</li>
                            <li>{'{{company.email}}'}</li>
                            <li>{'{{company.phone}}'}</li>
                            <li>{'{{company.address}}'}</li>
                            <li>{'{{company.city}}'}</li>
                            <li>{'{{company.postalCode}}'}</li>
                            <li>{'{{company.country}}'}</li>
                            <li>{'{{company.siret}}'}</li>
                            <li>{'{{company.vatNumber}}'}</li>
                            <li>{'{{company.logo}}'}</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-blue-900 mb-1">Client</h4>
                        <ul className="space-y-1 text-blue-700 font-mono">
                            <li>{'{{client.name}}'}</li>
                            <li>{'{{client.email}}'}</li>
                            <li>{'{{client.address}}'}</li>
                            <li>{'{{client.city}}'}</li>
                            <li>{'{{client.postalCode}}'}</li>
                            <li>{'{{client.country}}'}</li>
                            <li>{'{{client.siret}}'}</li>
                            <li>{'{{client.vatNumber}}'}</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-blue-900 mb-1">Facture</h4>
                        <ul className="space-y-1 text-blue-700 font-mono">
                            <li>{'{{invoice.number}}'}</li>
                            <li>{'{{invoice.issueDate}}'}</li>
                            <li>{'{{invoice.dueDate}}'}</li>
                            <li>{'{{invoice.subtotal}}'}</li>
                            <li>{'{{invoice.taxRate}}'}</li>
                            <li>{'{{invoice.taxAmount}}'}</li>
                            <li>{'{{invoice.total}}'}</li>
                            <li>{'{{invoice.notes}}'}</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-4 pt-3 border-t border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-1">Articles (boucle)</h4>
                    <div className="text-xs text-blue-700 font-mono bg-blue-100 p-2 rounded">
                        <div>{'{{#each items}}'}</div>
                        <div className="ml-4">{'{{description}} - {{quantity}} - {{unitPrice}} - {{total}}'}</div>
                        <div>{'{{/each}}'}</div>
                    </div>
                </div>

                <div className="mt-3 pt-3 border-t border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-1">Conditions</h4>
                    <div className="text-xs text-blue-700 font-mono">
                        <div>{'{{#if variable}}...{{/if}}'} - Affiche le contenu si la variable existe</div>
                        <div className="mt-1">{'{{CSS}}'} - Remplacé par votre CSS</div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nom du template *</Label>
                            <Input
                                id="name"
                                {...register("name")}
                                placeholder="Ex: Template moderne"
                                className={errors.name ? "border-red-500" : ""}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                {...register("description")}
                                placeholder="Description de votre template..."
                                rows={3}
                            />
                            {errors.description && (
                                <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-2 space-x-2">
                            <Button
                                type="button"
                                variant={previewMode === "edit" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setPreviewMode("edit")}
                            >
                                Éditer
                            </Button>
                            <Button
                                type="button"
                                variant={previewMode === "preview" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setPreviewMode("preview")}
                            >
                                Aperçu
                            </Button>
                        </div>

                        {previewMode === "preview" && (
                            <div className="border rounded-lg h-64 overflow-auto bg-gray-50 p-4">
                                <iframe
                                    srcDoc={watchedHtml?.replace("{{CSS}}", watchedCss || "")}
                                    className="w-full h-full border-0"
                                    title="Aperçu du template"
                                    sandbox="allow-same-origin"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="html">Code HTML *</Label>
                        <Textarea
                            id="html"
                            {...register("html")}
                            placeholder="Votre code HTML..."
                            rows={12}
                            className={`font-mono text-sm ${errors.html ? "border-red-500" : ""}`}
                        />
                        {errors.html && (
                            <p className="text-sm text-red-500 mt-1">{errors.html.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="css">Code CSS</Label>
                        <Textarea
                            id="css"
                            {...register("css")}
                            placeholder="Votre code CSS..."
                            rows={12}
                            className="font-mono text-sm"
                        />
                        {errors.css && (
                            <p className="text-sm text-red-500 mt-1">{errors.css.message}</p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Annuler
                    </Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Créer le template
                    </Button>
                </div>
            </form>
        </div>
    );
} 
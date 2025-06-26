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
    defaultType?: 'invoice' | 'quote';
}

export function CreateTemplateForm({ onClose, defaultType = 'invoice' }: CreateTemplateFormProps) {
    const [previewMode, setPreviewMode] = useState<"edit" | "preview">("edit");

    // Contenu par défaut selon le type
    const getDefaultHtml = (type: 'invoice' | 'quote') => {
        if (type === 'quote') {
            return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Devis</title>
    <style>{{CSS}}</style>
</head>
<body>
    <div class="quote-container">
        <header class="quote-header">
            <div class="company-info">
                <h1>{{company.name}}</h1>
                <p>{{company.address}}</p>
                <p>{{company.city}}, {{company.postalCode}}</p>
                <p>{{company.country}}</p>
                <p>Email: {{company.email}}</p>
                <p>Tél: {{company.phone}}</p>
                {{#if company.siret}}
                <p>SIRET: {{company.siret}}</p>
                {{/if}}
                {{#if company.vatNumber}}
                <p>TVA: {{company.vatNumber}}</p>
                {{/if}}
            </div>
            <div class="quote-meta">
                <h2>DEVIS</h2>
                <div class="quote-number">N° {{quote.number}}</div>
                <div class="dates">
                    <p><strong>Date d'émission:</strong> {{quote.issueDate}}</p>
                    <p><strong>Valide jusqu'au:</strong> {{quote.validUntil}}</p>
                </div>
            </div>
        </header>

        <div class="client-info">
            <h3>Devisé pour:</h3>
            <div class="client-details">
                <p><strong>{{client.name}}</strong></p>
                <p>{{client.address}}</p>
                <p>{{client.city}}, {{client.postalCode}}</p>
                <p>{{client.country}}</p>
                <p>{{client.email}}</p>
                {{#if client.siret}}
                <p>SIRET: {{client.siret}}</p>
                {{/if}}
            </div>
        </div>

        <table class="items-table">
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
                    <td>{{unitPrice}} €</td>
                    <td>{{total}} €</td>
                </tr>
                {{/each}}
            </tbody>
        </table>

        <div class="totals">
            <div class="totals-row">
                <span>Sous-total HT:</span>
                <span>{{quote.subtotal}} €</span>
            </div>
            <div class="totals-row">
                <span>TVA ({{quote.taxRate}}%):</span>
                <span>{{quote.taxAmount}} €</span>
            </div>
            <div class="totals-row total">
                <span><strong>Total TTC:</strong></span>
                <span><strong>{{quote.total}} €</strong></span>
            </div>
        </div>

        {{#if quote.notes}}
        <div class="notes">
            <h4>Notes:</h4>
            <p>{{quote.notes}}</p>
        </div>
        {{/if}}

        {{#if quote.terms}}
        <div class="terms">
            <h4>Conditions générales:</h4>
            <p>{{quote.terms}}</p>
        </div>
        {{/if}}

        <footer class="quote-footer">
            <p>Ce devis est valable 30 jours à compter de sa date d'émission.</p>
        </footer>
    </div>
</body>
</html>`;
        }

        return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facture</title>
    <style>{{CSS}}</style>
</head>
<body>
    <div class="invoice-container">
        <header class="invoice-header">
            <div class="company-info">
                <h1>{{company.name}}</h1>
                <p>{{company.address}}</p>
                <p>{{company.city}}, {{company.postalCode}}</p>
                <p>{{company.country}}</p>
                <p>Email: {{company.email}}</p>
                <p>Tél: {{company.phone}}</p>
                {{#if company.siret}}
                <p>SIRET: {{company.siret}}</p>
                {{/if}}
                {{#if company.vatNumber}}
                <p>TVA: {{company.vatNumber}}</p>
                {{/if}}
            </div>
            <div class="invoice-meta">
                <h2>FACTURE</h2>
                <div class="invoice-number">N° {{invoice.number}}</div>
                <div class="dates">
                    <p><strong>Date d'émission:</strong> {{invoice.issueDate}}</p>
                    <p><strong>Date d'échéance:</strong> {{invoice.dueDate}}</p>
                </div>
            </div>
        </header>

        <div class="client-info">
            <h3>Facturé à:</h3>
            <div class="client-details">
                <p><strong>{{client.name}}</strong></p>
                <p>{{client.address}}</p>
                <p>{{client.city}}, {{client.postalCode}}</p>
                <p>{{client.country}}</p>
                <p>{{client.email}}</p>
                {{#if client.siret}}
                <p>SIRET: {{client.siret}}</p>
                {{/if}}
            </div>
        </div>

        <table class="items-table">
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
                    <td>{{unitPrice}} €</td>
                    <td>{{total}} €</td>
                </tr>
                {{/each}}
            </tbody>
        </table>

        <div class="totals">
            <div class="totals-row">
                <span>Sous-total HT:</span>
                <span>{{invoice.subtotal}} €</span>
            </div>
            <div class="totals-row">
                <span>TVA ({{invoice.taxRate}}%):</span>
                <span>{{invoice.taxAmount}} €</span>
            </div>
            <div class="totals-row total">
                <span><strong>Total TTC:</strong></span>
                <span><strong>{{invoice.total}} €</strong></span>
            </div>
        </div>

        {{#if invoice.notes}}
        <div class="notes">
            <h4>Notes:</h4>
            <p>{{invoice.notes}}</p>
        </div>
        {{/if}}

        <footer class="invoice-footer">
            <p>Merci pour votre confiance !</p>
        </footer>
    </div>
</body>
</html>`;
    };

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
            type: defaultType,
            html: getDefaultHtml(defaultType),
            css: `body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    background: #f8f9fa;
    padding: 20px;
}

.${defaultType === 'quote' ? 'quote' : 'invoice'}-container {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    padding: 40px;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.${defaultType === 'quote' ? 'quote' : 'invoice'}-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 40px;
    padding-bottom: 20px;
    border-bottom: 3px solid ${defaultType === 'quote' ? '#28a745' : '#007bff'};
}

.company-info h1 {
    color: ${defaultType === 'quote' ? '#28a745' : '#007bff'};
    font-size: 24px;
    margin-bottom: 10px;
}

.company-info p {
    margin: 2px 0;
    font-size: 14px;
}

.${defaultType === 'quote' ? 'quote' : 'invoice'}-meta {
    text-align: right;
}

.${defaultType === 'quote' ? 'quote' : 'invoice'}-meta h2 {
    color: ${defaultType === 'quote' ? '#28a745' : '#007bff'};
    font-size: 28px;
    margin-bottom: 10px;
}

.${defaultType === 'quote' ? 'quote' : 'invoice'}-number {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 15px;
    color: #333;
}

.dates p {
    margin: 5px 0;
    font-size: 14px;
}

.client-info {
    margin-bottom: 30px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid ${defaultType === 'quote' ? '#28a745' : '#007bff'};
}

.client-info h3 {
    color: ${defaultType === 'quote' ? '#28a745' : '#007bff'};
    margin-bottom: 15px;
    font-size: 18px;
}

.client-details p {
    margin: 2px 0;
    font-size: 14px;
}

.items-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 30px;
}

.items-table th {
    background: ${defaultType === 'quote' ? '#28a745' : '#007bff'};
    color: white;
    padding: 12px;
    text-align: left;
    font-weight: 600;
}

.items-table td {
    padding: 12px;
    border-bottom: 1px solid #eee;
}

.items-table tr:nth-child(even) {
    background: #f8f9fa;
}

.totals {
    margin-left: auto;
    width: 300px;
}

.totals-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #eee;
}

.totals-row.total {
    border-top: 2px solid ${defaultType === 'quote' ? '#28a745' : '#007bff'};
    border-bottom: none;
    font-size: 18px;
    margin-top: 10px;
    padding-top: 15px;
}

.notes, .terms {
    margin-top: 30px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
}

.notes h4, .terms h4 {
    color: ${defaultType === 'quote' ? '#28a745' : '#007bff'};
    margin-bottom: 10px;
}

.${defaultType === 'quote' ? 'quote' : 'invoice'}-footer {
    margin-top: 40px;
    text-align: center;
    color: #666;
    font-style: italic;
    ${defaultType === 'quote' ? `
    padding: 20px;
    background: #e8f5e8;
    border-radius: 8px;
    border: 1px solid #28a745;
    ` : ''}
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
                        <h4 className="font-semibold text-blue-900 mb-1">{defaultType === 'quote' ? 'Devis' : 'Facture'}</h4>
                        <ul className="space-y-1 text-blue-700 font-mono">
                            <li>{'{{' + defaultType + '.number}}'}</li>
                            <li>{'{{' + defaultType + '.issueDate}}'}</li>
                            {defaultType === 'invoice' && <li>{'{{invoice.dueDate}}'}</li>}
                            {defaultType === 'quote' && <li>{'{{quote.validUntil}}'}</li>}
                            <li>{'{{' + defaultType + '.subtotal}}'}</li>
                            <li>{'{{' + defaultType + '.taxRate}}'}</li>
                            <li>{'{{' + defaultType + '.taxAmount}}'}</li>
                            <li>{'{{' + defaultType + '.total}}'}</li>
                            <li>{'{{' + defaultType + '.notes}}'}</li>
                            {defaultType === 'quote' && <li>{'{{quote.terms}}'}</li>}
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
                                placeholder={`Ex: Template moderne ${defaultType === 'quote' ? 'devis' : 'facture'}`}
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
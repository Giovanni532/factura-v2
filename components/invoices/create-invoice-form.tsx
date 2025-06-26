"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useAction } from "next-safe-action/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus } from "lucide-react";
import { createInvoiceAction } from "@/action/invoice-actions";
import { toast } from "sonner";

interface CreateInvoiceFormData {
    clientId: string;
    templateId: string;
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
    items: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        unit: string;
        vatRate: number;
    }>;
    notes?: string;
    terms?: string;
    subtotal: number;
    vatAmount: number;
    total: number;
}

interface CreateInvoiceFormProps {
    onClose: () => void;
    onInvoiceCreated: () => void;
    defaultClientId?: string;
}

export function CreateInvoiceForm({ onClose, onInvoiceCreated, defaultClientId }: CreateInvoiceFormProps) {
    const [clients, setClients] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);

    const form = useForm<CreateInvoiceFormData>({
        defaultValues: {
            clientId: defaultClientId || "",
            templateId: "",
            invoiceNumber: "",
            issueDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 jours
            status: 'draft',
            items: [
                {
                    description: "",
                    quantity: 1,
                    unitPrice: 0,
                    unit: "unité",
                    vatRate: 20,
                }
            ],
            notes: "",
            terms: "",
            subtotal: 0,
            vatAmount: 0,
            total: 0,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    const { execute, isPending } = useAction(createInvoiceAction, {
        onSuccess: (result) => {
            if (result?.data) {
                toast.success(result.data.message);
                onInvoiceCreated();
            }
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de la création de la facture");
        }
    });

    // Charger les clients et templates
    useEffect(() => {
        const loadData = async () => {
            try {
                // TODO: Charger les clients et templates depuis l'API
                // Pour l'instant, on utilise des données factices
                setClients([
                    { id: "1", name: "Client 1", email: "client1@example.com" },
                    { id: "2", name: "Client 2", email: "client2@example.com" },
                ]);
                setTemplates([
                    { id: "1", name: "Template Classique", type: "invoice" },
                    { id: "2", name: "Template Moderne", type: "invoice" },
                ]);
            } catch (error) {
                console.error("Erreur lors du chargement des données:", error);
            }
        };

        loadData();
    }, []);

    // Calculer les totaux quand les articles changent
    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name?.startsWith('items')) {
                const items = form.getValues('items');
                const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
                const vatAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.vatRate / 100), 0);
                const total = subtotal + vatAmount;

                form.setValue('subtotal', subtotal);
                form.setValue('vatAmount', vatAmount);
                form.setValue('total', total);
            }
        });

        return () => subscription.unsubscribe();
    }, [form]);

    const onSubmit = (data: CreateInvoiceFormData) => {
        // Validation manuelle
        if (!data.clientId) {
            toast.error("Client requis");
            return;
        }
        if (!data.templateId) {
            toast.error("Template requis");
            return;
        }
        if (!data.issueDate) {
            toast.error("Date d'émission requise");
            return;
        }
        if (!data.dueDate) {
            toast.error("Date d'échéance requise");
            return;
        }
        if (data.items.length === 0) {
            toast.error("Au moins un article requis");
            return;
        }
        if (data.items.some(item => !item.description)) {
            toast.error("Description requise pour tous les articles");
            return;
        }

        execute(data);
    };

    const addItem = () => {
        append({
            description: "",
            quantity: 1,
            unitPrice: 0,
            unit: "unité",
            vatRate: 20,
        });
    };

    const removeItem = (index: number) => {
        if (fields.length > 1) {
            remove(index);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Informations générales */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informations générales</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="clientId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Client *</FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner un client" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {clients.map((client) => (
                                                    <SelectItem key={client.id} value={client.id}>
                                                        {client.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="templateId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Template *</FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner un template" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {templates.map((template) => (
                                                    <SelectItem key={template.id} value={template.id}>
                                                        {template.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="invoiceNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Numéro de facture</FormLabel>
                                        <FormControl>
                                            <Input placeholder="FACT-001" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Statut</FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="draft">Brouillon</SelectItem>
                                                <SelectItem value="sent">Envoyée</SelectItem>
                                                <SelectItem value="paid">Payée</SelectItem>
                                                <SelectItem value="overdue">En retard</SelectItem>
                                                <SelectItem value="cancelled">Annulée</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="issueDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date d'émission *</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date d'échéance *</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Articles */}
                <Card>
                    <CardHeader>
                        <CardTitle>Articles</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.description`}
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel>Description *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Description de l'article" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.quantity`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Quantité *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.unitPrice`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Prix unitaire *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.vatRate`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>TVA (%)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.1"
                                                        min="0"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex items-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeItem(index)}
                                            disabled={fields.length === 1}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <Button type="button" variant="outline" onClick={addItem}>
                            <Plus className="mr-2 h-4 w-4" />
                            Ajouter un article
                        </Button>
                    </CardContent>
                </Card>

                {/* Totaux */}
                <Card>
                    <CardHeader>
                        <CardTitle>Récapitulatif</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Sous-total:</span>
                                <span>{formatCurrency(form.watch('subtotal'))}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>TVA:</span>
                                <span>{formatCurrency(form.watch('vatAmount'))}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total:</span>
                                <span>{formatCurrency(form.watch('total'))}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Notes et conditions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Notes et conditions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Notes additionnelles pour le client..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="terms"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Conditions générales</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Conditions de paiement, délais..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Boutons d'action */}
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Annuler
                    </Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Création..." : "Créer la facture"}
                    </Button>
                </div>
            </form>
        </Form>
    );
} 
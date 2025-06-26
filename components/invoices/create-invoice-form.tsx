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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Trash2, Plus } from "lucide-react";
import { createInvoiceAction } from "@/action/invoice-actions";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

interface Service {
    id: string;
    name: string;
    description?: string;
    unitPrice: number;
    currency: string;
    unit: string;
    taxRate: number;
}

interface CreateInvoiceFormData {
    clientId: string;
    templateId: string;
    invoiceNumber: string;
    issueDate: Date;
    dueDate: Date;
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
    items: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        unit: string;
        vatRate: number;
        serviceId?: string;
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
    formData?: any;
}

export function CreateInvoiceForm({ onClose, onInvoiceCreated, defaultClientId, formData }: CreateInvoiceFormProps) {
    const [clients, setClients] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const router = useRouter();
    const form = useForm<CreateInvoiceFormData>({
        defaultValues: {
            clientId: defaultClientId || "",
            templateId: formData?.defaultTemplateId || "",
            invoiceNumber: formData?.nextInvoiceNumber || "",
            issueDate: new Date(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours
            status: 'draft',
            items: [
                {
                    description: "",
                    quantity: 1,
                    unitPrice: 0,
                    unit: "unité",
                    vatRate: 20,
                    serviceId: "none",
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

    // Charger les données depuis formData
    useEffect(() => {
        if (formData) {
            setClients(formData.clients || []);
            setTemplates(formData.templates || []);
            setServices(formData.services || []);

            // Définir le numéro de facture par défaut
            if (formData.nextInvoiceNumber) {
                form.setValue('invoiceNumber', formData.nextInvoiceNumber);
            }

            // Définir le template par défaut
            if (formData.defaultTemplateId) {
                form.setValue('templateId', formData.defaultTemplateId);
            }
        }
    }, [formData]);

    // Recalculer les totaux quand les articles changent
    useEffect(() => {
        const items = form.watch('items');
        let subtotal = 0;
        let vatAmount = 0;

        items.forEach(item => {
            const itemTotal = (item.quantity || 0) * (item.unitPrice || 0);
            subtotal += itemTotal;
            vatAmount += itemTotal * ((item.vatRate || 0) / 100);
        });

        form.setValue('subtotal', subtotal);
        form.setValue('vatAmount', vatAmount);
        form.setValue('total', subtotal + vatAmount);
    }, [form.watch('items'), form]);

    // Réinitialiser la date d'échéance si elle devient antérieure à la date d'émission
    useEffect(() => {
        const issueDate = form.watch('issueDate');
        const dueDate = form.watch('dueDate');

        if (issueDate && dueDate && dueDate < issueDate) {
            // Définir la date d'échéance à 30 jours après la date d'émission
            const newDueDate = new Date(issueDate);
            newDueDate.setDate(newDueDate.getDate() + 30);
            form.setValue('dueDate', newDueDate);
        }
    }, [form.watch('issueDate'), form]);

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

        // Convertir les dates en string pour l'API (gestion des dates null/undefined)
        const dataForApi = {
            ...data,
            issueDate: data.issueDate instanceof Date ? data.issueDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            dueDate: data.dueDate instanceof Date ? data.dueDate.toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        };

        execute(dataForApi);
    };

    const addItem = () => {
        append({
            description: "",
            quantity: 1,
            unitPrice: 0,
            unit: "unité",
            vatRate: 20,
            serviceId: "none",
        });
    };

    const removeItem = (index: number) => {
        if (fields.length > 1) {
            remove(index);
        }
    };

    const handleServiceSelect = (serviceId: string, index: number) => {
        const service = services.find(s => s.id === serviceId);
        if (service) {
            // Mettre à jour les champs
            form.setValue(`items.${index}.description`, service.description || service.name);
            form.setValue(`items.${index}.quantity`, 1);
            form.setValue(`items.${index}.unitPrice`, service.unitPrice);
            form.setValue(`items.${index}.unit`, service.unit);
            form.setValue(`items.${index}.vatRate`, service.taxRate);

            // Forcer le recalcul immédiat des totaux
            setTimeout(() => {
                const items = form.getValues('items');
                let subtotal = 0;
                let vatAmount = 0;

                items.forEach(item => {
                    const itemTotal = (item.quantity || 0) * (item.unitPrice || 0);
                    subtotal += itemTotal;
                    vatAmount += itemTotal * ((item.vatRate || 0) / 100);
                });

                form.setValue('subtotal', subtotal);
                form.setValue('vatAmount', vatAmount);
                form.setValue('total', subtotal + vatAmount);
            }, 0);
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
                                                        {template.isFavorite && "⭐ "}
                                                        {template.name}
                                                        {template.isPredefined && " (Prédéfini)"}
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

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="issueDate">Date d'émission</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !form.watch('issueDate') && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {form.watch('issueDate') ? format(form.watch('issueDate'), "PPP", { locale: fr }) : "Sélectionner une date"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={form.watch('issueDate') || undefined}
                                                onSelect={(date) => form.setValue('issueDate', date || new Date())}
                                                locale={fr}
                                                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dueDate">Date d'échéance</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !form.watch('dueDate') && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {form.watch('dueDate') ? format(form.watch('dueDate'), "PPP", { locale: fr }) : "Sélectionner une date"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={form.watch('dueDate') || undefined}
                                                onSelect={(date) => form.setValue('dueDate', date || new Date())}
                                                locale={fr}
                                                disabled={(date) => {
                                                    const issueDate = form.watch('issueDate');
                                                    return date < new Date("1900-01-01") ||
                                                        (issueDate && date < issueDate);
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Articles */}
                <Card>
                    <CardHeader>
                        <CardTitle>Prestations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                                {/* Sélecteur de prestation */}
                                <div className="mb-4">
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.serviceId`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Sélectionner une prestation</FormLabel>
                                                <Select
                                                    value={field.value || "none"}
                                                    onValueChange={(value) => {
                                                        field.onChange(value === "none" ? "" : value);
                                                        if (value && value !== "none") {
                                                            handleServiceSelect(value, index);
                                                        }
                                                    }}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Choisir une prestation..." />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="none">Aucune prestation</SelectItem>
                                                        {services.map((service) => (
                                                            <SelectItem key={service.id} value={service.id}>
                                                                {service.name} - {formatCurrency(service.unitPrice)}/{service.unit}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

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
                            Ajouter une prestation
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
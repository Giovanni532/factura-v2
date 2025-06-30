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
import { createQuoteAction } from "@/action/quote-actions";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useQuotesContext } from "./quotes-context";
import { QuoteWithDetails } from "@/validation/quote-schema";

interface Service {
    id: string;
    name: string;
    description?: string;
    unitPrice: number;
    currency: string;
    unit: string;
    taxRate: number;
}

interface CreateQuoteFormData {
    clientId: string;
    templateId: string;
    quoteNumber: string;
    issueDate: Date;
    validUntil: Date;
    status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
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

interface CreateQuoteFormProps {
    onClose: () => void;
    onQuoteCreated: () => void;
    defaultClientId?: string;
    formData?: any;
}

export function CreateQuoteForm({ onClose, onQuoteCreated, defaultClientId, formData }: CreateQuoteFormProps) {
    const [clients, setClients] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const router = useRouter();
    const { quotes, setQuotes, stats, setStats } = useQuotesContext();
    const form = useForm<CreateQuoteFormData>({
        defaultValues: {
            clientId: defaultClientId || "",
            templateId: formData?.defaultTemplateId || "",
            quoteNumber: formData?.nextQuoteNumber || "",
            issueDate: new Date(),
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours
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

    const { execute, isPending } = useAction(createQuoteAction, {
        onSuccess: (result) => {
            if (result?.data?.quote) {
                toast.success(result.data.message);

                // Créer le nouveau devis avec les détails complets
                const quoteData = result.data.quote;
                const newQuote: QuoteWithDetails = {
                    id: quoteData.id,
                    quoteNumber: quoteData.number,
                    issueDate: quoteData.issueDate,
                    validUntil: quoteData.validUntil,
                    status: quoteData.status as 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired',
                    subtotal: quoteData.subtotal,
                    vatAmount: quoteData.taxAmount,
                    total: quoteData.total,
                    notes: quoteData.notes || "",
                    terms: quoteData.terms || "",
                    companyId: quoteData.companyId,
                    clientId: quoteData.clientId,
                    templateId: quoteData.templateId,
                    createdAt: quoteData.createdAt,
                    updatedAt: quoteData.updatedAt,
                    items: [], // Les items seront chargés lors du prochain refresh
                    client: clients.find(c => c.id === quoteData.clientId) || { id: '', name: '', email: '' },
                    template: templates.find(t => t.id === quoteData.templateId) || { id: '', name: '', type: 'quote' as const },
                };

                // Ajouter le nouveau devis au début de la liste
                setQuotes([newQuote, ...quotes]);

                // Mettre à jour les statistiques
                const newStats = {
                    ...stats,
                    totalQuotes: stats.totalQuotes + 1,
                    totalRevenue: stats.totalRevenue + newQuote.total,
                };

                // Ajuster les statistiques selon le statut
                if (newQuote.status === 'accepted') {
                    newStats.totalAccepted = stats.totalAccepted + 1;
                } else if (newQuote.status === 'sent') {
                    newStats.totalPending = stats.totalPending + 1;
                }

                setStats(newStats);

                // Appeler le callback de succès
                onQuoteCreated();
            }
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de la création du devis");
        }
    });

    // Charger les données depuis formData
    useEffect(() => {
        if (formData) {
            setClients(formData.clients || []);
            setTemplates(formData.templates || []);
            setServices(formData.services || []);

            // Définir le numéro de devis par défaut
            if (formData.nextQuoteNumber) {
                form.setValue('quoteNumber', formData.nextQuoteNumber);
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

    // Réinitialiser la date de validité si elle devient antérieure à la date d'émission
    useEffect(() => {
        const issueDate = form.watch('issueDate');
        const validUntil = form.watch('validUntil');

        if (issueDate && validUntil && validUntil < issueDate) {
            form.setValue('validUntil', new Date(issueDate.getTime() + 30 * 24 * 60 * 60 * 1000));
        }
    }, [form.watch('issueDate'), form]);

    const onSubmit = (data: CreateQuoteFormData) => {
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
        if (!data.validUntil) {
            toast.error("Date de validité requise");
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

        // Préparer les données pour l'action
        const submitData = {
            ...data,
            issueDate: format(data.issueDate, 'yyyy-MM-dd'),
            validUntil: format(data.validUntil, 'yyyy-MM-dd'),
            items: data.items.map(item => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.quantity * item.unitPrice,
            })),
        };

        execute(submitData);
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
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Créer un nouveau devis</h2>
                <p className="text-muted-foreground">
                    Remplissez les informations pour créer un nouveau devis
                </p>
            </div>

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
                                            <Select onValueChange={field.onChange} value={field.value}>
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
                                            <Select onValueChange={field.onChange} value={field.value}>
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
                                    name="quoteNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Numéro de devis</FormLabel>
                                            <FormControl>
                                                <Input placeholder="DEV-2024-001" {...field} />
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
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="draft">Brouillon</SelectItem>
                                                    <SelectItem value="sent">Envoyé</SelectItem>
                                                    <SelectItem value="accepted">Accepté</SelectItem>
                                                    <SelectItem value="rejected">Refusé</SelectItem>
                                                    <SelectItem value="expired">Expiré</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="issueDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Date d'émission *</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP", { locale: fr })
                                                            ) : (
                                                                <span>Sélectionner une date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) =>
                                                            date > new Date() || date < new Date("1900-01-01")
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="validUntil"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Date de validité *</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP", { locale: fr })
                                                            ) : (
                                                                <span>Sélectionner une date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) =>
                                                            date < new Date("1900-01-01")
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
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
                                    <span>Sous-total :</span>
                                    <span>{formatCurrency(form.watch('subtotal'))}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>TVA :</span>
                                    <span>{formatCurrency(form.watch('vatAmount'))}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total :</span>
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
                                                className="resize-none"
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
                                name="terms"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Conditions générales</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Conditions générales du devis..."
                                                className="resize-none"
                                                rows={4}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isPending}
                        >
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Création..." : "Créer le devis"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
} 
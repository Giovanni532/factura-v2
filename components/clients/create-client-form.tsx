"use client";

import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClientSchema, ClientWithStats } from "@/validation/client-schema";
import { createClientAction } from "@/action/client-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhoneInput } from "@/components/ui/phone-input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useClientsContext } from "./clients-context";
import type { z } from "zod";

type CreateClientFormData = z.infer<typeof createClientSchema>;

interface CreateClientFormProps {
    onClose: () => void;
}

export function CreateClientForm({ onClose }: CreateClientFormProps) {
    const { onClientCreated } = useClientsContext();

    const form = useForm<CreateClientFormData>({
        resolver: zodResolver(createClientSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            address: "",
            city: "",
            postalCode: "",
            country: "",
            siret: "",
            vatNumber: "",
        },
    });

    const { execute, isPending } = useAction(createClientAction, {
        onSuccess: (result) => {
            if (result?.data) {
                toast.success(result.data.message);
                const clientWithStats: ClientWithStats = {
                    ...result.data.client,
                    totalInvoices: 0,
                    totalQuotes: 0,
                    totalRevenue: 0,
                    lastInvoiceDate: null,
                    lastQuoteDate: null,
                };
                onClientCreated(clientWithStats);
                onClose();
                form.reset();
            }
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de la création du client");
        }
    });

    const onSubmit = (data: CreateClientFormData) => {
        execute(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nom *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nom du client" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email *</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="email@exemple.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Téléphone</FormLabel>
                                <FormControl>
                                    <PhoneInput
                                        placeholder="Numéro de téléphone"
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Pays</FormLabel>
                                <FormControl>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionnez un pays" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="France">France</SelectItem>
                                            <SelectItem value="Suisse">Suisse</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Adresse</FormLabel>
                            <FormControl>
                                <Input placeholder="123 Rue Example" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ville</FormLabel>
                                <FormControl>
                                    <Input placeholder="Paris" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Code postal</FormLabel>
                                <FormControl>
                                    <Input placeholder="75000" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="siret"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>SIRET</FormLabel>
                                <FormControl>
                                    <Input placeholder="12345678901234" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="vatNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Numéro de TVA</FormLabel>
                                <FormControl>
                                    <Input placeholder="FR12345678901" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

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
                            "Créer le client"
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
} 
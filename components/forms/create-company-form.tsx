"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { createCompanySchema, type CreateCompanyInput } from "@/validation/company-schema";
import { createCompanyAction } from "@/action/company-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CreateCompanyForm() {
    const router = useRouter();

    const form = useForm<CreateCompanyInput>({
        resolver: zodResolver(createCompanySchema),
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

    const { execute, isPending, result } = useAction(createCompanyAction, {
        onSuccess: async (data) => {
            toast.success(data.data?.message || "Compagnie créée avec succès !");
            router.refresh(); // Rafraîchir la page pour afficher les nouvelles données
        },
        onError: (error) => {
            toast.error("Erreur lors de la création de la compagnie");
            console.error("Erreur:", error);
        },
    });

    const onSubmit = (data: CreateCompanyInput) => {
        execute(data);
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Créer votre entreprise</CardTitle>
                <CardDescription>
                    Complétez les informations de votre entreprise pour commencer à utiliser l'application.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nom de l'entreprise *</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Ex: Ma Super Entreprise" />
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
                                        <FormLabel>Email de l'entreprise *</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="email" placeholder="contact@entreprise.com" />
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
                                            <Input {...field} placeholder="01 23 45 67 89" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="siret"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>SIRET</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="12345678901234" />
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
                                        <Input {...field} placeholder="123 Rue de la Paix" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ville</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Paris" />
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
                                            <Input {...field} placeholder="75001" />
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
                                            <Input {...field} placeholder="France" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="vatNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Numéro de TVA</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="FR12345678901" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={isPending} className="w-full">
                            {isPending ? "Création en cours..." : "Créer l'entreprise"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
} 
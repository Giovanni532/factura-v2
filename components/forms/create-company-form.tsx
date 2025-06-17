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

    const { execute, isPending } = useAction(createCompanyAction, {
        onSuccess: (data) => {
            toast.success(data.data?.message || "Compagnie créée avec succès !");
            router.refresh();
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
        <div className="w-full max-w-4xl mx-auto">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Informations principales */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-foreground mb-4">
                                Informations principales
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-foreground">Nom de l'entreprise *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Ex: Ma Super Entreprise"
                                                    className="bg-background border-border"
                                                />
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
                                            <FormLabel className="text-foreground">Email de l'entreprise *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="email"
                                                    placeholder="contact@entreprise.com"
                                                    className="bg-background border-border"
                                                />
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
                                            <FormLabel className="text-foreground">Téléphone</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="01 23 45 67 89"
                                                    className="bg-background border-border"
                                                />
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
                                            <FormLabel className="text-foreground">SIRET</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="12345678901234"
                                                    className="bg-background border-border"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Adresse */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-foreground mb-4">
                                Adresse
                            </h3>
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-foreground">Adresse</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="123 Rue de la Paix"
                                                    className="bg-background border-border"
                                                />
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
                                                <FormLabel className="text-foreground">Ville</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="Paris"
                                                        className="bg-background border-border"
                                                    />
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
                                                <FormLabel className="text-foreground">Code postal</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="75001"
                                                        className="bg-background border-border"
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
                                                <FormLabel className="text-foreground">Pays</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="France"
                                                        className="bg-background border-border"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Informations fiscales */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-foreground mb-4">
                                Informations fiscales
                            </h3>
                            <FormField
                                control={form.control}
                                name="vatNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-foreground">Numéro de TVA</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="FR12345678901"
                                                className="bg-background border-border"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Bouton de soumission */}
                    <div className="flex justify-end pt-6">
                        <Button
                            type="submit"
                            disabled={isPending}
                            size="lg"
                            className="min-w-48"
                        >
                            {isPending ? "Création en cours..." : "Créer l'entreprise"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
} 
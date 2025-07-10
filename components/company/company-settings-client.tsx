"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { updateCompanySchema, type CompanyWithDetails } from "@/validation/company-schema";
import { updateCompanyAction } from "@/action/company-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Building2, Users, Crown, Shield, User, Mail, Calendar, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/forms/image-upload";
import { PhoneInput } from "@/components/ui/phone-input";
import { paths } from "@/paths";

interface CompanySettingsClientProps {
    initialCompany: CompanyWithDetails;
    userRole: 'owner' | 'admin' | 'user';
}

export function CompanySettingsClient({ initialCompany, userRole }: CompanySettingsClientProps) {
    const router = useRouter();
    const isOwner = userRole === 'owner';

    // Formulaire pour mettre à jour l'entreprise
    const companyForm = useForm({
        resolver: zodResolver(updateCompanySchema),
        defaultValues: {
            name: initialCompany.name,
            email: initialCompany.email,
            phone: initialCompany.phone || "",
            address: initialCompany.address || "",
            city: initialCompany.city || "",
            postalCode: initialCompany.postalCode || "",
            country: initialCompany.country as "France" | "Suisse" || "Suisse",
            siret: initialCompany.siret || "",
            vatNumber: initialCompany.vatNumber || "",
        },
    });

    // Action pour mettre à jour l'entreprise
    const { execute: updateCompany, isPending: isUpdatingCompany } = useAction(updateCompanyAction, {
        onSuccess: (data) => {
            toast.success(data.data?.message || "Entreprise mise à jour avec succès");
            router.refresh();
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de la mise à jour de l'entreprise");
        },
    });

    const onCompanySubmit = (data: any) => {
        updateCompany(data);
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'owner':
                return 'Propriétaire';
            case 'admin':
                return 'Administrateur';
            case 'user':
                return 'Utilisateur';
            default:
                return role;
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'owner':
                return 'bg-purple-100 text-purple-800';
            case 'admin':
                return 'bg-blue-100 text-blue-800';
            case 'user':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'owner':
                return <Crown className="h-4 w-4" />;
            case 'admin':
                return <Shield className="h-4 w-4" />;
            case 'user':
                return <User className="h-4 w-4" />;
            default:
                return <User className="h-4 w-4" />;
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            {/* En-tête de la page */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Paramètres de l&apos;entreprise</h1>
                <p className="text-muted-foreground">
                    Gérez les informations de votre entreprise et votre équipe
                </p>
            </div>



            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Colonne gauche : Informations de l'entreprise (2/3) */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Informations générales */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Informations de l&apos;entreprise
                            </CardTitle>
                            <CardDescription>
                                {isOwner ? "Gérez les informations de votre entreprise" : "Informations de l&apos;entreprise (lecture seule)"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...companyForm}>
                                <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={companyForm.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem className="md:col-span-2">
                                                    <FormLabel>Nom de l&apos;entreprise</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Mon Entreprise" disabled={!isOwner} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={companyForm.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="email" placeholder="contact@entreprise.com" disabled={!isOwner} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={companyForm.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Téléphone</FormLabel>
                                                    <FormControl>
                                                        <PhoneInput
                                                            {...field}
                                                            disabled={!isOwner}
                                                            placeholder="Entrez le numéro de téléphone"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={companyForm.control}
                                            name="address"
                                            render={({ field }) => (
                                                <FormItem className="md:col-span-2">
                                                    <FormLabel>Adresse</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="123 Rue de la Paix" disabled={!isOwner} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={companyForm.control}
                                            name="city"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Ville</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Paris" disabled={!isOwner} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={companyForm.control}
                                            name="postalCode"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Code postal</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="75001" disabled={!isOwner} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={companyForm.control}
                                            name="country"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Pays</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isOwner}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Sélectionner un pays" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="France">France</SelectItem>
                                                            <SelectItem value="Suisse">Suisse</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={companyForm.control}
                                            name="siret"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>SIRET</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="12345678901234" disabled={!isOwner} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={companyForm.control}
                                            name="vatNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Numéro de TVA</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="FR12345678901" disabled={!isOwner} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {isOwner && (
                                        <div className="flex justify-end pt-4">
                                            <Button
                                                type="submit"
                                                disabled={isUpdatingCompany}
                                                className="w-40"
                                            >
                                                {isUpdatingCompany ? "Mise à jour..." : "Mettre à jour"}
                                            </Button>
                                        </div>
                                    )}
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>

                {/* Colonne droite : Logo et abonnement (1/3) */}
                <div className="space-y-6">
                    {/* Logo de l'entreprise */}
                    {isOwner && (
                        <ImageUpload
                            type="company-logo"
                            currentImage={initialCompany.logo || ""}
                            onImageUpdated={() => {
                                router.refresh();
                            }}
                        />
                    )}

                    {/* Abonnement */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Abonnement
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Plan actuel</span>
                                <Badge variant="default" className="font-medium">{initialCompany.subscription.plan}</Badge>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Utilisateurs</span>
                                    <span className="font-medium">
                                        {initialCompany.subscription.currentUsers} / {initialCompany.subscription.maxUsers === -1 ? '∞' : initialCompany.subscription.maxUsers}
                                    </span>
                                </div>
                                {initialCompany.subscription.maxUsers !== -1 && (
                                    <div className="w-full bg-muted rounded-full h-2">
                                        <div
                                            className="h-2 rounded-full transition-all bg-green-500"
                                            style={{
                                                width: `${Math.min(100, (initialCompany.subscription.currentUsers / initialCompany.subscription.maxUsers) * 100)}%`
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Fonctionnalités du plan */}
                            {initialCompany.subscription.features.length > 0 && (
                                <div className="space-y-2">
                                    <span className="text-sm font-medium">Fonctionnalités :</span>
                                    <div className="space-y-1">
                                        {initialCompany.subscription.features.slice(0, 4).map((feature, index) => (
                                            <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
                                                <span className="text-xs">{feature}</span>
                                            </div>
                                        ))}
                                        {initialCompany.subscription.features.length > 4 && (
                                            <div className="text-xs text-muted-foreground pl-3">
                                                +{initialCompany.subscription.features.length - 4} autres fonctionnalités
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Bouton de gestion de l'abonnement */}
                            {isOwner && (
                                <div className="pt-2">
                                    <Button
                                        variant="outline"
                                        className="w-full gap-2"
                                        onClick={() => router.push(paths.settings.billing)}
                                    >
                                        <CreditCard className="h-4 w-4" />
                                        Gérer l&apos;abonnement
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 
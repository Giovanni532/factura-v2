"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { updateCompanySchema, inviteUserSchema, type CompanyWithDetails } from "@/validation/company-schema";
import { updateCompanyAction, inviteUserAction } from "@/action/company-actions";
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
import { Building2, Users, Crown, Shield, User, Mail, Calendar, Plus, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/forms/image-upload";

interface CompanySettingsClientProps {
    initialCompany: CompanyWithDetails;
    userRole: 'owner' | 'admin' | 'user';
}

export function CompanySettingsClient({ initialCompany, userRole }: CompanySettingsClientProps) {
    const [showInviteDialog, setShowInviteDialog] = useState(false);
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
            country: initialCompany.country || "",
            siret: initialCompany.siret || "",
            vatNumber: initialCompany.vatNumber || "",
        },
    });

    // Formulaire pour inviter un utilisateur
    const inviteForm = useForm({
        resolver: zodResolver(inviteUserSchema),
        defaultValues: {
            name: "",
            email: "",
            role: "user" as const,
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

    // Action pour inviter un utilisateur
    const { execute: inviteUser, isPending: isInvitingUser } = useAction(inviteUserAction, {
        onSuccess: (data) => {
            toast.success(data.data?.message || "Utilisateur invité avec succès");
            inviteForm.reset();
            setShowInviteDialog(false);
            router.refresh();
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de l'invitation de l'utilisateur");
        },
    });

    const onCompanySubmit = (data: any) => {
        updateCompany(data);
    };

    const onInviteSubmit = (data: any) => {
        inviteUser(data);
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
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Colonne gauche : Informations de l'entreprise */}
            <div className="space-y-6">
                {/* Informations générales */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Informations de l'entreprise
                        </CardTitle>
                        <CardDescription>
                            {isOwner ? "Gérez les informations de votre entreprise" : "Informations de l'entreprise (lecture seule)"}
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
                                                <FormLabel>Nom de l'entreprise</FormLabel>
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
                                                    <Input {...field} placeholder="01 23 45 67 89" disabled={!isOwner} />
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
                                                <FormControl>
                                                    <Input {...field} placeholder="France" disabled={!isOwner} />
                                                </FormControl>
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
                                    <div className="flex justify-end">
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

            {/* Colonne droite : Logo, abonnement et membres */}
            <div className="space-y-3">
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
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Shield className="h-5 w-5" />
                            Abonnement
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="font-medium">Plan actuel</span>
                            <Badge variant="default">{initialCompany.subscription?.plan || "Gratuit"}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Utilisateurs</span>
                            <span className="text-sm">
                                {initialCompany.subscription?.currentUsers || 0} / {initialCompany.subscription?.maxUsers || 1}
                            </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                            <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{
                                    width: `${Math.min(100, ((initialCompany.subscription?.currentUsers || 0) / (initialCompany.subscription?.maxUsers || 1)) * 100)}%`
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Membres de l'équipe */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                <CardTitle className="text-lg">Membres de l'équipe</CardTitle>
                            </div>
                            {isOwner && (
                                <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" className="gap-2">
                                            <UserPlus className="h-4 w-4" />
                                            Inviter
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Inviter un nouveau membre</DialogTitle>
                                            <DialogDescription>
                                                Ajoutez un nouveau membre à votre équipe
                                            </DialogDescription>
                                        </DialogHeader>
                                        <Form {...inviteForm}>
                                            <form onSubmit={inviteForm.handleSubmit(onInviteSubmit)} className="space-y-4">
                                                <FormField
                                                    control={inviteForm.control}
                                                    name="name"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Nom complet</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} placeholder="Jean Dupont" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={inviteForm.control}
                                                    name="email"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Email</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} type="email" placeholder="jean@exemple.com" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={inviteForm.control}
                                                    name="role"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Rôle</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Sélectionner un rôle" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="user">Utilisateur</SelectItem>
                                                                    <SelectItem value="admin">Administrateur</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <div className="flex gap-2 justify-end">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => setShowInviteDialog(false)}
                                                    >
                                                        Annuler
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        disabled={isInvitingUser}
                                                    >
                                                        {isInvitingUser ? "Invitation..." : "Inviter"}
                                                    </Button>
                                                </div>
                                            </form>
                                        </Form>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                        <CardDescription>
                            {initialCompany.members.length} membre{initialCompany.members.length > 1 ? 's' : ''} dans l'équipe
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {initialCompany.members.map((member) => (
                                <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="text-sm">
                                                {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm">{member.name}</span>
                                                <Badge variant="outline" className={`${getRoleColor(member.role)} text-xs gap-1`}>
                                                    {getRoleIcon(member.role)}
                                                    {getRoleLabel(member.role)}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Mail className="h-3 w-3" />
                                                {member.email}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                Rejoint le {formatDate(new Date(member.createdAt))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 
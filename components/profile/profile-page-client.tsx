"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { updateProfileSchema, changePasswordSchema, type UserProfile } from "@/validation/user-schema";
import { updateProfileAction, changePasswordAction } from "@/action/user-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { toast } from "sonner";
import { User, Mail, Calendar, Shield, Eye, EyeOff } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface ProfilePageClientProps {
    initialUser: UserProfile;
}

export function ProfilePageClient({ initialUser }: ProfilePageClientProps) {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const router = useRouter();

    // Formulaire pour mettre à jour le profil
    const profileForm = useForm({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            name: initialUser.name,
        },
    });

    // Formulaire pour changer le mot de passe
    const passwordForm = useForm({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    // Actions
    const { execute: updateProfile, isPending: isUpdatingProfile } = useAction(updateProfileAction, {
        onSuccess: async (data) => {
            toast.success(data.data?.message || "Profil mis à jour avec succès");
            // Rafraîchir la session et la page pour refléter les changements partout
            try {
                await authClient.getSession();
                router.refresh();
            } catch (error) {
                console.error("Erreur lors du rafraîchissement de la session:", error);
            }
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de la mise à jour du profil");
        },
    });

    const { execute: changePassword, isPending: isChangingPassword } = useAction(changePasswordAction, {
        onSuccess: (data) => {
            toast.success(data.data?.message || "Mot de passe changé avec succès");
            passwordForm.reset();
            setShowPasswordForm(false);
            setShowCurrentPassword(false);
            setShowNewPassword(false);
            setShowConfirmPassword(false);
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors du changement de mot de passe");
        },
    });

    const onProfileSubmit = (data: any) => {
        updateProfile(data);
    };

    const onPasswordSubmit = (data: any) => {
        changePassword(data);
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

    return (
        <div className="space-y-8">
            {/* Informations générales */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Informations du profil
                    </CardTitle>
                    <CardDescription>
                        Gérez les informations de votre profil utilisateur
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Informations utilisateur */}
                    <div className="flex items-center space-x-4 mb-6">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={initialUser.image || ""} alt={initialUser.name} />
                            <AvatarFallback className="text-lg">
                                {initialUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-semibold">{initialUser.name}</h3>
                                <Badge className={getRoleColor(initialUser.role)}>
                                    {getRoleLabel(initialUser.role)}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Mail className="h-4 w-4" />
                                    {initialUser.email}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    Membre depuis {new Date(initialUser.createdAt).toLocaleDateString('fr-FR')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Formulaire de mise à jour du profil */}
                    <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <FormField
                                    control={profileForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Prénom et Nom</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Jean Dupont" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-2">
                                    <FormLabel>Email</FormLabel>
                                    <Input
                                        value={initialUser.email}
                                        disabled
                                        className="bg-muted text-muted-foreground"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        L'email ne peut pas être modifié pour des raisons de sécurité
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={isUpdatingProfile}
                                    className="w-32"
                                >
                                    {isUpdatingProfile ? "Mise à jour..." : "Mettre à jour"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Changement de mot de passe */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Sécurité
                    </CardTitle>
                    <CardDescription>
                        Gérez la sécurité de votre compte
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!showPasswordForm ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">Mot de passe</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Voulez-vous changer votre mot de passe ?
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowPasswordForm(true)}
                                >
                                    Changer le mot de passe
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium">Changer le mot de passe</h4>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setShowPasswordForm(false);
                                        passwordForm.reset();
                                        setShowCurrentPassword(false);
                                        setShowNewPassword(false);
                                        setShowConfirmPassword(false);
                                    }}
                                >
                                    Annuler
                                </Button>
                            </div>
                            <Form {...passwordForm}>
                                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                                    <FormField
                                        control={passwordForm.control}
                                        name="currentPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Mot de passe actuel</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            {...field}
                                                            type={showCurrentPassword ? "text" : "password"}
                                                            placeholder="Votre mot de passe actuel"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                        >
                                                            {showCurrentPassword ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={passwordForm.control}
                                        name="newPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nouveau mot de passe</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            {...field}
                                                            type={showNewPassword ? "text" : "password"}
                                                            placeholder="Votre nouveau mot de passe"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                                        >
                                                            {showNewPassword ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={passwordForm.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirmer le nouveau mot de passe</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            {...field}
                                                            type={showConfirmPassword ? "text" : "password"}
                                                            placeholder="Confirmez votre nouveau mot de passe"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        >
                                                            {showConfirmPassword ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={isChangingPassword}
                                            className="w-52"
                                        >
                                            {isChangingPassword ? "Changement..." : "Changer le mot de passe"}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 
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
import { Skeleton } from "@/components/ui/skeleton";
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
import { User, Mail, Calendar, Shield, Eye, EyeOff, Edit3, Camera } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/forms/image-upload";

interface ProfilePageClientProps {
    initialUser: UserProfile;
}

export function ProfilePageClient({ initialUser }: ProfilePageClientProps) {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [showAvatarUpload, setShowAvatarUpload] = useState(false);
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
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            case 'admin':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'user':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-8 pb-12">
            {/* Avatar et infos */}
            <div className="flex flex-col items-center gap-2 w-full">
                <div className="relative group">
                    <button
                        type="button"
                        aria-label="Changer l'avatar"
                        className="absolute inset-0 w-full h-full rounded-full z-10 focus:outline-none"
                        style={{ background: 'transparent', border: 'none', padding: 0 }}
                        onClick={() => setShowAvatarUpload(true)}
                    >
                        <span className="sr-only">Changer l'avatar</span>
                    </button>
                    <Avatar className="h-28 w-28 border-4 border-background shadow-lg bg-muted pointer-events-none">
                        <AvatarImage src={initialUser.image || ""} alt={initialUser.name} />
                        <AvatarFallback className="text-2xl font-semibold">
                            {initialUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <button
                        type="button"
                        aria-label="Changer l'avatar"
                        className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-md border border-gray-200 hover:bg-gray-100 transition z-20"
                        onClick={() => setShowAvatarUpload(true)}
                    >
                        <Camera className="h-5 w-5 text-gray-700" />
                    </button>
                    {showAvatarUpload && (
                        <div className="absolute left-1/2 top-full z-20 -translate-x-1/2 mt-2">
                            <Card className="p-4 w-64 shadow-xl">
                                <ImageUpload
                                    type="user-avatar"
                                    currentImage={initialUser.image || ""}
                                    onImageUpdated={() => {
                                        setShowAvatarUpload(false);
                                        router.refresh();
                                    }}
                                    avatarMode={true}
                                />
                                <Button variant="ghost" className="w-full mt-2" onClick={() => setShowAvatarUpload(false)}>
                                    Annuler
                                </Button>
                            </Card>
                        </div>
                    )}
                </div>
                <h1 className="text-2xl font-bold mt-2 text-center">{initialUser.name}</h1>
                <div className="flex flex-col items-center gap-1">
                    <Badge className={getRoleColor(initialUser.role)}>
                        {initialUser.companyName ?
                            getRoleLabel(initialUser.role) + " de " + initialUser.companyName
                            :
                            getRoleLabel(initialUser.role)
                        }
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {initialUser.email}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Membre depuis le {formatDate(new Date(initialUser.createdAt))}
                    </p>
                </div>
            </div>

            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 px-2 md:px-0">
                {/* Informations du profil */}
                <Card className="border-0 shadow-sm w-full">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <User className="h-5 w-5" />
                            Informations personnelles
                        </CardTitle>
                        <CardDescription>
                            Modifiez vos informations de base
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...profileForm}>
                            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                                <FormField
                                    control={profileForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nom complet</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Jean Dupont" className="h-11" />
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
                                        className="h-11 bg-muted/50 text-muted-foreground"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        L&apos;email ne peut pas être modifié pour des raisons de sécurité
                                    </p>
                                </div>

                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        disabled={isUpdatingProfile}
                                        className="w-full h-11"
                                    >
                                        {isUpdatingProfile ? "Mise à jour..." : "Mettre à jour le profil"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                {/* Sécurité */}
                <Card className="border-0 shadow-sm w-full">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
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
                                <div className="p-4 bg-muted/30 rounded-lg">
                                    <h4 className="font-medium mb-1">Mot de passe</h4>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Changez votre mot de passe pour sécuriser votre compte
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowPasswordForm(true)}
                                        className="w-full"
                                    >
                                        <Edit3 className="h-4 w-4 mr-2" />
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
                                                                className="h-11 pr-10"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9"
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
                                                                className="h-11 pr-10"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9"
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
                                                                className="h-11 pr-10"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9"
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

                                        <div className="pt-2">
                                            <Button
                                                type="submit"
                                                disabled={isChangingPassword}
                                                className="w-full h-11"
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
        </div>
    );
} 
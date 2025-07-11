"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, User, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { paths } from "@/paths";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const invitationSchema = z.object({
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});

interface InvitationClientProps {
    token: string;
    email: string;
    userName: string;
    invitationData: {
        name: string;
        email: string;
        role: "user" | "owner" | "admin";
        companyId: string | null;
    };
}

export function InvitationClient({ token, email, userName, invitationData }: InvitationClientProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const form = useForm({
        resolver: zodResolver(invitationSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof invitationSchema>) => {
        setIsLoading(true);
        setError(null);

        try {
            // Utiliser Better Auth signUp pour créer le compte
            const { data: signUpData, error: signUpError } = await authClient.signUp.email({
                email,
                password: data.password,
                name: userName,
                callbackURL: paths.dashboard,
            }, {
                onRequest: () => {
                    setIsLoading(true);
                },
                onSuccess: async () => {
                    // Une fois le compte créé avec Better Auth, lier l'utilisateur à l'entreprise
                    try {
                        const response = await fetch("/api/invitation/link-user", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                invitationData,
                            }),
                        });

                        if (!response.ok) {
                            throw new Error("Erreur lors de la liaison à l'entreprise");
                        }

                        setSuccess(true);
                        toast.success("Compte activé avec succès !");

                        // Rediriger vers le dashboard après 2 secondes
                        setTimeout(() => {
                            router.push(paths.dashboard);
                        }, 2000);
                    } catch (linkError) {
                        console.error("Erreur lors de la liaison:", linkError);
                        setError("Compte créé mais erreur lors de la liaison à l'entreprise");
                    }
                },
                onError: (ctx) => {
                    setError(ctx.error.message || "Erreur lors de la création du compte");
                    setIsLoading(false);
                },
            });

            if (signUpError) {
                setError(signUpError.message || "Erreur lors de la création du compte");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Une erreur est survenue");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <Card>
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-2xl">Invitation acceptée !</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-muted-foreground mb-4">
                        Votre compte a été activé avec succès. Vous allez être redirigé vers le tableau de bord...
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Rejoindre l'équipe</CardTitle>
                <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{userName}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{email}</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert className="mb-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <AlertDescription className="text-red-600 dark:text-red-400">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mot de passe</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Entrez votre mot de passe"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirmer le mot de passe</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Confirmez votre mot de passe"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? "Activation en cours..." : "Activer mon compte"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
} 
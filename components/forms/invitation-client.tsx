"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, User, Mail, Eye, EyeOff, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { paths } from "@/paths";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Fonction pour valider la force du mot de passe
const validatePassword = (password: string) => {
    const checks = {
        length: password.length >= 8,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const score = Object.values(checks).filter(Boolean).length;

    let strength = 'Très faible';
    let color = 'text-red-500';

    if (score >= 5) {
        strength = 'Très fort';
        color = 'text-green-500';
    } else if (score >= 4) {
        strength = 'Fort';
        color = 'text-green-400';
    } else if (score >= 3) {
        strength = 'Moyen';
        color = 'text-yellow-500';
    } else if (score >= 2) {
        strength = 'Faible';
        color = 'text-orange-500';
    }

    return { checks, strength, color, score };
};

// Composant pour afficher les critères de validation
const PasswordCriteria = ({ checks }: { checks: any }) => (
    <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="space-y-1 mt-2"
    >
        {[
            { key: 'length', label: 'Au moins 8 caractères' },
            { key: 'lowercase', label: 'Une lettre minuscule' },
            { key: 'uppercase', label: 'Une lettre majuscule' },
            { key: 'number', label: 'Un chiffre' },
            { key: 'special', label: 'Un caractère spécial' }
        ].map(({ key, label }) => (
            <div key={key} className="flex items-center gap-2 text-xs">
                {checks[key] ? (
                    <Check className="w-3 h-3 text-green-500" />
                ) : (
                    <X className="w-3 h-3 text-red-500" />
                )}
                <span className={checks[key] ? 'text-green-600' : 'text-muted-foreground'}>
                    {label}
                </span>
            </div>
        ))}
    </motion.div>
);



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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const router = useRouter();

    const passwordValidation = validatePassword(password);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Les mots de passe ne correspondent pas");
            return;
        }

        if (passwordValidation.score < 3) {
            toast.error("Le mot de passe doit être plus fort");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Utiliser Better Auth signUp pour créer le compte
            const { data: signUpData, error: signUpError } = await authClient.signUp.email({
                email,
                password: password,
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

                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Mot de passe</label>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Entrez votre mot de passe"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                className="transition-all duration-200 pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                            </Button>
                        </div>

                        {password && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-2"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Force du mot de passe:</span>
                                    <span className={`text-xs font-medium ${passwordValidation.color}`}>
                                        {passwordValidation.strength}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <motion.div
                                        className={`h-1.5 rounded-full transition-all duration-300 ${passwordValidation.score >= 5 ? 'bg-green-500' :
                                            passwordValidation.score >= 4 ? 'bg-green-400' :
                                                passwordValidation.score >= 3 ? 'bg-yellow-500' :
                                                    passwordValidation.score >= 2 ? 'bg-orange-500' : 'bg-red-500'
                                            }`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(passwordValidation.score / 5) * 100}%` }}
                                    />
                                </div>
                                <PasswordCriteria checks={passwordValidation.checks} />
                            </motion.div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Confirmer le mot de passe</label>
                        <div className="relative">
                            <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirmez votre mot de passe"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                className="transition-all duration-200 pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                disabled={isLoading}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                            </Button>
                        </div>
                        {confirmPassword && password !== confirmPassword && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-xs text-red-500"
                            >
                                Les mots de passe ne correspondent pas
                            </motion.p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                            />
                        ) : null}
                        {isLoading ? "Activation en cours..." : "Activer mon compte"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
} 
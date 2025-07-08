"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { toast } from "sonner";
import { paths } from "@/paths";

// Icônes pour les réseaux sociaux
const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
    </svg>
);

const FacebookIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);

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

// Variants d'animation pour le conteneur principal
const containerVariants = {
    hidden: {
        opacity: 0,
        y: 30,
        scale: 0.95
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.6,
            ease: "easeOut",
            staggerChildren: 0.08
        }
    }
};

// Variants pour les éléments enfants
const itemVariants = {
    hidden: {
        opacity: 0,
        y: 20
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: "easeOut"
        }
    }
};

// Variants pour les champs de formulaire
const fieldVariants = {
    hidden: {
        opacity: 0,
        x: -20
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.3,
            ease: "easeOut"
        }
    },
    focus: {
        scale: 1.02,
        transition: {
            duration: 0.2,
            ease: "easeInOut"
        }
    }
};

// Variants pour le bouton
const buttonVariants = {
    idle: {
        scale: 1,
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
    },
    hover: {
        scale: 1.02,
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        transition: {
            duration: 0.2,
            ease: "easeInOut"
        }
    },
    tap: {
        scale: 0.98,
        transition: {
            duration: 0.1
        }
    },
    loading: {
        scale: 1,
        opacity: 0.8,
        transition: {
            duration: 0.2
        }
    }
};

// Variants pour les boutons sociaux
const socialButtonVariants = {
    idle: {
        scale: 1,
        boxShadow: "0 2px 4px -1px rgba(0, 0, 0, 0.1)"
    },
    hover: {
        scale: 1.05,
        boxShadow: "0 4px 8px -2px rgba(0, 0, 0, 0.15)",
        transition: {
            duration: 0.2,
            ease: "easeInOut"
        }
    },
    tap: {
        scale: 0.95,
        transition: {
            duration: 0.1
        }
    }
};

// Variants pour les messages d'aide
const helpTextVariants = {
    hidden: {
        opacity: 0,
        height: 0,
        y: -10
    },
    visible: {
        opacity: 1,
        height: "auto",
        y: 0,
        transition: {
            duration: 0.3,
            ease: "easeOut"
        }
    }
};

export function SignupForm() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const passwordValidation = validatePassword(password);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Les mots de passe ne correspondent pas");
            return;
        }

        if (passwordValidation.score < 3) {
            toast.error("Le mot de passe doit être plus fort");
            return;
        }

        // Combiner prénom et nom pour créer le nom complet
        const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

        if (!firstName.trim() || !lastName.trim()) {
            toast.error("Veuillez remplir le prénom et le nom");
            return;
        }

        setIsLoading(true);

        try {
            const { data, error } = await authClient.signUp.email({
                email,
                password,
                name: fullName,
                callbackURL: paths.dashboard,
            }, {
                onRequest: () => {
                    setIsLoading(true);
                },
                onSuccess: () => {
                    toast.success("Compte créé avec succès !");
                    router.push(paths.dashboard);
                    router.refresh();
                },
                onError: (ctx) => {
                    toast.error(ctx.error.message || "Erreur lors de l'inscription");
                    setIsLoading(false);
                },
            });

            if (error) {
                toast.error(error.message || "Erreur lors de l'inscription");
            }
        } catch (error) {
            toast.error("Une erreur est survenue");
            console.error("Signup error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'facebook') => {
        if (provider === 'google') {
            const { data, error } = await authClient.signIn.social({
                provider: 'google',
                callbackURL: paths.dashboard,
            });

            if (error) {
                toast.error(error.message || "Erreur lors de la connexion");
            }

            if (data) {
                toast.success("Connexion réussie !");
                router.push(paths.dashboard);
                router.refresh();
            } else {
                toast.error("Erreur lors de la connexion");
            }
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md mx-auto"
        >
            <Card className="overflow-hidden">
                <motion.div variants={itemVariants}>
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">Inscription</CardTitle>
                        <CardDescription className="text-center">
                            Créez votre compte pour commencer
                        </CardDescription>
                    </CardHeader>
                </motion.div>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <motion.div
                            variants={fieldVariants}
                            className="space-y-2"
                        >
                            <Label>Nom et prénom</Label>
                            <div className="flex gap-2">
                                <motion.div
                                    whileFocus="focus"
                                    variants={fieldVariants}
                                    className="flex-1"
                                >
                                    <Input
                                        id="firstName"
                                        type="text"
                                        placeholder="Prénom"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                        disabled={isLoading}
                                        className="transition-all duration-200"
                                    />
                                </motion.div>
                                <motion.div
                                    whileFocus="focus"
                                    variants={fieldVariants}
                                    className="flex-1"
                                >
                                    <Input
                                        id="lastName"
                                        type="text"
                                        placeholder="Nom"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                        disabled={isLoading}
                                        className="transition-all duration-200"
                                    />
                                </motion.div>
                            </div>
                        </motion.div>

                        <motion.div
                            variants={fieldVariants}
                            className="space-y-2"
                        >
                            <Label htmlFor="email">Email</Label>
                            <motion.div
                                whileFocus="focus"
                                variants={fieldVariants}
                            >
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="votre@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="transition-all duration-200"
                                />
                            </motion.div>
                        </motion.div>

                        <motion.div
                            variants={fieldVariants}
                            className="space-y-2"
                        >
                            <Label htmlFor="password">Mot de passe</Label>
                            <motion.div
                                whileFocus="focus"
                                variants={fieldVariants}
                                className="relative"
                            >
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
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
                            </motion.div>

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
                        </motion.div>

                        <motion.div
                            variants={fieldVariants}
                            className="space-y-2"
                        >
                            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                            <motion.div
                                whileFocus="focus"
                                variants={fieldVariants}
                                className="relative"
                            >
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
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
                            </motion.div>
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
                        </motion.div>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4 mt-4">
                        <motion.div
                            variants={buttonVariants}
                            initial="idle"
                            whileHover={!isLoading ? "hover" : "loading"}
                            whileTap={!isLoading ? "tap" : "loading"}
                            animate={isLoading ? "loading" : "idle"}
                            className="w-full"
                        >
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
                                {isLoading ? "Création du compte..." : "Créer un compte"}
                            </Button>
                        </motion.div>

                        <motion.div variants={itemVariants} className="w-full">
                            <div className="relative">
                                <Separator className="my-4" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="bg-background px-2 text-xs text-muted-foreground">
                                        ou continuer avec
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            variants={itemVariants}
                            className="flex gap-2 w-full"
                        >
                            <motion.div
                                variants={socialButtonVariants}
                                initial="idle"
                                whileHover="hover"
                                whileTap="tap"
                                className="flex-1"
                            >
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => handleSocialLogin('google')}
                                    disabled={isLoading}
                                >
                                    <GoogleIcon />
                                </Button>
                            </motion.div>
                            {/* <motion.div
                                variants={socialButtonVariants}
                                initial="idle"
                                whileHover="hover"
                                whileTap="tap"
                                className="flex-1"
                            >
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => handleSocialLogin('facebook')}
                                    disabled={isLoading}
                                >
                                    <FacebookIcon />
                                </Button>
                            </motion.div> */}
                        </motion.div>

                        <motion.div
                            variants={itemVariants}
                            className="text-center text-sm"
                        >
                            <span className="text-muted-foreground">Déjà un compte ? </span>
                            <Link
                                href={paths.login}
                                className="text-primary hover:underline font-medium transition-colors duration-200"
                            >
                                Se connecter
                            </Link>
                        </motion.div>
                    </CardFooter>
                </form>
            </Card>
        </motion.div>
    );
} 
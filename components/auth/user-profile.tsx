"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { paths } from "@/paths";

export function UserProfile() {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();

    const handleSignOut = async () => {
        try {
            await authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        toast.success("Déconnexion réussie");
                        router.push(paths.login);
                        router.refresh();
                    },
                },
            });
        } catch (error) {
            toast.error("Erreur lors de la déconnexion");
            console.error("Sign out error:", error);
        }
    };

    if (isPending) {
        return (
            <Card className="w-full max-w-md mx-auto">
                <CardContent className="p-6">
                    <div className="text-center">Chargement...</div>
                </CardContent>
            </Card>
        );
    }

    if (!session?.user) {
        return (
            <Card className="w-full max-w-md mx-auto">
                <CardContent className="p-6">
                    <div className="text-center">Utilisateur non connecté</div>
                </CardContent>
            </Card>
        );
    }

    const { user } = session;

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Profil utilisateur</CardTitle>
                <CardDescription>Informations de votre compte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-muted-foreground">Nom</label>
                    <p className="text-sm">{user.name}</p>
                </div>
                <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-sm">{user.email}</p>
                </div>
                <div>
                    <label className="text-sm font-medium text-muted-foreground">ID</label>
                    <p className="text-sm font-mono text-xs">{user.id}</p>
                </div>
                <div className="pt-4">
                    <Button
                        onClick={handleSignOut}
                        variant="outline"
                        className="w-full"
                    >
                        Se déconnecter
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
} 
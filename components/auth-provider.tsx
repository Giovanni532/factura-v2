"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useAuthStore } from "@/store/use-auth-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
    const { data: session, isPending } = authClient.useSession();

    useEffect(() => {
        // Mise à jour immédiate de l'état d'authentification
        setAuthenticated(!!session?.user);
    }, [session, setAuthenticated]);

    return children;
}

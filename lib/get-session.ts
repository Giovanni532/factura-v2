import { cache } from "react";
import { auth } from "./auth";
import { headers } from "next/headers";

/**
 * Version mise en cache (via React cache) de auth.api.getSession.
 * Déduplique automatiquement les appels dans le même rendu serveur :
 * layout.tsx + page.tsx ne déclenchent qu'UNE seule requête DB par requête HTTP.
 */
export const getSession = cache(async () => {
    return auth.api.getSession({
        headers: await headers(),
    });
});

import { NextRequest, NextResponse } from 'next/server';
import { paths } from '@/paths';

// Routes d'API qui ne nécessitent pas d'authentification
const publicApiRoutes = ['/api/auth'];

// Routes protégées qui nécessitent une authentification
const protectedRoutes = [
    paths.dashboard,
    paths.invoices.list,
    paths.invoices.create,
    '/invoices/', // Pour toutes les sous-routes dynamiques des factures
    paths.clients.list,
    paths.clients.create,
    '/clients/', // Pour toutes les sous-routes dynamiques des clients
    paths.templates.list,
    paths.templates.create,
    '/templates/', // Pour toutes les sous-routes dynamiques des templates
    paths.settings.profile,
    paths.settings.company,
    paths.settings.billing,
    '/settings/', // Pour toutes les autres sous-routes des paramètres
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Permettre l'accès aux routes d'API publiques
    if (publicApiRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Permettre l'accès aux fichiers statiques
    if (pathname.startsWith('/_next') || pathname.startsWith('/favicon.ico')) {
        return NextResponse.next();
    }

    try {
        // Vérifier la session via l'API Better Auth
        const sessionResponse = await fetch(new URL('/api/auth/get-session', request.url), {
            headers: {
                cookie: request.headers.get('cookie') || '',
            },
        });

        const session = sessionResponse.ok ? await sessionResponse.json() : null;
        const isAuthenticated = !!session?.user;
        const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

        // Si l'utilisateur n'est pas connecté et essaie d'accéder à une route protégée
        if (!isAuthenticated && isProtectedRoute) {
            const loginUrl = new URL(paths.login, request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Si l'utilisateur est connecté et essaie d'accéder à login/signup
        if (isAuthenticated && (pathname === paths.login || pathname === paths.signup || pathname === paths.home)) {
            return NextResponse.redirect(new URL(paths.dashboard, request.url));
        }

        return NextResponse.next();
    } catch (error) {
        console.error('Middleware error:', error);

        // En cas d'erreur, rediriger vers login si c'est une route protégée
        const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
        if (isProtectedRoute) {
            return NextResponse.redirect(new URL(paths.login, request.url));
        }

        return NextResponse.next();
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}; 
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Rotas de autenticação (públicas para não-logados)
    const isAuthRoute =
        request.nextUrl.pathname.startsWith("/login") ||
        request.nextUrl.pathname.startsWith("/cadastro") ||
        request.nextUrl.pathname.startsWith("/recuperar-senha");

    // Rotas públicas
    const isPublicRoute =
        request.nextUrl.pathname === "/" ||
        request.nextUrl.pathname.startsWith("/api/webhooks");

    // Se não está logado e tenta acessar rota protegida
    if (!user && !isAuthRoute && !isPublicRoute) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    // Se está logado e tenta acessar rotas de auth
    if (user && isAuthRoute) {
        const url = request.nextUrl.clone();
        url.pathname = "/pacientes";
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}

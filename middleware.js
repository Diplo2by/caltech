import { NextResponse } from 'next/server'
import { stackServerApp } from "@/stack"

export async function middleware(request) {
    const user = await stackServerApp.getUser();
    const { pathname } = request.nextUrl;

    // Validate requests

    if (pathname.startsWith('/api')) {
        if (!user || !user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', user.id);

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    // If user is signed in
    if (user) {
        // Redirect signed-in users away from authentication pages
        if (pathname === '/signup' || pathname === '/signin') {
            return NextResponse.redirect(new URL('/', request.url));
        }
        // Allow access to other pages
        return NextResponse.next();
    }

    // If user is not signed in
    if (!user) {
        // Allow access to authentication pages
        if (pathname === '/signin' || pathname === '/signup' || pathname === '/forgot-password') {
            return NextResponse.next();
        }
        // Redirect to signin for protected pages
        return NextResponse.redirect(new URL('/signin', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|public|assets|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.webp|.*\\.ico|.*\\.bmp|.*\\.tiff).*)',],
};
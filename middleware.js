import { NextResponse } from 'next/server'
import { stackServerApp } from "@/stack"

export async function middleware(request) {
    const user = await stackServerApp.getUser();

    if (!user) {
        return NextResponse.redirect(new URL('/handler/sign-in', request.url));
    }
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|handler/sign-in|api|public|assets).*)',
    ],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Check for auth status flag (set by client-side auth flow)
    const authStatus = request.cookies.get('auth_status')?.value;
    // Also check legacy access cookie for backward compatibility
    const legacyToken = request.cookies.get('access')?.value;

    const isAuthenticated = authStatus === 'authenticated' || !!legacyToken;

    // Protect /admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!isAuthenticated) {
            return NextResponse.redirect(new URL('/owner/login', request.url));
        }
    }

    // Protect /owner dashboard routes, excluding auth routes
    if (
        request.nextUrl.pathname.startsWith('/owner') &&
        !request.nextUrl.pathname.startsWith('/owner/login') &&
        !request.nextUrl.pathname.startsWith('/owner/register')
    ) {
        if (!isAuthenticated) {
            return NextResponse.redirect(new URL('/owner/login', request.url));
        }
    }

    // Protect /user1/dashboard and other dashboard routes
    if (
        request.nextUrl.pathname.startsWith('/dashboard') ||
        request.nextUrl.pathname.startsWith('/profile') ||
        request.nextUrl.pathname.startsWith('/hostel') ||
        request.nextUrl.pathname.startsWith('/rooms') ||
        request.nextUrl.pathname.startsWith('/bookings')
    ) {
        if (!isAuthenticated) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Redirect authenticated users away from login/register pages
    if (
        isAuthenticated &&
        (request.nextUrl.pathname === '/login' ||
            request.nextUrl.pathname === '/register')
    ) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/owner/:path*', '/dashboard/:path*', '/profile/:path*', '/hostel/:path*', '/rooms/:path*', '/bookings/:path*'],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // ─── CRITICAL: Never intercept API or internal Next.js routes ───
    // The /api/ rewrite proxies to Django. If middleware touches these
    // paths it can cause ERR_TOO_MANY_REDIRECTS because middleware
    // redirect logic (e.g. "not authenticated → /login") fires on the
    // proxied fetch request itself, not just on page navigations.
    if (
        pathname.startsWith('/api/') ||
        pathname.startsWith('/_next/') ||
        pathname.startsWith('/media/') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // Check for the HttpOnly cookies set by the Django backend.
    // These survive browser refreshes (unlike in-memory tokens).
    // SECURITY: Only trust HttpOnly cookies set by the server.
    // Never trust client-writable cookies (like auth_status) for auth decisions.
    const accessToken = request.cookies.get('access_token')?.value;
    const refreshToken = request.cookies.get('refresh_token')?.value;

    // User is authenticated if ANY persistent token cookie is present.
    // access_token expires every 10 min, but refresh_token lasts 30 days.
    const isAuthenticated = !!accessToken || !!refreshToken;

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
        (request.nextUrl.pathname.startsWith('/hostel') && !request.nextUrl.pathname.startsWith('/hostels')) ||
        request.nextUrl.pathname.startsWith('/rooms') ||
        request.nextUrl.pathname.startsWith('/bookings') ||
        request.nextUrl.pathname.endsWith('/book')
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
        const role = request.cookies.get('user_role')?.value;
        if (role === 'vendor') {
            return NextResponse.redirect(new URL('/vendordashboard/vendors', request.url));
        }
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/owner/:path*', '/dashboard/:path*', '/profile/:path*', '/hostel/:path*', '/rooms/:path*', '/bookings/:path*', '/login', '/register'],
};

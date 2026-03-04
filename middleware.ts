import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Simple token retrieval
    const token = request.cookies.get('access')?.value;

    // Protect /admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!token) {
            return NextResponse.redirect(new URL('/owner/login', request.url));
        }
    }

    // Protect /owner dashboard routes, excluding auth routes
    if (
        request.nextUrl.pathname.startsWith('/owner') &&
        !request.nextUrl.pathname.startsWith('/owner/login') &&
        !request.nextUrl.pathname.startsWith('/owner/register')
    ) {
        if (!token) {
            return NextResponse.redirect(new URL('/owner/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/owner/:path*'],
};

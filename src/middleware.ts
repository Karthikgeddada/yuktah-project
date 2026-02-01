import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractToken } from './lib/auth';

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // API routes protection
    if (pathname.startsWith('/api/')) {
        // Allow public auth and emergency routes
        if (
            pathname.startsWith('/api/auth/login') ||
            pathname.startsWith('/api/auth/signup') ||
            pathname.startsWith('/api/admin/login') ||
            pathname.startsWith('/api/hospital/login') ||
            pathname.startsWith('/api/emergency/') ||
            pathname.startsWith('/api/debug-hooks') ||
            pathname.startsWith('/api/admin/create-first')
        ) {
            return NextResponse.next();
        }

        // Protect all other API routes
        const token = extractToken(request);

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized: No token provided' },
                { status: 401 }
            );
        }

        const payload = await verifyToken(token);
        if (!payload) {
            return NextResponse.json(
                { error: 'Unauthorized: Invalid token' },
                { status: 401 }
            );
        }

        // Attach userId to request headers for use in route handlers
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', payload.userId);
        requestHeaders.set('x-user-email', payload.email);

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    // Page routes protection
    if (pathname.startsWith('/admin/dashboard')) {
        const token = extractToken(request);

        if (!token) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }

        const payload = await verifyToken(token);
        if (!payload || payload.role !== 'admin') {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }

        return NextResponse.next();
    }

    // Hospital routes protection (Strict)
    if (pathname.startsWith('/hospital') && !pathname.startsWith('/hospital/login')) {
        const token = extractToken(request);

        if (!token) {
            return NextResponse.redirect(new URL('/hospital/login?redirect=' + pathname, request.url));
        }

        const payload = await verifyToken(token);
        if (!payload || payload.role !== 'hospital') {
            // If they are logged in but not a hospital, redirect to appropriate dashboard or login
            return NextResponse.redirect(new URL('/hospital/login?error=unauthorized_role', request.url));
        }

        return NextResponse.next();
    }

    // General user/doctor dashboard protection
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/doctor')) {
        const token = extractToken(request);

        if (!token) {
            return NextResponse.redirect(new URL('/login?redirect=' + pathname, request.url));
        }

        const payload = await verifyToken(token);
        if (!payload) {
            return NextResponse.redirect(new URL('/login?redirect=' + pathname, request.url));
        }

        return NextResponse.next();
    }

    // Redirect authenticated users away from login pages
    if (pathname === '/login' || pathname === '/admin/login' || pathname === '/hospital/login') {
        const token = extractToken(request);
        if (token) {
            const payload = await verifyToken(token);
            if (payload) {
                if (payload.role === 'admin') {
                    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
                }
                if (payload.role === 'hospital') {
                    return NextResponse.redirect(new URL('/hospital/dashboard', request.url)); // Assuming there's a dashboard
                }
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/api/:path*',
        '/dashboard/:path*',
        '/doctor/:path*',
        '/hospital/:path*',
        '/admin/:path*',
        '/login',
    ],
};

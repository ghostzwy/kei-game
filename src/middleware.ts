/**
 * Middleware for authentication protection
 */

import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // List of protected routes
  const protectedRoutes = ['/dashboard', '/api/protected'];

  // Check if current route requires authentication
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtected) {
    // Check for auth token/session
    // In a real implementation, this would validate Firebase auth token
    const token = request.cookies.get('auth_token');

    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/protected/:path*'],
};

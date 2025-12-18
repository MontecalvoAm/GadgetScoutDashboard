import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken } from './lib/auth/jwt-edge';
import { canAccessRoute } from './lib/auth/rbac';
import { addSecurityHeaders } from './lib/security/headers';
import { rateLimitAuth, rateLimitApi, rateLimitRegistration } from './lib/security/rate-limiter';
import { logAuthenticationAttempt, logAuthorizationCheck, logSecurityIncident } from './lib/security/audit';

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/api/auth',
  '/api/auth/register',
  '/api/auth/refresh',
  '/_next',
  '/static',
  '/favicon.ico'
];

// Routes that require specific roles
const PROTECTED_ROUTES = [
  '/dashboard',
  '/leads',
  '/customers',
  '/messages',
  '/users',
  '/settings'
];

// API routes that require authentication
const PROTECTED_API_ROUTES = [
  '/api/users',
  '/api/customers',
  '/api/leads',
  '/api/messages',
  '/api/dashboard'
];

/**
 * Main authentication middleware with security enhancements
 * @param request - Next.js request object
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Add security headers to all responses
  const response = NextResponse.next();
  addSecurityHeaders(response, process.env.NODE_ENV === 'production');

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return response;
  }

  // Apply rate limiting based on route type
  let rateLimitResult = null;

  if (pathname.startsWith('/api/auth')) {
    rateLimitResult = await rateLimitAuth()(request);
  } else if (pathname === '/api/auth/register') {
    rateLimitResult = await rateLimitRegistration()(request);
  } else if (pathname.startsWith('/api/')) {
    rateLimitResult = await rateLimitApi()(request);
  }

  if (rateLimitResult) {
    // Log rate limit violations
    await logSecurityIncident(request, 'RATE_LIMIT_EXCEEDED', {
      route: pathname,
      method: request.method,
    });
    return rateLimitResult;
  }

  // Handle API routes
  if (pathname.startsWith('/api/')) {
    return await handleApiRoute(request, response);
  }

  // Handle page routes
  return await handlePageRoute(request, response);
}

/**
 * Check if route is public
 * @param pathname - Route path
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route =>
    pathname === route || pathname.startsWith(route)
  );
}

/**
 * Handle API route authentication with enhanced security
 * @param request - Next.js request object
 * @param response - NextResponse object
 */
async function handleApiRoute(request: NextRequest, response: NextResponse) {
  const token = getTokenFromRequest(request);

  if (!token) {
    await logAuthenticationAttempt(request, 'anonymous', false, 'No token provided');
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const user = await verifyAccessToken(token);

    // Log successful authentication
    await logAuthenticationAttempt(request, user.email, true);

    // Check route access permissions
    if (!canAccessRoute(user, request.nextUrl.pathname, request.method)) {
      await logFailedAuthorization(
        request,
        user.userId,
        request.nextUrl.pathname,
        'required',
        user.roleId.toString()
      );
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Log data access
    await logDataAccess(
      request,
      user.userId,
      request.nextUrl.pathname,
      undefined,
      { method: request.method }
    );

    // Add user info to headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.userId);
    requestHeaders.set('x-user-email', user.email);
    requestHeaders.set('x-user-role', user.roleId.toString());

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    console.error('Authentication error:', error);
    await logAuthenticationAttempt(request, 'invalid', false, 'Invalid token');
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}

/**
 * Handle page route authentication with enhanced security
 * @param request - Next.js request object
 * @param response - NextResponse object
 */
async function handlePageRoute(request: NextRequest, response: NextResponse) {
  const token = getTokenFromCookies(request);

  if (!token) {
    // Log anonymous access attempt
    await logAuthenticationAttempt(request, 'anonymous', false, 'No token for protected route');

    // Redirect to login for protected routes
    const redirectResponse = NextResponse.redirect(new URL('/login', request.url));
    addSecurityHeaders(redirectResponse, process.env.NODE_ENV === 'production');
    return redirectResponse;
  }

  try {
    const user = await verifyAccessToken(token);

    // Log successful page access
    await logDataAccess(
      request,
      user.userId,
      request.nextUrl.pathname,
      undefined,
      { type: 'page_access' }
    );

    // Add user info to headers for server components
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.userId);
    requestHeaders.set('x-user-email', user.email);
    requestHeaders.set('x-user-role', user.roleId.toString());

    const nextResponse = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    return addSecurityHeaders(nextResponse, process.env.NODE_ENV === 'production');

  } catch (error) {
    console.error('Authentication error:', error);
    await logAuthenticationAttempt(request, 'expired', false, 'Invalid or expired token');

    // Clear invalid token and redirect to login
    const redirectResponse = NextResponse.redirect(new URL('/login', request.url));
    redirectResponse.cookies.set('accessToken', '', { maxAge: 0 });
    redirectResponse.cookies.set('refreshToken', '', { maxAge: 0 });

    return addSecurityHeaders(redirectResponse, process.env.NODE_ENV === 'production');
  }
}

/**
 * Extract token from Authorization header
 * @param request - Next.js request object
 */
function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return getTokenFromCookies(request);
}

/**
 * Extract token from cookies
 * @param request - Next.js request object
 */
function getTokenFromCookies(request: NextRequest): string | null {
  return request.cookies.get('accessToken')?.value || null;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
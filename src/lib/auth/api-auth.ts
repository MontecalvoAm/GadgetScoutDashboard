import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, JWTPayload } from './jwt-edge';
import { canAccessRoute } from './rbac';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload & { roleId: number };
}

/**
 * Get authenticated user from request
 * @param request - Next.js request object
 * @returns Authenticated user or null
 */
export async function getUserFromRequest(request: NextRequest): Promise<(JWTPayload & { roleId: number }) | null> {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return null;
    }

    const user = await verifyAccessToken(token);
    return {
      ...user,
      roleId: user.roleId
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * Require authentication middleware
 * @param request - Next.js request object
 * @param allowedRoles - Array of allowed role IDs
 */
export async function requireAuth(
  request: NextRequest,
  allowedRoles?: number[]
): Promise<{ user: JWTPayload & { roleId: number } } | { error: string; status: number }> {
  const user = await getUserFromRequest(request);

  if (!user) {
    return { error: 'Authentication required', status: 401 };
  }

  if (allowedRoles && !allowedRoles.includes(user.roleId)) {
    return { error: 'Insufficient permissions', status: 403 };
  }

  return { user };
}

/**
 * Require route access
 * @param request - Next.js request object
 */
export async function requireRouteAccess(
  request: NextRequest
): Promise<{ user: JWTPayload & { roleId: number } } | { error: string; status: number }> {
  const user = await getUserFromRequest(request);

  if (!user) {
    return { error: 'Authentication required', status: 401 };
  }

  const canAccess = canAccessRoute(user, request.nextUrl.pathname, request.method);
  if (!canAccess) {
    return { error: 'Route access denied', status: 403 };
  }

  return { user };
}

/**
 * Extract token from request
 * @param request - Next.js request object
 */
function getTokenFromRequest(request: NextRequest): string | null {
  // Check Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookies
  const tokenCookie = request.cookies.get('accessToken');
  if (tokenCookie?.value) {
    return tokenCookie.value;
  }

  return null;
}

/**
 * Create a NextResponse with authentication error
 * @param error - Error message
 * @param status - HTTP status code
 */
export function createAuthError(error: string, status: number): NextResponse {
  return NextResponse.json({ error }, { status });
}

/**
 * Add user info to response headers
 * @param response - NextResponse object
 * @param user - Authenticated user
 */
export function addUserToResponse(
  response: NextResponse,
  user: JWTPayload & { roleId: number }
): NextResponse {
  response.headers.set('x-user-id', user.userId);
  response.headers.set('x-user-email', user.email);
  response.headers.set('x-user-role', user.roleId.toString());
  return response;
}
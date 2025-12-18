import { NextRequest } from 'next/server';
import { verifyAccessToken } from './jwt-edge';

/**
 * Extract token from Authorization header
 * @param request - Next.js request object
 * @returns Token string or null
 */
export function getTokenFromHeader(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Extract token from cookies
 * @param request - Next.js request object
 * @returns Token string or null
 */
export function getTokenFromCookies(request: NextRequest): string | null {
  const token = request.cookies.get('accessToken');
  return token?.value || null;
}

/**
 * Verify authentication token
 * @param request - Next.js request object
 * @returns Decoded payload or null
 */
export async function verifyAuth(request: NextRequest): Promise<any | null> {
  try {
    const token = getTokenFromHeader(request) || getTokenFromCookies(request);
    if (!token) {
      return null;
    }

    const payload = verifyAccessToken(token);
    return payload;
  } catch (error) {
    console.error('Authentication verification failed:', error);
    return null;
  }
}

/**
 * Check if user has required role
 * @param user - User object from JWT
 * @param requiredRoles - Array of allowed role IDs
 * @returns Boolean indicating access
 */
export function hasRole(user: any, requiredRoles: number[]): boolean {
  if (!user || !user.roleId) {
    return false;
  }
  return requiredRoles.includes(user.roleId);
}

/**
 * Check if user has required permission
 * @param user - User object from JWT
 * @param permission - Required permission string
 * @returns Boolean indicating access
 */
export function hasPermission(user: any, permission: string): boolean {
  if (!user || !user.permissions) {
    return false;
  }
  return user.permissions.includes(permission);
}

/**
 * Create authentication middleware
 * @param allowedRoles - Array of role IDs that can access this resource
 * @returns Middleware function
 */
export function createAuthMiddleware(allowedRoles?: number[]) {
  return async (request: NextRequest) => {
    const user = await verifyAuth(request);

    if (!user) {
      return {
        error: 'Authentication required',
        status: 401
      };
    }

    if (allowedRoles && !hasRole(user, allowedRoles)) {
      return {
        error: 'Insufficient permissions',
        status: 403
      };
    }

    return { user };
  };
}
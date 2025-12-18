/**
 * Edge Runtime Compatible JWT Implementation
 * Uses Web Crypto API instead of Node.js crypto for compatibility with Next.js Edge Runtime
 */

import { SignJWT, jwtVerify } from 'jose';

// Convert environment secrets to Uint8Array for Web Crypto API
function getSecret(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

const JWT_SECRET = getSecret(process.env.JWT_SECRET || 'fallback-secret-key-change-this');
const JWT_REFRESH_SECRET = getSecret(process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-change-this');

export interface JWTPayload {
  userId: string;
  email: string;
  roleId: number;
  permissions: string[];
  iat?: number;
  exp?: number;
}

/**
 * Generate JWT access token using Edge-compatible method
 * @param payload - User data to encode in token
 * @returns JWT token string
 */
export async function generateAccessToken(payload: JWTPayload): Promise<string> {
  try {
    const token = await new SignJWT({
      userId: payload.userId,
      email: payload.email,
      roleId: payload.roleId,
      permissions: payload.permissions
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer('messenger-dashboard')
      .setAudience('messenger-dashboard-users')
      .setExpirationTime('15m')
      .sign(JWT_SECRET);

    return token;
  } catch (error) {
    console.error('Error generating access token:', error);
    throw new Error('Failed to generate access token');
  }
}

/**
 * Generate JWT refresh token using Edge-compatible method
 * @param payload - User data to encode in token
 * @returns JWT refresh token string
 */
export async function generateRefreshToken(payload: Pick<JWTPayload, 'userId'>): Promise<string> {
  try {
    const token = await new SignJWT({
      userId: payload.userId
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer('messenger-dashboard')
      .setAudience('messenger-dashboard-users')
      .setExpirationTime('7d')
      .sign(JWT_REFRESH_SECRET);

    return token;
  } catch (error) {
    console.error('Error generating refresh token:', error);
    throw new Error('Failed to generate refresh token');
  }
}

/**
 * Verify JWT access token using Edge-compatible method
 * @param token - JWT token to verify
 * @returns Decoded payload or throws error
 */
export async function verifyAccessToken(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: 'messenger-dashboard',
      audience: 'messenger-dashboard-users'
    });

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      roleId: payload.roleId as number,
      permissions: payload.permissions as string[]
    };
  } catch (error) {
    console.error('Error verifying access token:', error);
    throw new Error('Invalid or expired access token');
  }
}

/**
 * Verify JWT refresh token using Edge-compatible method
 * @param token - JWT refresh token to verify
 * @returns Decoded payload or throws error
 */
export async function verifyRefreshToken(token: string): Promise<{ userId: string }> {
  try {
    const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET, {
      issuer: 'messenger-dashboard',
      audience: 'messenger-dashboard-users'
    });

    return {
      userId: payload.userId as string
    };
  } catch (error) {
    console.error('Error verifying refresh token:', error);
    throw new Error('Invalid or expired refresh token');
  }
}

/**
 * Decode JWT token without verification using Edge-compatible method
 * @param token - JWT token to decode
 * @returns Decoded payload or null
 */
export async function decodeToken(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: 'messenger-dashboard',
      audience: 'messenger-dashboard-users',
      // Skip verification for decoding
      ignoreExpiration: true,
      ignoreIssuedAt: true,
      ignoreNotBefore: true
    });
    return payload;
  } catch (error) {
    try {
      // Try with refresh secret if access secret fails
      const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET, {
        issuer: 'messenger-dashboard',
        audience: 'messenger-dashboard-users',
        ignoreExpiration: true,
        ignoreIssuedAt: true,
        ignoreNotBefore: true
      });
      return payload;
    } catch {
      return null;
    }
  }
}

/**
 * Get token expiration time using Edge-compatible method
 * @param token - JWT token
 * @returns Expiration timestamp or null
 */
export async function getTokenExpiration(token: string): Promise<number | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: 'messenger-dashboard',
      audience: 'messenger-dashboard-users',
      ignoreExpiration: true
    });
    return payload.exp || null;
  } catch (error) {
    try {
      const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET, {
        issuer: 'messenger-dashboard',
        audience: 'messenger-dashboard-users',
        ignoreExpiration: true
      });
      return payload.exp || null;
    } catch {
      return null;
    }
  }
}

// Export for backward compatibility
export { SignJWT, jwtVerify } from 'jose';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-this';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-change-this';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  roleId: number;
  permissions: string[];
  iat?: number;
  exp?: number;
}

/**
 * Generate JWT access token
 * @param payload - User data to encode in token
 * @returns JWT token string
 */
export function generateAccessToken(payload: JWTPayload): string {
  try {
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'messenger-dashboard',
      audience: 'messenger-dashboard-users'
    });
    return token;
  } catch (error) {
    console.error('Error generating access token:', error);
    throw new Error('Failed to generate access token');
  }
}

/**
 * Generate JWT refresh token
 * @param payload - User data to encode in token
 * @returns JWT refresh token string
 */
export function generateRefreshToken(payload: Pick<JWTPayload, 'userId'>): string {
  try {
    const token = jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: 'messenger-dashboard',
      audience: 'messenger-dashboard-users'
    });
    return token;
  } catch (error) {
    console.error('Error generating refresh token:', error);
    throw new Error('Failed to generate refresh token');
  }
}

/**
 * Verify JWT access token
 * @param token - JWT token to verify
 * @returns Decoded payload or throws error
 */
export function verifyAccessToken(token: string): JWTPayload {
  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      issuer: 'messenger-dashboard',
      audience: 'messenger-dashboard-users'
    }) as JWTPayload;
    return payload;
  } catch (error) {
    console.error('Error verifying access token:', error);
    throw new Error('Invalid or expired access token');
  }
}

/**
 * Verify JWT refresh token
 * @param token - JWT refresh token to verify
 * @returns Decoded payload or throws error
 */
export function verifyRefreshToken(token: string): { userId: string } {
  try {
    const payload = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'messenger-dashboard',
      audience: 'messenger-dashboard-users'
    }) as { userId: string };
    return payload;
  } catch (error) {
    console.error('Error verifying refresh token:', error);
    throw new Error('Invalid or expired refresh token');
  }
}

/**
 * Decode JWT token without verification (for debugging)
 * @param token - JWT token to decode
 * @returns Decoded payload or null
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const payload = jwt.decode(token) as JWTPayload;
    return payload;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * Get token expiration time
 * @param token - JWT token
 * @returns Expiration timestamp or null
 */
export function getTokenExpiration(token: string): number | null {
  try {
    const payload = jwt.decode(token) as JWTPayload;
    return payload?.exp || null;
  } catch (error) {
    return null;
  }
}
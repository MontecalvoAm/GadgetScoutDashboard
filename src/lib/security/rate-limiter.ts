import { NextRequest, NextResponse } from 'next/server';

// Rate limit configuration
const RATE_LIMIT_CONFIG = {
  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: 'Too many authentication attempts, please try again later',
    skipSuccessfulRequests: true,
  },
  // API endpoints
  api: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: 'Too many requests, please slow down',
  },
  // Registration endpoints
  registration: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 registrations per hour per IP
    message: 'Too many registration attempts, please try again later',
  },
  // Password reset endpoints
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 password resets per hour per email
    message: 'Too many password reset attempts, please try again later',
  },
  // General endpoints
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 requests per 15 minutes
    message: 'Too many requests, please try again later',
  },
};

// In-memory rate limiting store (for development)
// In production, use Redis or database
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

/**
 * Clean expired entries from rate limit store
 */
function cleanExpiredEntries() {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach(key => {
    if (rateLimitStore[key].resetTime <= now) {
      delete rateLimitStore[key];
    }
  });
}

/**
 * Get rate limit key for request
 * @param request - Next.js request
 * @param identifier - Additional identifier (email, user ID, etc.)
 */
function getRateLimitKey(
  request: NextRequest,
  identifier?: string
): string {
  const ip = request.headers.get('x-forwarded-for') ||
             request.headers.get('x-real-ip') ||
             'unknown';

  return identifier ? `${ip}:${identifier}` : ip;
}

/**
 * Check if request is rate limited
 * @param key - Rate limit key
 * @param config - Rate limit configuration
 */
function isRateLimited(key: string, config: typeof RATE_LIMIT_CONFIG.auth): boolean {
  cleanExpiredEntries();

  const now = Date.now();
  const entry = rateLimitStore[key];

  if (!entry || entry.resetTime <= now) {
    rateLimitStore[key] = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    return false;
  }

  entry.count++;
  return entry.count > config.max;
}

/**
 * Get remaining requests and reset time
 * @param key - Rate limit key
 */
function getRateLimitInfo(key: string): {
  remaining: number;
  resetTime: number;
  total: number;
} {
  const entry = rateLimitStore[key];
  const now = Date.now();

  if (!entry || entry.resetTime <= now) {
    return {
      remaining: RATE_LIMIT_CONFIG.api.max,
      resetTime: now + RATE_LIMIT_CONFIG.api.windowMs,
      total: RATE_LIMIT_CONFIG.api.max,
    };
  }

  return {
    remaining: Math.max(0, RATE_LIMIT_CONFIG.api.max - entry.count),
    resetTime: entry.resetTime,
    total: RATE_LIMIT_CONFIG.api.max,
  };
}

/**
 * Rate limiting middleware for authentication endpoints
 */
export function rateLimitAuth() {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const key = getRateLimitKey(request);

    if (isRateLimited(key, RATE_LIMIT_CONFIG.auth)) {
      return NextResponse.json(
        { error: RATE_LIMIT_CONFIG.auth.message },
        { status: 429 }
      );
    }

    return null;
  };
}

/**
 * Rate limiting middleware for API endpoints
 */
export function rateLimitApi() {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const key = getRateLimitKey(request);

    if (isRateLimited(key, RATE_LIMIT_CONFIG.api)) {
      const info = getRateLimitInfo(key);

      return NextResponse.json(
        {
          error: RATE_LIMIT_CONFIG.api.message,
          retryAfter: Math.ceil((info.resetTime - Date.now()) / 1000)
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((info.resetTime - Date.now()) / 1000).toString(),
            'X-Rate-Limit-Limit': RATE_LIMIT_CONFIG.api.max.toString(),
            'X-Rate-Limit-Remaining': info.remaining.toString(),
            'X-Rate-Limit-Reset': Math.ceil(info.resetTime / 1000).toString(),
          }
        }
      );
    }

    return null;
  };
}

/**
 * Rate limiting middleware for registration endpoints
 */
export function rateLimitRegistration() {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const key = getRateLimitKey(request);

    if (isRateLimited(key, RATE_LIMIT_CONFIG.registration)) {
      return NextResponse.json(
        { error: RATE_LIMIT_CONFIG.registration.message },
        { status: 429 }
      );
    }

    return null;
  };
}

/**
 * Rate limiting middleware for password reset endpoints
 */
export function rateLimitPasswordReset() {
  return async (request: NextRequest, email: string): Promise<NextResponse | null> => {
    const key = getRateLimitKey(request, email);

    if (isRateLimited(key, RATE_LIMIT_CONFIG.passwordReset)) {
      return NextResponse.json(
        { error: RATE_LIMIT_CONFIG.passwordReset.message },
        { status: 429 }
      );
    }

    return null;
  };
}

/**
 * Generic rate limiting middleware
 * @param config - Custom rate limit configuration
 */
export function createRateLimiter(config: {
  windowMs: number;
  max: number;
  message: string;
  identifier?: (request: NextRequest) => string;
}) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const key = config.identifier ? config.identifier(request) : getRateLimitKey(request);

    if (isRateLimited(key, config)) {
      return NextResponse.json(
        { error: config.message },
        { status: 429 }
      );
    }

    return null;
  };
}

/**
 * Add rate limit headers to response
 * @param response - NextResponse object
 * @param key - Rate limit key
 * @param config - Rate limit configuration
 */
export function addRateLimitHeaders(
  response: NextResponse,
  key: string,
  config: typeof RATE_LIMIT_CONFIG.api
): NextResponse {
  const info = getRateLimitInfo(key);

  response.headers.set('X-Rate-Limit-Limit', config.max.toString());
  response.headers.set('X-Rate-Limit-Remaining', info.remaining.toString());
  response.headers.set('X-Rate-Limit-Reset', Math.ceil(info.resetTime / 1000).toString());

  return response;
}
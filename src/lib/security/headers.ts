import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Security headers configuration
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; media-src 'self'; object-src 'none'; child-src 'none';",
};

// Production CSP (more restrictive)
export const productionSecurityHeaders = {
  ...securityHeaders,
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; media-src 'self'; object-src 'none'; child-src 'none'; frame-ancestors 'none';",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};

/**
 * Add security headers to response
 * @param response - NextResponse object
 * @param isProduction - Whether in production environment
 */
export function addSecurityHeaders(response: NextResponse, isProduction = false): NextResponse {
  const headers = isProduction ? productionSecurityHeaders : securityHeaders;

  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Create security response wrapper
 * @param data - Response data
 * @param status - HTTP status code
 * @param isProduction - Environment flag
 */
export function createSecureResponse(data: any, status = 200, isProduction = false): NextResponse {
  const response = NextResponse.json(data, { status });
  return addSecurityHeaders(response, isProduction);
}

/**
 * Security configuration for API routes
 */
export const apiSecurityConfig = {
  maxRequestSize: '1mb',
  maxFileSize: '10mb',
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Rate-Limit-Remaining', 'X-Rate-Limit-Reset'],
  credentials: true,
  maxAge: 86400, // 24 hours
};
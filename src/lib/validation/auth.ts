import { z } from 'zod';
import { emailSchema, passwordSchema, nameSchema } from './common';

// Login validation schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Registration validation schema
export const registerSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

// Password reset request schema
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

// Password reset schema
export const passwordResetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Email change schema
export const emailChangeSchema = z.object({
  currentEmail: emailSchema,
  newEmail: emailSchema.refine((email) => email !== '', {
    message: 'New email must be different from current email',
  }),
});

// Profile update schema
export const profileUpdateSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  email: emailSchema.optional(),
});

// Role assignment schema
export const roleAssignmentSchema = z.object({
  userId: z.string().transform(val => parseInt(val, 10)),
  roleId: z.number().int().min(1).max(4), // 1-4 based on role definitions
});

// User creation schema (admin only)
export const userCreationSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  roleId: z.number().int().min(1).max(4),
  isActive: z.boolean().optional().default(true),
});

// User update schema (admin only)
export const userUpdateSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  email: emailSchema.optional(),
  roleId: z.number().int().min(1).max(4).optional(),
  isActive: z.boolean().optional(),
});

// Two-factor authentication schema
export const twoFactorSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Code must be 6 digits'),
  method: z.enum(['email', 'sms', 'authenticator']),
});

// Session validation schema
export const sessionValidationSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
});

// API key validation schema
export const apiKeySchema = z.object({
  name: z.string().min(1, 'Key name is required').max(100),
  permissions: z.array(z.string()).min(1, 'At least one permission is required'),
  expiresAt: z.string().datetime().optional(),
});

// Token refresh schema
export const tokenRefreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Validation helper functions
export function validateLogin(data: unknown) {
  return loginSchema.safeParse(data);
}

export function validateRegister(data: unknown) {
  return registerSchema.safeParse(data);
}

export function validatePasswordReset(data: unknown) {
  return passwordResetSchema.safeParse(data);
}

export function validateRoleAssignment(data: unknown) {
  return roleAssignmentSchema.safeParse(data);
}

// Sanitization helpers for auth data
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function sanitizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

export function sanitizePassword(password: string): string {
  // Remove leading/trailing whitespace but preserve internal spaces
  return password.trim();
}

// Password strength checker
export function checkPasswordStrength(password: string): {
  score: number;
  feedback: string[];
  isStrong: boolean;
} {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) score += 1;
  else feedback.push('Use at least 8 characters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Include uppercase letters');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Include lowercase letters');

  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Include numbers');

  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else feedback.push('Include special characters');

  if (password.length >= 12) score += 1;

  return {
    score,
    feedback,
    isStrong: score >= 4,
  };
}

// Session timeout calculator
export function calculateSessionTimeout(roleId: number): number {
  const timeouts = {
    1: 8 * 60 * 60 * 1000, // Super Admin: 8 hours
    2: 4 * 60 * 60 * 1000, // Admin: 4 hours
    3: 2 * 60 * 60 * 1000, // Editor: 2 hours
    4: 1 * 60 * 60 * 1000, // Viewer: 1 hour
  };

  return timeouts[roleId as keyof typeof timeouts] || 1 * 60 * 60 * 1000;
}

// Rate limiting key generator
export function generateRateLimitKey(request: NextRequest, userId?: string): string {
  const ip = request.headers.get('x-forwarded-for') ||
             request.headers.get('x-real-ip') ||
             'unknown';
  return userId ? `${ip}:${userId}` : ip;
}
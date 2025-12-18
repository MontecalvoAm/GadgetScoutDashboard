import { z } from 'zod';

// Email validation schema
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(1, 'Email is required')
  .max(255, 'Email must be 255 characters or less')
  .transform(email => email.toLowerCase().trim());

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be 128 characters or less')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Name validation schema
export const nameSchema = z
  .string()
  .min(1, 'This field is required')
  .max(100, 'Name must be 100 characters or less')
  .regex(/^[a-zA-Z\s-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
  .transform(name => name.trim());

// Phone validation schema
export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-\(\)]{10,}$/, 'Invalid phone number format')
  .transform(phone => phone.replace(/\s|-|\(|\)/g, ''));

// URL validation schema
export const urlSchema = z
  .string()
  .url('Invalid URL format')
  .max(500, 'URL must be 500 characters or less');

// ID validation schema (for database IDs)
export const idSchema = z
  .string()
  .regex(/^\d+$/, 'ID must be a valid number')
  .transform(id => parseInt(id, 10));

// Pagination validation schema
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform(val => val ? parseInt(val, 10) : 1)
    .refine(val => val >= 1, 'Page must be greater than 0'),
  limit: z
    .string()
    .optional()
    .transform(val => val ? parseInt(val, 10) : 20)
    .refine(val => val >= 1 && val <= 100, 'Limit must be between 1 and 100'),
});

// Search query validation schema
export const searchSchema = z.object({
  q: z.string().optional().transform(query => query?.trim()),
  sort: z.enum(['asc', 'desc']).optional().default('desc'),
  orderBy: z.string().optional().default('created_at'),
});

// Date validation schema
export const dateSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
}).refine(data => {
  if (data.from && data.to) {
    return new Date(data.from) <= new Date(data.to);
  }
  return true;
}, 'From date must be before or equal to to date');

// IP address validation schema
export const ipSchema = z
  .string()
  .regex(
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    'Invalid IP address format'
  );

// User agent validation schema
export const userAgentSchema = z
  .string()
  .max(500, 'User agent must be 500 characters or less')
  .transform(ua => ua.substring(0, 500));

// SQL injection prevention helper
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>\"']/g, '') // Remove dangerous characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

// XSS prevention helper
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// JSON validation schema
export const jsonSchema = z.string().transform((str, ctx) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Invalid JSON format',
    });
    return z.NEVER;
  }
});

// File upload validation schema
export const fileSchema = z.object({
  filename: z.string().max(255),
  mimetype: z.string().regex(/^image\/|^application\/pdf$|^text\//),
  size: z.number().max(10 * 1024 * 1024), // 10MB
});

// Common query parameters validation
export const commonQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform(val => Math.min(parseInt(val || '20', 10), 100)),
  offset: z
    .string()
    .optional()
    .transform(val => Math.max(parseInt(val || '0', 10), 0)),
  sort: z.string().optional().default('created_at'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Error response schema
export const errorSchema = z.object({
  error: z.string(),
  details: z.record(z.any()).optional(),
  timestamp: z.string().datetime(),
  path: z.string().optional(),
});

// Success response schema
export const successSchema = z.object({
  success: z.literal(true),
  data: z.any(),
  message: z.string().optional(),
});
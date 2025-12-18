import { NextRequest } from 'next/server';
import { executeQuery } from '@/lib/db';

// Audit log levels
export enum AuditLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  SECURITY = 'SECURITY',
}

// Audit log categories
export enum AuditCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  DATA_ACCESS = 'DATA_ACCESS',
  DATA_MODIFICATION = 'DATA_MODIFICATION',
  SYSTEM = 'SYSTEM',
  SECURITY = 'SECURITY',
}

// Audit log interface
export interface AuditLog {
  id?: number;
  userId?: string;
  action: string;
  category: AuditCategory;
  level: AuditLevel;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
}

/**
 * Log security event to database
 * @param log - Audit log entry
 */
export async function logSecurityEvent(log: AuditLog): Promise<void> {
  try {
    await executeQuery(
      `INSERT INTO T_AuditLog (
        UserID, Action, Category, Level, TableName, RecordID,
        OldValues, NewValues, IPAddress, UserAgent, CreatedDate, ReferenceTableStatusID
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 1)`,
      [
        log.userId || null,
        log.action,
        log.category,
        log.level,
        log.resource,
        log.resourceId || null,
        JSON.stringify(log.details?.oldValues || {}),
        JSON.stringify(log.details?.newValues || {}),
        log.ipAddress,
        log.userAgent,
      ]
    );
  } catch (error) {
    console.error('Failed to log security event:', error);
    // In production, this should be logged to a separate system
  }
}

/**
 * Log authentication attempt
 * @param request - Next.js request
 * @param email - User email
 * @param success - Whether authentication was successful
 * @param errorMessage - Optional error message
 */
export async function logAuthenticationAttempt(
  request: NextRequest,
  email: string,
  success: boolean,
  errorMessage?: string
): Promise<void> {
  await logSecurityEvent({
    action: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
    category: AuditCategory.AUTHENTICATION,
    level: success ? AuditLevel.INFO : AuditLevel.SECURITY,
    resource: 'M_Users',
    details: { email },
    ipAddress: getClientIP(request),
    userAgent: request.headers.get('user-agent') || 'unknown',
    timestamp: new Date(),
    success,
    errorMessage,
  });
}

/**
 * Log authorization check
 * @param request - Next.js request
 * @param userId - User ID
 * @param resource - Resource being accessed
 * @param action - Action being attempted
 * @param success - Whether authorization was successful
 * @param errorMessage - Optional error message
 */
export async function logAuthorizationCheck(
  request: NextRequest,
  userId: string,
  resource: string,
  action: string,
  success: boolean,
  errorMessage?: string
): Promise<void> {
  await logSecurityEvent({
    action,
    category: AuditCategory.AUTHORIZATION,
    level: success ? AuditLevel.INFO : AuditLevel.WARNING,
    resource,
    userId,
    details: { action },
    ipAddress: getClientIP(request),
    userAgent: request.headers.get('user-agent') || 'unknown',
    timestamp: new Date(),
    success,
    errorMessage,
  });
}

/**
 * Log data access
 * @param request - Next.js request
 * @param userId - User ID
 * @param resource - Resource being accessed
 * @param resourceId - Specific resource ID
 * @param details - Additional details
 */
export async function logDataAccess(
  request: NextRequest,
  userId: string,
  resource: string,
  resourceId?: string,
  details?: Record<string, any>
): Promise<void> {
  await logSecurityEvent({
    action: 'DATA_ACCESS',
    category: AuditCategory.DATA_ACCESS,
    level: AuditLevel.INFO,
    resource,
    resourceId,
    userId,
    details,
    ipAddress: getClientIP(request),
    userAgent: request.headers.get('user-agent') || 'unknown',
    timestamp: new Date(),
    success: true,
  });
}

/**
 * Log data modification
 * @param request - Next.js request
 * @param userId - User ID
 * @param resource - Resource being modified
 * @param resourceId - Specific resource ID
 * @param oldValues - Previous values
 * @param newValues - New values
 * @param action - Type of modification
 */
export async function logDataModification(
  request: NextRequest,
  userId: string,
  resource: string,
  resourceId: string,
  oldValues: Record<string, any>,
  newValues: Record<string, any>,
  action: string = 'UPDATE'
): Promise<void> {
  await logSecurityEvent({
    action,
    category: AuditCategory.DATA_MODIFICATION,
    level: AuditLevel.INFO,
    resource,
    resourceId,
    userId,
    details: { oldValues, newValues },
    ipAddress: getClientIP(request),
    userAgent: request.headers.get('user-agent') || 'unknown',
    timestamp: new Date(),
    success: true,
  });
}

/**
 * Log security incident
 * @param request - Next.js request
 * @param action - Security action
 * @param details - Incident details
 * @param level - Severity level
 */
export async function logSecurityIncident(
  request: NextRequest,
  action: string,
  details: Record<string, any>,
  level: AuditLevel = AuditLevel.SECURITY
): Promise<void> {
  await logSecurityEvent({
    action,
    category: AuditCategory.SECURITY,
    level,
    resource: 'SECURITY',
    details,
    ipAddress: getClientIP(request),
    userAgent: request.headers.get('user-agent') || 'unknown',
    timestamp: new Date(),
    success: false,
    errorMessage: details.error || 'Security incident detected',
  });
}

/**
 * Log failed authorization attempt
 * @param request - Next.js request
 * @param userId - User ID
 * @param resource - Resource being accessed
 * @param requiredRole - Required role level
 * @param actualRole - Actual role level
 */
export async function logFailedAuthorization(
  request: NextRequest,
  userId: string,
  resource: string,
  requiredRole: string,
  actualRole: string
): Promise<void> {
  await logSecurityEvent({
    action: 'AUTHORIZATION_FAILED',
    category: AuditCategory.AUTHORIZATION,
    level: AuditLevel.WARNING,
    resource,
    userId,
    details: {
      requiredRole,
      actualRole,
    },
    ipAddress: getClientIP(request),
    userAgent: request.headers.get('user-agent') || 'unknown',
    timestamp: new Date(),
    success: false,
    errorMessage: 'Insufficient permissions',
  });
}

/**
 * Get client IP address from request
 * @param request - Next.js request
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');

  return cfConnectingIP || realIP || forwarded?.split(',')[0].trim() || 'unknown';
}

/**
 * Get audit logs for a user
 * @param userId - User ID
 * @param limit - Maximum number of logs to return
 */
export async function getUserAuditLogs(userId: string, limit = 50): Promise<AuditLog[]> {
  try {
    const logs = await executeQuery(
      `SELECT * FROM T_AuditLog WHERE UserID = ? ORDER BY CreatedDate DESC LIMIT ?`,
      [userId, limit]
    );

    return Array.isArray(logs) ? logs.map(log => ({
      id: log.ID,
      userId: log.UserID,
      action: log.Action,
      category: log.Category as AuditCategory,
      level: log.Level as AuditLevel,
      resource: log.TableName,
      resourceId: log.RecordID,
      details: log.OldValues || log.NewValues ? JSON.parse(log.OldValues || log.NewValues) : {},
      ipAddress: log.IPAddress,
      userAgent: log.UserAgent,
      timestamp: log.CreatedDate,
      success: true, // This would need to be determined from the log structure
    })) : [];
  } catch (error) {
    console.error('Failed to get audit logs:', error);
    return [];
  }
}

/**
 * Get security summary for dashboard
 */
export async function getSecuritySummary(): Promise<{
  totalEvents: number;
  failedLogins: number;
  securityIncidents: number;
  last24hEvents: number;
}> {
  try {
    const [totalResult, failedLoginsResult, securityIncidentsResult, last24hResult] = await Promise.all([
      executeQuery('SELECT COUNT(*) as count FROM T_AuditLog'),
      executeQuery("SELECT COUNT(*) as count FROM T_AuditLog WHERE Action = 'LOGIN_FAILED'"),
      executeQuery("SELECT COUNT(*) as count FROM T_AuditLog WHERE Level = 'SECURITY'"),
      executeQuery('SELECT COUNT(*) as count FROM T_AuditLog WHERE CreatedDate >= DATE_SUB(NOW(), INTERVAL 24 HOUR)'),
    ]);

    return {
      totalEvents: (totalResult as any)[0]?.count || 0,
      failedLogins: (failedLoginsResult as any)[0]?.count || 0,
      securityIncidents: (securityIncidentsResult as any)[0]?.count || 0,
      last24hEvents: (last24hResult as any)[0]?.count || 0,
    };
  } catch (error) {
    console.error('Failed to get security summary:', error);
    return {
      totalEvents: 0,
      failedLogins: 0,
      securityIncidents: 0,
      last24hEvents: 0,
    };
  }
}

/**
 * Clean old audit logs (retention: 90 days)
 */
export async function cleanOldAuditLogs(): Promise<void> {
  try {
    await executeQuery(
      'DELETE FROM T_AuditLog WHERE CreatedDate < DATE_SUB(NOW(), INTERVAL 90 DAY)'
    );
  } catch (error) {
    console.error('Failed to clean old audit logs:', error);
  }
}
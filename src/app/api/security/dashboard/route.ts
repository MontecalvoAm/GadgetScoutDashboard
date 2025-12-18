import { NextRequest, NextResponse } from 'next/server';
import { getSecuritySummary, getUserAuditLogs } from '@/lib/security/audit';
import { executeQuery } from '@/lib/db';
import { createSecureResponse } from '@/lib/security/headers';

/**
 * Security Dashboard API
 * Provides security metrics and monitoring data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '24h';
    const userId = searchParams.get('userId');

    // Security dashboard data
    const dashboardData = await getSecurityDashboardData(period, userId);

    return createSecureResponse({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Security dashboard error:', error);
    return createSecureResponse({
      success: false,
      error: 'Failed to load security dashboard',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}

/**
 * Get comprehensive security dashboard data
 * @param period - Time period for data
 * @param userId - Optional user ID for specific user data
 */
async function getSecurityDashboardData(period: string, userId?: string) {
  // Parse time period
  const periodMap = {
    '1h': 'INTERVAL 1 HOUR',
    '24h': 'INTERVAL 24 HOUR',
    '7d': 'INTERVAL 7 DAY',
    '30d': 'INTERVAL 30 DAY',
    '90d': 'INTERVAL 90 DAY'
  };

  const interval = periodMap[period as keyof typeof periodMap] || periodMap['24h'];

  // Get security summary
  const summary = await getSecuritySummary();

  // Get detailed security events
  const events = await getSecurityEvents(interval, userId);

  // Get authentication patterns
  const authPatterns = await getAuthenticationPatterns(interval);

  // Get role-based access violations
  const violations = await getAccessViolations(interval);

  // Get system health metrics
  const health = await getSystemHealth();

  return {
    summary,
    events,
    authPatterns,
    violations,
    health,
    period,
    generatedAt: new Date().toISOString()
  };
}

/**
 * Get security events for dashboard
 * @param interval - Time interval
 * @param userId - Optional user ID filter
 */
async function getSecurityEvents(interval: string, userId?: string) {
  const query = userId
    ? `SELECT * FROM T_AuditLog WHERE CreatedDate >= DATE_SUB(NOW(), ${interval}) AND UserID = ? ORDER BY CreatedDate DESC LIMIT 100`
    : `SELECT * FROM T_AuditLog WHERE CreatedDate >= DATE_SUB(NOW(), ${interval}) ORDER BY CreatedDate DESC LIMIT 100`;

  const params = userId ? [userId] : [];
  const events = await executeQuery(query, params);

  return Array.isArray(events) ? events.map(event => ({
    id: event.ID,
    action: event.Action,
    category: event.Category,
    level: event.Level,
    resource: event.TableName,
    userId: event.UserID,
    ipAddress: event.IPAddress,
    timestamp: event.CreatedDate,
    details: event.OldValues || event.NewValues ? JSON.parse(event.OldValues || event.NewValues) : {}
  })) : [];
}

/**
 * Get authentication patterns
 * @param interval - Time interval
 */
async function getAuthenticationPatterns(interval: string) {
  const patterns = await executeQuery(`
    SELECT
      DATE(CreatedDate) as date,
      Action,
      COUNT(*) as count,
      COUNT(CASE WHEN Level = 'SECURITY' THEN 1 END) as security_events
    FROM T_AuditLog
    WHERE CreatedDate >= DATE_SUB(NOW(), ${interval})
    AND Action IN ('LOGIN_SUCCESS', 'LOGIN_FAILED', 'AUTHORIZATION_FAILED')
    GROUP BY DATE(CreatedDate), Action
    ORDER BY date DESC
  `);

  return Array.isArray(patterns) ? patterns : [];
}

/**
 * Get access violations
 * @param interval - Time interval
 */
async function getAccessViolations(interval: string) {
  const violations = await executeQuery(`
    SELECT
      Action,
      COUNT(*) as count,
      COUNT(DISTINCT IPAddress) as unique_ips,
      COUNT(DISTINCT UserID) as unique_users
    FROM T_AuditLog
    WHERE CreatedDate >= DATE_SUB(NOW(), ${interval})
    AND Action IN ('AUTHORIZATION_FAILED', 'RATE_LIMIT_EXCEEDED', 'SECURITY_INCIDENT')
    GROUP BY Action
    ORDER BY count DESC
  `);

  return Array.isArray(violations) ? violations : [];
}

/**
 * Get system health metrics
 */
async function getSystemHealth() {
  const [activeUsers, activeSessions, recentActivity] = await Promise.all([
    executeQuery('SELECT COUNT(*) as count FROM M_Users WHERE IsActive = 1'),
    executeQuery('SELECT COUNT(*) as count FROM T_AuditLog WHERE CreatedDate >= DATE_SUB(NOW(), INTERVAL 1 HOUR)'),
    executeQuery('SELECT COUNT(*) as count FROM T_AuditLog WHERE CreatedDate >= DATE_SUB(NOW(), INTERVAL 24 HOUR)')
  ]);

  return {
    activeUsers: (activeUsers as any)[0]?.count || 0,
    activeSessionsLastHour: (activeSessions as any)[0]?.count || 0,
    totalActivityLast24h: (recentActivity as any)[0]?.count || 0,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Get real-time security alerts
 */
async function getSecurityAlerts() {
  const alerts = await executeQuery(`
    SELECT
      'HIGH' as severity,
      'Suspicious Login Attempts' as title,
      COUNT(*) as count,
      'Multiple failed login attempts detected' as description
    FROM T_AuditLog
    WHERE Action = 'LOGIN_FAILED'
    AND CreatedDate >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
    GROUP BY IPAddress
    HAVING count > 5

    UNION ALL

    SELECT
      'MEDIUM' as severity,
      'Authorization Violations' as title,
      COUNT(*) as count,
      'Multiple authorization failures detected' as description
    FROM T_AuditLog
    WHERE Action = 'AUTHORIZATION_FAILED'
    AND CreatedDate >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
    GROUP BY IPAddress
    HAVING count > 3

    UNION ALL

    SELECT
      'LOW' as severity,
      'Rate Limit Violations' as title,
      COUNT(*) as count,
      'Rate limiting triggered' as description
    FROM T_AuditLog
    WHERE Action = 'RATE_LIMIT_EXCEEDED'
    AND CreatedDate >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
    GROUP BY IPAddress
    ORDER BY severity DESC, count DESC
  `);

  return Array.isArray(alerts) ? alerts : [];
}
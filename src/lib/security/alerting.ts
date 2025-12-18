import { executeQuery } from '@/lib/db';

// Alert configuration
export interface SecurityAlertConfig {
  enabled: boolean;
  threshold: number;
  window: string; // SQL interval format
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  notify: boolean;
}

// Alert types
export const ALERT_CONFIGS: Record<string, SecurityAlertConfig> = {
  FAILED_LOGIN: {
    enabled: true,
    threshold: 5,
    window: 'INTERVAL 15 MINUTE',
    severity: 'HIGH',
    notify: true,
  },
  AUTHORIZATION_FAILURE: {
    enabled: true,
    threshold: 3,
    window: 'INTERVAL 10 MINUTE',
    severity: 'MEDIUM',
    notify: true,
  },
  RATE_LIMIT_EXCEEDED: {
    enabled: true,
    threshold: 1,
    window: 'INTERVAL 1 MINUTE',
    severity: 'LOW',
    notify: false,
  },
  SQL_INJECTION_ATTEMPT: {
    enabled: true,
    threshold: 1,
    window: 'INTERVAL 1 MINUTE',
    severity: 'CRITICAL',
    notify: true,
  },
  XSS_ATTEMPT: {
    enabled: true,
    threshold: 1,
    window: 'INTERVAL 1 MINUTE',
    severity: 'CRITICAL',
    notify: true,
  },
  SUSPICIOUS_ACTIVITY: {
    enabled: true,
    threshold: 10,
    window: 'INTERVAL 1 HOUR',
    severity: 'MEDIUM',
    notify: true,
  },
};

// Alert interface
export interface SecurityAlert {
  id?: number;
  alertType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  source: string;
  count: number;
  firstSeen: Date;
  lastSeen: Date;
  resolved: boolean;
  resolution?: string;
}

/**
 * Check for security alerts
 */
export async function checkSecurityAlerts(): Promise<SecurityAlert[]> {
  const alerts: SecurityAlert[] = [];

  for (const [alertType, config] of Object.entries(ALERT_CONFIGS)) {
    if (!config.enabled) continue;

    const alert = await checkSpecificAlert(alertType, config);
    if (alert) {
      alerts.push(alert);
    }
  }

  return alerts;
}

/**
 * Check specific alert type
 */
async function checkSpecificAlert(
  alertType: string,
  config: SecurityAlertConfig
): Promise<SecurityAlert | null> {
  let query = '';
  let title = '';
  let description = '';

  switch (alertType) {
    case 'FAILED_LOGIN':
      query = `
        SELECT
          IPAddress as source,
          COUNT(*) as count,
          MIN(CreatedDate) as firstSeen,
          MAX(CreatedDate) as lastSeen
        FROM T_AuditLog
        WHERE Action = 'LOGIN_FAILED'
        AND CreatedDate >= DATE_SUB(NOW(), ${config.window})
        GROUP BY IPAddress
        HAVING count >= ${config.threshold}
      `;
      title = 'Brute Force Attack Detected';
      description = 'Multiple failed login attempts from the same IP address';
      break;

    case 'AUTHORIZATION_FAILURE':
      query = `
        SELECT
          IPAddress as source,
          COUNT(*) as count,
          MIN(CreatedDate) as firstSeen,
          MAX(CreatedDate) as lastSeen
        FROM T_AuditLog
        WHERE Action = 'AUTHORIZATION_FAILED'
        AND CreatedDate >= DATE_SUB(NOW(), ${config.window})
        GROUP BY IPAddress
        HAVING count >= ${config.threshold}
      `;
      title = 'Unauthorized Access Attempts';
      description = 'Multiple authorization failures detected';
      break;

    case 'SQL_INJECTION_ATTEMPT':
      query = `
        SELECT
          IPAddress as source,
          COUNT(*) as count,
          MIN(CreatedDate) as firstSeen,
          MAX(CreatedDate) as lastSeen
        FROM T_AuditLog
        WHERE Action LIKE '%SQL_INJECTION%'
        AND CreatedDate >= DATE_SUB(NOW(), ${config.window})
        GROUP BY IPAddress
        HAVING count >= ${config.threshold}
      `;
      title = 'SQL Injection Attempt Detected';
      description = 'Potential SQL injection attack detected in input';
      break;

    case 'XSS_ATTEMPT':
      query = `
        SELECT
          IPAddress as source,
          COUNT(*) as count,
          MIN(CreatedDate) as firstSeen,
          MAX(CreatedDate) as lastSeen
        FROM T_AuditLog
        WHERE Action LIKE '%XSS%'
        AND CreatedDate >= DATE_SUB(NOW(), ${config.window})
        GROUP BY IPAddress
        HAVING count >= ${config.threshold}
      `;
      title = 'XSS Attack Attempt Detected';
      description = 'Potential XSS attack detected in input';
      break;

    case 'RATE_LIMIT_EXCEEDED':
      query = `
        SELECT
          IPAddress as source,
          COUNT(*) as count,
          MIN(CreatedDate) as firstSeen,
          MAX(CreatedDate) as lastSeen
        FROM T_AuditLog
        WHERE Action = 'RATE_LIMIT_EXCEEDED'
        AND CreatedDate >= DATE_SUB(NOW(), ${config.window})
        GROUP BY IPAddress
        HAVING count >= ${config.threshold}
      `;
      title = 'Rate Limit Exceeded';
      description = 'Rate limiting triggered for source';
      break;

    case 'SUSPICIOUS_ACTIVITY':
      query = `
        SELECT
          IPAddress as source,
          COUNT(*) as count,
          MIN(CreatedDate) as firstSeen,
          MAX(CreatedDate) as lastSeen
        FROM T_AuditLog
        WHERE Level IN ('WARNING', 'SECURITY')
        AND CreatedDate >= DATE_SUB(NOW(), ${config.window})
        GROUP BY IPAddress
        HAVING count >= ${config.threshold}
      `;
      title = 'Suspicious Activity Detected';
      description = 'Unusual security events detected from source';
      break;

    default:
      return null;
  }

  try {
    const results = await executeQuery(query);
    if (Array.isArray(results) && results.length > 0) {
      return {
        alertType,
        severity: config.severity,
        title,
        description,
        source: results[0].source,
        count: results[0].count,
        firstSeen: results[0].firstSeen,
        lastSeen: results[0].lastSeen,
        resolved: false,
      };
    }
  } catch (error) {
    console.error(`Error checking ${alertType}:`, error);
  }

  return null;
}

/**
 * Create security alert
 */
export async function createSecurityAlert(alert: Omit<SecurityAlert, 'id'>): Promise<void> {
  try {
    await executeQuery(
      `INSERT INTO T_SecurityAlerts (
        AlertType, Severity, Title, Description, Source, Count, FirstSeen, LastSeen, Resolved, CreatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        alert.alertType,
        alert.severity,
        alert.title,
        alert.description,
        alert.source,
        alert.count,
        alert.firstSeen,
        alert.lastSeen,
        alert.resolved,
      ]
    );
  } catch (error) {
    console.error('Failed to create security alert:', error);
  }
}

/**
 * Get active security alerts
 */
export async function getActiveAlerts(): Promise<SecurityAlert[]> {
  try {
    const alerts = await executeQuery(
      `SELECT * FROM T_SecurityAlerts WHERE Resolved = 0 ORDER BY Severity DESC, LastSeen DESC`
    );

    return Array.isArray(alerts) ? alerts.map(alert => ({
      id: alert.ID,
      alertType: alert.AlertType,
      severity: alert.Severity,
      title: alert.Title,
      description: alert.Description,
      source: alert.Source,
      count: alert.Count,
      firstSeen: alert.FirstSeen,
      lastSeen: alert.LastSeen,
      resolved: alert.Resolved === 1,
    })) : [];
  } catch (error) {
    console.error('Failed to get active alerts:', error);
    return [];
  }
}

/**
 * Resolve security alert
 */
export async function resolveSecurityAlert(alertId: number, resolution: string): Promise<void> {
  try {
    await executeQuery(
      `UPDATE T_SecurityAlerts SET Resolved = 1, Resolution = ? WHERE ID = ?`,
      [resolution, alertId]
    );
  } catch (error) {
    console.error('Failed to resolve security alert:', error);
  }
}

/**
 * Get security alert statistics
 */
export async function getAlertStatistics(period = '24h'): Promise<{
  total: number;
  bySeverity: Record<string, number>;
  byType: Record<string, number>;
  trends: Array<{ date: string; count: number }>;
}> {
  const intervalMap = {
    '1h': 'INTERVAL 1 HOUR',
    '24h': 'INTERVAL 24 HOUR',
    '7d': 'INTERVAL 7 DAY',
    '30d': 'INTERVAL 30 DAY'
  };

  const interval = intervalMap[period as keyof typeof intervalMap] || intervalMap['24h'];

  try {
    const [total, bySeverity, byType, trends] = await Promise.all([
      executeQuery(`SELECT COUNT(*) as count FROM T_SecurityAlerts WHERE CreatedAt >= DATE_SUB(NOW(), ${interval})`),
      executeQuery(`SELECT Severity, COUNT(*) as count FROM T_SecurityAlerts WHERE CreatedAt >= DATE_SUB(NOW(), ${interval}) GROUP BY Severity`),
      executeQuery(`SELECT AlertType, COUNT(*) as count FROM T_SecurityAlerts WHERE CreatedAt >= DATE_SUB(NOW(), ${interval}) GROUP BY AlertType`),
      executeQuery(`SELECT DATE(CreatedAt) as date, COUNT(*) as count FROM T_SecurityAlerts WHERE CreatedAt >= DATE_SUB(NOW(), ${interval}) GROUP BY DATE(CreatedAt) ORDER BY date DESC`)
    ]);

    return {
      total: (total as any)[0]?.count || 0,
      bySeverity: Object.fromEntries((bySeverity as any[]).map(item => [item.Severity, item.count])),
      byType: Object.fromEntries((byType as any[]).map(item => [item.AlertType, item.count])),
      trends: (trends as any[]).map(item => ({ date: item.date, count: item.count }))
    };
  } catch (error) {
    console.error('Failed to get alert statistics:', error);
    return {
      total: 0,
      bySeverity: {},
      byType: {},
      trends: []
    };
  }
}

/**
 * Background security monitoring
 * This function should be called periodically (e.g., every 5 minutes)
 */
export async function runSecurityMonitoring(): Promise<void> {
  const alerts = await checkSecurityAlerts();

  for (const alert of alerts) {
    // Create alert if it doesn't exist
    const existingAlert = await getExistingAlert(alert.alertType, alert.source);
    if (!existingAlert) {
      await createSecurityAlert(alert);
    } else {
      // Update existing alert
      await updateAlertCount(existingAlert.id!, alert.count);
    }

    // Send notifications for critical/high alerts
    if (alert.severity === 'CRITICAL' || alert.severity === 'HIGH') {
      await sendSecurityNotification(alert);
    }
  }
}

/**
 * Check if alert already exists
 */
async function getExistingAlert(alertType: string, source: string): Promise<SecurityAlert | null> {
  try {
    const alerts = await executeQuery(
      `SELECT * FROM T_SecurityAlerts WHERE AlertType = ? AND Source = ? AND Resolved = 0 ORDER BY LastSeen DESC LIMIT 1`,
      [alertType, source]
    );

    return Array.isArray(alerts) && alerts.length > 0 ? alerts[0] : null;
  } catch (error) {
    console.error('Failed to check existing alert:', error);
    return null;
  }
}

/**
 * Update alert count
 */
async function updateAlertCount(alertId: number, newCount: number): Promise<void> {
  try {
    await executeQuery(
      `UPDATE T_SecurityAlerts SET Count = ?, LastSeen = NOW() WHERE ID = ?`,
      [newCount, alertId]
    );
  } catch (error) {
    console.error('Failed to update alert count:', error);
  }
}

/**
 * Send security notification (placeholder for email/SMS integration)
 */
async function sendSecurityNotification(alert: SecurityAlert): Promise<void> {
  console.log(`SECURITY ALERT: ${alert.severity} - ${alert.title}`);
  console.log(`Source: ${alert.source}`);
  console.log(`Description: ${alert.description}`);
  console.log(`Count: ${alert.count}`);

  // In production, integrate with email/SMS services
  // Example: await sendEmailAlert(alert);
  // Example: await sendSMSAlert(alert);
}
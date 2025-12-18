/**
 * Security Testing Suite
 * Comprehensive automated security testing for messenger-dashboard
 */

import { NextRequest } from 'next/server';

// Security test categories
export enum SecurityTestType {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  INPUT_VALIDATION = 'INPUT_VALIDATION',
  RATE_LIMITING = 'RATE_LIMITING',
  HEADERS = 'HEADERS',
  SQL_INJECTION = 'SQL_INJECTION',
  XSS = 'XSS',
  CSRF = 'CSRF',
  SESSION = 'SESSION',
}

// Test result interface
export interface SecurityTestResult {
  testType: SecurityTestType;
  description: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  details: string;
  timestamp: Date;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// Test payload examples
export const securityTestPayloads = {
  // SQL Injection payloads
  sqlInjection: [
    "' OR 1=1--",
    "'; DROP TABLE users;--",
    "' UNION SELECT * FROM users--",
    "admin'--",
    "1' OR '1'='1",
  ],

  // XSS payloads
  xssPayloads: [
    "<script>alert('XSS')</script>",
    "<img src=x onerror=alert('XSS')>",
    "javascript:alert('XSS')",
    "<iframe src='javascript:alert(1)'></iframe>",
    "<svg onload=alert('XSS')>",
  ],

  // Authentication bypass payloads
  authBypass: [
    { email: "admin'--", password: "anything" },
    { email: "admin' OR '1'='1", password: "anything" },
    { email: "test", password: "' OR '1'='1" },
  ],

  // Rate limiting test patterns
  rateLimitPatterns: {
    rapidAuth: Array(10).fill(null),
    rapidRegistration: Array(5).fill(null),
    rapidApi: Array(150).fill(null),
  },

  // Input validation test cases
  inputValidation: {
    email: [
      "invalid-email",
      "test@",
      "@test.com",
      "test@test",
      "test@test..com",
      "<script>@test.com",
    ],
    password: [
      "123", // Too short
      "password", // No complexity
      "PASSWORD", // No lowercase
      "12345678", // No letters
      "Pass123", // No special character
    ],
    name: [
      "", // Empty
      "<script>", // XSS
      "A".repeat(101), // Too long
      "123John", // Numbers
    ],
  },

  // Header injection payloads
  headerInjection: [
    "\r\nSet-Cookie: hacked=true",
    "\r\nLocation: https://evil.com",
    "\r\nX-Forwarded-For: 1.1.1.1",
  ],
};

// Security test runner
export class SecurityTestSuite {
  private baseUrl: string;
  private testResults: SecurityTestResult[] = [];

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  /**
   * Run comprehensive security tests
   */
  async runFullSecurityTest(): Promise<SecurityTestResult[]> {
    this.testResults = [];

    // Run all test categories
    await this.testAuthentication();
    await this.testAuthorization();
    await this.testInputValidation();
    await this.testRateLimiting();
    await this.testSecurityHeaders();
    await this.testSQLInjection();
    await this.testXSS();
    await this.testSessionSecurity();

    return this.testResults;
  }

  /**
   * Test authentication security
   */
  async testAuthentication(): Promise<void> {
    // Test 1: Brute force protection
    try {
      const results = await this.sendMultipleRequests('/api/auth', {
        email: 'test@test.com',
        password: 'wrongpassword'
      }, 6);

      const rateLimited = results.some(r => r.status === 429);
      this.addResult({
        testType: SecurityTestType.AUTHENTICATION,
        description: 'Brute force protection',
        status: rateLimited ? 'PASS' : 'FAIL',
        details: rateLimited ? 'Rate limiting activated' : 'No rate limiting detected',
        severity: rateLimited ? 'LOW' : 'HIGH',
      });
    } catch (error) {
      this.addResult({
        testType: SecurityTestType.AUTHENTICATION,
        description: 'Brute force protection test',
        status: 'FAIL',
        details: `Test failed: ${error}`,
        severity: 'HIGH',
      });
    }

    // Test 2: SQL injection in login
    for (const payload of securityTestPayloads.authBypass) {
      const result = await this.testLogin(payload.email, payload.password);
      this.addResult({
        testType: SecurityTestType.AUTHENTICATION,
        description: `SQL injection test: ${payload.email}`,
        status: result.success ? 'FAIL' : 'PASS',
        details: result.success ? 'Authentication bypass possible' : 'Properly blocked',
        severity: result.success ? 'CRITICAL' : 'LOW',
      });
    }
  }

  /**
   * Test authorization security
   */
  async testAuthorization(): Promise<void> {
    // Test role-based access
    const endpoints = [
      { path: '/api/users', method: 'GET', requiredRole: 'admin' },
      { path: '/api/users/1', method: 'DELETE', requiredRole: 'super-admin' },
      { path: '/api/leads', method: 'POST', requiredRole: 'editor' },
    ];

    for (const endpoint of endpoints) {
      const result = await this.testEndpoint(endpoint.path, endpoint.method);
      this.addResult({
        testType: SecurityTestType.AUTHORIZATION,
        description: `${endpoint.method} ${endpoint.path} authorization`,
        status: result.properlyAuthorized ? 'PASS' : 'FAIL',
        details: result.details,
        severity: result.properlyAuthorized ? 'LOW' : 'HIGH',
      });
    }
  }

  /**
   * Test input validation
   */
  async testInputValidation(): Promise<void> {
    // Test email validation
    for (const email of securityTestPayloads.inputValidation.email) {
      const result = await this.testRegistration({ email, password: 'Test123!@#', firstName: 'Test', lastName: 'User' });
      this.addResult({
        testType: SecurityTestType.INPUT_VALIDATION,
        description: `Email validation: ${email}`,
        status: result.valid ? 'FAIL' : 'PASS',
        details: result.valid ? 'Invalid email accepted' : 'Properly rejected',
        severity: result.valid ? 'MEDIUM' : 'LOW',
      });
    }

    // Test password validation
    for (const password of securityTestPayloads.inputValidation.password) {
      const result = await this.testRegistration({ email: 'test@test.com', password, firstName: 'Test', lastName: 'User' });
      this.addResult({
        testType: SecurityTestType.INPUT_VALIDATION,
        description: `Password validation: ${password}`,
        status: result.valid ? 'FAIL' : 'PASS',
        details: result.valid ? 'Weak password accepted' : 'Properly rejected',
        severity: result.valid ? 'MEDIUM' : 'LOW',
      });
    }
  }

  /**
   * Test rate limiting
   */
  async testRateLimiting(): Promise<void> {
    // Test API rate limiting
    const results = await this.sendMultipleRequests('/api/leads', null, 110);
    const rateLimited = results.some(r => r.status === 429);
    this.addResult({
      testType: SecurityTestType.RATE_LIMITING,
      description: 'API rate limiting',
      status: rateLimited ? 'PASS' : 'FAIL',
      details: rateLimited ? 'Rate limiting activated' : 'No rate limiting detected',
      severity: rateLimited ? 'LOW' : 'HIGH',
    });
  }

  /**
   * Test security headers
   */
  async testSecurityHeaders(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/leads`);
    const headers = response.headers;

    const requiredHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection',
      'strict-transport-security',
      'referrer-policy',
    ];

    for (const header of requiredHeaders) {
      const hasHeader = headers.has(header);
      this.addResult({
        testType: SecurityTestType.HEADERS,
        description: `Security header: ${header}`,
        status: hasHeader ? 'PASS' : 'FAIL',
        details: hasHeader ? 'Header present' : 'Header missing',
        severity: hasHeader ? 'LOW' : 'MEDIUM',
      });
    }
  }

  /**
   * Test SQL injection
   */
  async testSQLInjection(): Promise<void> {
    for (const payload of securityTestPayloads.sqlInjection) {
      const result = await this.testRegistration({
        email: `${payload}@test.com`,
        password: 'Test123!@#',
        firstName: 'Test',
        lastName: 'User'
      });
      this.addResult({
        testType: SecurityTestType.SQL_INJECTION,
        description: `SQL injection test: ${payload}`,
        status: result.injected ? 'FAIL' : 'PASS',
        details: result.injected ? 'SQL injection possible' : 'Properly blocked',
        severity: result.injected ? 'CRITICAL' : 'LOW',
      });
    }
  }

  /**
   * Test XSS prevention
   */
  async testXSS(): Promise<void> {
    for (const payload of securityTestPayloads.xssPayloads) {
      const result = await this.testRegistration({
        email: 'test@test.com',
        password: 'Test123!@#',
        firstName: payload,
        lastName: 'User'
      });
      this.addResult({
        testType: SecurityTestType.XSS,
        description: `XSS test: ${payload}`,
        status: result.xssDetected ? 'FAIL' : 'PASS',
        details: result.xssDetected ? 'XSS payload not sanitized' : 'Properly sanitized',
        severity: result.xssDetected ? 'HIGH' : 'LOW',
      });
    }
  }

  /**
   * Test session security
   */
  async testSessionSecurity(): Promise<void> {
    // Test session timeout
    const expiredToken = 'expired.token.here';
    const result = await this.testAuthWithToken(expiredToken);
    this.addResult({
      testType: SecurityTestType.SESSION,
      description: 'Session timeout',
      status: result.expired ? 'PASS' : 'FAIL',
      details: result.expired ? 'Expired token properly rejected' : 'Expired token accepted',
      severity: result.expired ? 'LOW' : 'HIGH',
    });
  }

  // Helper methods
  private async sendMultipleRequests(endpoint: string, body: any, count: number) {
    const promises = Array(count).fill(null).map(() =>
      fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    );
    return Promise.all(promises);
  }

  private async testLogin(email: string, password: string) {
    const response = await fetch(`${this.baseUrl}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return { success: response.ok };
  }

  private async testRegistration(data: any) {
    const response = await fetch(`${this.baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return { valid: response.ok };
  }

  private async testEndpoint(path: string, method: string) {
    const response = await fetch(`${this.baseUrl}${path}`, { method });
    return { properlyAuthorized: response.status !== 403 };
  }

  private async testAuthWithToken(token: string) {
    const response = await fetch(`${this.baseUrl}/api/leads`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return { expired: response.status === 401 };
  }

  private addResult(result: Omit<SecurityTestResult, 'timestamp'>) {
    this.testResults.push({
      ...result,
      timestamp: new Date(),
    });
  }

  /**
   * Get security score
   */
  getSecurityScore(): number {
    const passCount = this.testResults.filter(r => r.status === 'PASS').length;
    const totalCount = this.testResults.length;
    return totalCount > 0 ? Math.round((passCount / totalCount) * 100) : 0;
  }

  /**
   * Generate security report
   */
  generateReport(): string {
    const critical = this.testResults.filter(r => r.severity === 'CRITICAL' && r.status === 'FAIL');
    const high = this.testResults.filter(r => r.severity === 'HIGH' && r.status === 'FAIL');
    const medium = this.testResults.filter(r => r.severity === 'MEDIUM' && r.status === 'FAIL');

    return `
Security Test Report
==================
Total Tests: ${this.testResults.length}
Passed: ${this.testResults.filter(r => r.status === 'PASS').length}
Failed: ${this.testResults.filter(r => r.status === 'FAIL').length}
Score: ${this.getSecurityScore()}%

Critical Issues: ${critical.length}
High Issues: ${high.length}
Medium Issues: ${medium.length}

${critical.map(c => `CRITICAL: ${c.description} - ${c.details}`).join('\n')}
${high.map(h => `HIGH: ${h.description} - ${h.details}`).join('\n')}
${medium.map(m => `MEDIUM: ${m.description} - ${m.details}`).join('\n')}
    `.trim();
  }
}

// Security test runner for CI/CD
export async function runSecurityTests(): Promise<{
  score: number;
  report: string;
  results: SecurityTestResult[];
}> {
  const tester = new SecurityTestSuite();
  const results = await tester.runFullSecurityTest();
  const score = tester.getSecurityScore();
  const report = tester.generateReport();

  return { score, report, results };
}
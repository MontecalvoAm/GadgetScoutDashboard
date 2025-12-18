import { NextRequest, NextResponse } from 'next/server';
import { runSecurityTests } from '@/lib/security/testing';
import { getSecuritySummary } from '@/lib/security/audit';
import { createSecureResponse } from '@/lib/security/headers';

/**
 * Security testing endpoint for administrators
 * This endpoint runs comprehensive security tests
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user (admin only)
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return createSecureResponse({ error: 'Authentication required' }, 401);
    }

    // Verify admin privileges (simplified check)
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';
    if (!isAdmin) {
      return createSecureResponse({ error: 'Admin access required' }, 403);
    }

    // Get query parameters
    const testType = searchParams.get('type') || 'full';
    const summaryOnly = searchParams.get('summary') === 'true';

    if (summaryOnly) {
      // Return security summary
      const summary = await getSecuritySummary();
      return createSecureResponse({
        summary,
        timestamp: new Date().toISOString(),
        status: 'summary'
      });
    }

    if (testType === 'full') {
      // Run comprehensive security tests
      const { score, report, results } = await runSecurityTests();

      return createSecureResponse({
        score,
        report,
        results,
        timestamp: new Date().toISOString(),
        status: 'completed'
      });
    }

    // Run specific test type
    const testResults = await this.runSpecificTest(testType);
    return createSecureResponse({
      testType,
      results: testResults,
      timestamp: new Date().toISOString(),
      status: 'completed'
    });

  } catch (error) {
    console.error('Security test error:', error);
    return createSecureResponse({
      error: 'Security test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}

/**
 * Run specific security test type
 * @param testType - Type of test to run
 */
async function runSpecificTest(testType: string) {
  switch (testType) {
    case 'auth':
      return await this.runAuthenticationTests();
    case 'authorization':
      return await this.runAuthorizationTests();
    case 'input':
      return await this.runInputValidationTests();
    case 'rate':
      return await this.runRateLimitingTests();
    case 'headers':
      return await this.runSecurityHeadersTests();
    default:
      return { error: 'Invalid test type' };
  }
}

/**
 * Run authentication security tests
 */
async function runAuthenticationTests() {
  // Test password strength validation
  const weakPasswords = [
    '123',
    'password',
    'PASSWORD',
    '12345678',
    'Pass123',
  ];

  const results = [];
  for (const password of weakPasswords) {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test-${Date.now()}@test.com`,
        password,
        firstName: 'Test',
        lastName: 'User'
      })
    });

    results.push({
      password,
      accepted: response.ok,
      status: response.status
    });
  }

  return {
    test: 'password_strength',
    results,
    summary: {
      total: weakPasswords.length,
      rejected: results.filter(r => !r.accepted).length,
      accepted: results.filter(r => r.accepted).length
    }
  };
}

/**
 * Run authorization security tests
 */
async function runAuthorizationTests() {
  const endpoints = [
    { path: '/api/users', method: 'GET', expectedRole: 'admin' },
    { path: '/api/leads', method: 'GET', expectedRole: 'viewer' },
    { path: '/api/messages', method: 'POST', expectedRole: 'editor' },
  ];

  const results = [];
  for (const endpoint of endpoints) {
    const response = await fetch(`http://localhost:3000${endpoint.path}`, {
      method: endpoint.method,
      headers: { 'Content-Type': 'application/json' }
    });

    results.push({
      endpoint: `${endpoint.method} ${endpoint.path}`,
      expectedRole: endpoint.expectedRole,
      actualStatus: response.status,
      protected: response.status === 401 || response.status === 403
    });
  }

  return {
    test: 'authorization',
    results,
    summary: {
      total: endpoints.length,
      protected: results.filter(r => r.protected).length,
      unprotected: results.filter(r => !r.protected).length
    }
  };
}

/**
 * Run input validation security tests
 */
async function runInputValidationTests() {
  const testCases = [
    { field: 'email', value: 'invalid-email', expected: false },
    { field: 'email', value: 'test@test.com', expected: true },
    { field: 'password', value: '123', expected: false },
    { field: 'password', value: 'Test123!@#', expected: true },
    { field: 'firstName', value: '<script>', expected: false },
    { field: 'firstName', value: 'John', expected: true },
  ];

  const results = [];
  for (const testCase of testCases) {
    const payload = {
      email: 'test@test.com',
      password: 'Test123!@#',
      firstName: 'Test',
      lastName: 'User',
      [testCase.field]: testCase.value
    };

    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    results.push({
      field: testCase.field,
      value: testCase.value,
      expected: testCase.expected,
      actual: response.ok,
      status: response.status
    });
  }

  return {
    test: 'input_validation',
    results,
    summary: {
      total: testCases.length,
      passed: results.filter(r => r.expected === r.actual).length,
      failed: results.filter(r => r.expected !== r.actual).length
    }
  };
}

/**
 * Run rate limiting security tests
 */
async function runRateLimitingTests() {
  const testResults = [];

  // Test authentication rate limiting
  const authRequests = Array(6).fill(null).map(() =>
    fetch('http://localhost:3000/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', password: 'wrong' })
    })
  );

  const authResponses = await Promise.all(authRequests);
  const rateLimited = authResponses.some(r => r.status === 429);

  testResults.push({
    endpoint: 'POST /api/auth',
    requests: authRequests.length,
    rateLimited,
    status: rateLimited ? 'PASS' : 'FAIL'
  });

  return {
    test: 'rate_limiting',
    results: testResults
  };
}

/**
 * Run security headers tests
 */
async function runSecurityHeadersTests() {
  const response = await fetch('http://localhost:3000/api/leads');
  const headers = response.headers;

  const requiredHeaders = [
    { name: 'x-content-type-options', required: true },
    { name: 'x-frame-options', required: true },
    { name: 'x-xss-protection', required: true },
    { name: 'strict-transport-security', required: false }, // HTTPS only
    { name: 'referrer-policy', required: true },
  ];

  const results = requiredHeaders.map(header => ({
    header: header.name,
    present: headers.has(header.name),
    required: header.required,
    status: header.required && !headers.has(header.name) ? 'FAIL' : 'PASS'
  }));

  return {
    test: 'security_headers',
    results,
    summary: {
      total: requiredHeaders.length,
      present: results.filter(r => r.present).length,
      missing: results.filter(r => !r.present).length
    }
  };
}
import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { verifyPassword } from '@/lib/auth/password';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth/jwt-edge';
import { loginSchema } from '@/lib/validation/auth';
import { createSecureResponse } from '@/lib/security/headers';

// Secure database configuration using environment variables
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '6603', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '12345',
  database: process.env.DB_NAME || 'dashboard',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

export async function POST(request: NextRequest) {
  try {
    // Validate input using new validation schema
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid input',
        details: validation.error.issues
      }, { status: 400 });
    }

    const { email, password } = validation.data;

    console.log('🔐 Login attempt for:', email);

    const connection = await mysql.createConnection(dbConfig);

    try {
      // Updated Query: Select user with password hash
      const [rows]: any = await connection.execute(
        'SELECT ID, Firstname, LastName, Email, PasswordHash, RoleID FROM M_Users ' +
        'WHERE Email = ? AND IsActive = 1',
        [email]
      );

      if (!Array.isArray(rows) || rows.length === 0) {
        return createSecureResponse({
          success: false,
          error: 'Invalid email or password'
        }, 401);
      }

      const user = rows[0];

      // Verify password against hash
      const isPasswordValid = await verifyPassword(password, user.PasswordHash);
      if (!isPasswordValid) {
        return createSecureResponse({
          success: false,
          error: 'Invalid email or password'
        }, 401);
      }

      // Generate JWT tokens
      const payload = {
        userId: user.ID.toString(),
        email: user.Email,
        roleId: user.RoleID,
        permissions: [] // Will be populated based on role
      };

      const accessToken = await generateAccessToken(payload);
      const refreshToken = await generateRefreshToken({ userId: user.ID.toString() });

      // Create response with secure cookie
      const response = createSecureResponse({
        success: true,
        user: {
          id: user.ID,
          email: user.Email,
          firstName: user.Firstname,
          lastName: user.LastName,
          roleId: user.RoleID
        }
      });
      // FIX: Set ACCESS TOKEN as an HTTP-ONLY cookie
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
      path: '/'
    });

      // Set secure cookie for refresh token
      response.cookies.set('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      });

      return response;

    } finally {
      await connection.end();
    }

  } catch (error: any) {
    console.error('🔴 Database error:', error);
    return NextResponse.json({
      error: 'Database connection failed - check SQLYog',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
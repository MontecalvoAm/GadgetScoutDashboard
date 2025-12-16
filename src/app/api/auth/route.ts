import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Optimized DB config for Windows/WSL
const dbConfig = {
  host: '127.0.0.1',
  port: 6603,
  user: 'root',
  password: '12345',
  database: 'dashboard',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

export async function POST(request: NextRequest) {
  try {
    // 1. Receive 'email' instead of 'username'
    const { email, password } = await request.json();

    console.log('🔐 Login attempt for:', email);

    if (!email || !password) {
      return NextResponse.json({
        error: 'Email and password required'
      }, { status: 400 });
    }

    const connection = await mysql.createConnection(dbConfig);

    try {
      // 2. Updated Query:
      // - Selects from 'M_Users' (the table we just edited)
      // - Checks 'Email' column
      // - Selects Firstname, LastName, and RoleID
      const [rows]: any = await connection.execute(
        'SELECT ID, Firstname, LastName, Email, RoleID FROM M_Users ' +
        'WHERE Email = ? AND Password = ? AND IsActive = 1',
        [email.trim(), password]
      );

      if (!Array.isArray(rows) || rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Invalid email or password'
        }, { status: 401 });
      }

      const user = rows[0];

      // 3. Return the new user structure
      return NextResponse.json({
        success: true,
        user: {
          id: user.ID,
          email: user.Email,
          firstName: user.Firstname,
          lastName: user.LastName,
          roleId: user.RoleID // Sending RoleID to frontend
        }
      });

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
import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { hashPassword, validatePasswordStrength } from '@/lib/auth/password';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth/jwt-edge';

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password } = await request.json();

    // 1. Basic Validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // 3. Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json({
        error: 'Password does not meet requirements',
        details: passwordValidation.errors
      }, { status: 400 });
    }

    // 4. Check if email already exists
    const existingUsers = await executeQuery(
      'SELECT ID FROM M_Users WHERE Email = ?',
      [email.toLowerCase().trim()]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    // 5. Get the RoleID for 'Viewer'
    const roleResult = await executeQuery(
      "SELECT ID FROM M_Roles WHERE Name = 'Viewer' LIMIT 1"
    );

    const viewerRoleId = (Array.isArray(roleResult) && roleResult.length > 0)
      ? (roleResult[0] as any).ID
      : 3; // Fallback to Viewer role ID

    // 6. Calculate New User ID (Max+1 Strategy)
    const idResult = await executeQuery('SELECT MAX(ID) as maxId FROM M_Users');
    const nextId = (Array.isArray(idResult) && idResult.length > 0)
      ? ((idResult[0] as any).maxId || 0) + 1
      : 1;

    // 7. Hash the password
    const hashedPassword = await hashPassword(password);

    // 8. Insert the new User with hashed password
    await executeQuery(
      `INSERT INTO M_Users (
        ID, Firstname, LastName, Email, PasswordHash, RoleID, IsActive,ReferenceTableStatusID, CreatedAt,LastLoginAt 
      ) VALUES (?, ?, ?, ?, ?, ?, 1, 1, NOW(), NOW())`,
      [nextId, firstName.trim(), lastName.trim(), email.toLowerCase().trim(), hashedPassword, viewerRoleId]
    );

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      userId: nextId
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({
      error: 'Registration failed',
      details: (error as Error).message
    }, { status: 500 });
  }
}
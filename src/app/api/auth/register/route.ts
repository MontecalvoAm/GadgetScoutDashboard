import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password } = await request.json();

    // 1. Basic Validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // 2. Check if email already exists
    const existingUsers = await executeQuery(
      'SELECT ID FROM M_Users WHERE Email = ?',
      [email]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    // 3. Get the RoleID for 'Viewer'
    const roleResult = await executeQuery(
      "SELECT ID FROM M_Roles WHERE Name = 'Viewer' LIMIT 1"
    );
    
    // Default to 3 if not found, but safe code tries to read it
    const viewerRoleId = (Array.isArray(roleResult) && roleResult.length > 0) 
      ? (roleResult[0] as any).ID 
      : 3; 

    // 4. Calculate New User ID (Max+1 Strategy)
    const idResult = await executeQuery('SELECT MAX(ID) as maxId FROM M_Users');
    const nextId = (Array.isArray(idResult) && idResult.length > 0) 
      ? ((idResult[0] as any).maxId || 0) + 1 
      : 1;

    // 5. Insert the new User
    // Note: In production, wrap 'password' with a hash function like bcrypt.hash(password, 10)
    await executeQuery(
      `INSERT INTO M_Users (
        ID, Firstname, LastName, Email, Password, RoleID, IsActive, ReferenceTableStatusID, CreatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, 1, 1, NOW())`,
      [nextId, firstName, lastName, email, password, viewerRoleId]
    );

    return NextResponse.json({ success: true, message: 'Registration successful' });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ 
      error: 'Registration failed', 
      details: (error as Error).message 
    }, { status: 500 });
  }
}
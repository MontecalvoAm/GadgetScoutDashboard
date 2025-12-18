import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { executeQuery } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth/api-auth';

export async function GET(request: NextRequest) {
  try {
    // Enforce role-based access control
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Only Super Admin and Admin can view all users
    if (user.roleId !== 1 && user.roleId !== 2) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // FIX: Use 'AS' to rename columns to match frontend expectations (camelCase)
    const users = await executeQuery(`
      SELECT
        ID as id,
        Firstname as firstName,
        LastName as lastName,
        Email as email,
        RoleID as roleId,
        IsActive as isActive,
        CreatedAt as createdDate
      FROM M_Users
      ORDER BY ID ASC
    `);

    return NextResponse.json({
      success: true,
      users: Array.isArray(users) ? users : []
    });

  } catch (error) {
    console.error('Users API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
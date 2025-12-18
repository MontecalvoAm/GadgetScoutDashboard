import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { executeQuery } from '@/lib/db';
import { requireRouteAccess } from '@/lib/auth/api-auth';

export async function GET(request: NextRequest) {
  try {
    // Enforce role-based access control
    const authResult = await requireRouteAccess(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const user = authResult.user;

    // All authenticated users can view leads, but limit fields based on role
    let query = `
    SELECT 
      id, 
      first_name, 
      last_name, 
      messenger_link, 
      queries, 
      created_at 
    FROM M_Leads 
    ORDER BY created_at DESC
    `;

    // For viewers, limit sensitive data
// Role check (assuming 3 or 4 is Viewer based on your code)
  if (user.roleId === 3 || user.roleId === 4) {
    query = `
      SELECT id, first_name, last_name, queries, created_at 
      FROM M_Leads 
      ORDER BY created_at DESC
    `;
  }

    const result = await executeQuery(query);

    return NextResponse.json({
      success: true,
      leads: Array.isArray(result) ? result : []
    });

  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}
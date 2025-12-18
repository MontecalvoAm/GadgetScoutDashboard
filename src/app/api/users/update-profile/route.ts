import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth/api-auth'; // Import your auth helper

export async function PATCH(request: NextRequest) {
  try {
    // 1. Authenticate the requester
    const requester = await getUserFromRequest(request);
    if (!requester) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // 2. Authorize: Only Admin (1) or Editor (2) can change roles
    if (requester.roleId !== 1 && requester.roleId !== 2) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { userId, roleId } = await request.json();

    if (!userId || !roleId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // 3. Update the database
    await executeQuery(
      'UPDATE M_Users SET RoleID = ? WHERE ID = ?',
      [roleId, userId]
    );

    return NextResponse.json({ success: true, message: 'Role updated successfully' });

  } catch (error) {
    console.error('Update Role Error:', error);
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
  }
}
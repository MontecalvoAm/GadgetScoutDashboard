import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function PATCH(request: NextRequest) {
  try {
    const { userId, roleId } = await request.json();

    if (!userId || !roleId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Update the user's role in the database
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
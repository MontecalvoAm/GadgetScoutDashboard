import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Execute the deletion
    // Note: If this user is linked to other tables (like conversations), 
    // this might fail unless you have ON DELETE CASCADE set up in your DB.
    await executeQuery('DELETE FROM M_Users WHERE ID = ?', [userId]);

    return NextResponse.json({ success: true, message: 'User deleted successfully' });

  } catch (error) {
    console.error('Delete User Error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
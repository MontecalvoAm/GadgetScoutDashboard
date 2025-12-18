import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth/api-auth';

export async function DELETE(request: NextRequest) {
  try {
    // 1. Authenticate
    const requester = await getUserFromRequest(request);
    if (!requester) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // 2. Authorize: Strictly Super Admin (1) only for deletions
    if (requester.roleId !== 1) {
      return NextResponse.json({ error: 'Only Administrators can delete users' }, { status: 403 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // 3. Prevention: Don't let an admin delete themselves
    if (requester.userId === userId.toString()) {
      return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
    }

    // 4. Database execution
    await executeQuery('DELETE FROM M_Users WHERE ID = ?', [userId]);

    return NextResponse.json({ success: true, message: 'User deleted successfully' });

  } catch (error: any) {
    console.error('Delete User Error:', error);
    
    // Check if deletion failed due to foreign key constraints (like linked conversations)
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return NextResponse.json({ 
        error: 'Cannot delete user. This user has linked records (conversations/messages).' 
      }, { status: 409 });
    }

    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function PATCH(request: NextRequest) {
  try {
    const { userId, firstName, lastName, email } = await request.json();

    if (!userId || !firstName || !lastName || !email) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Update the user's profile info
    await executeQuery(
      'UPDATE M_Users SET Firstname = ?, LastName = ?, Email = ? WHERE ID = ?',
      [firstName, lastName, email, userId]
    );

    return NextResponse.json({ success: true, message: 'Profile updated successfully' });

  } catch (error) {
    console.error('Update Profile Error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
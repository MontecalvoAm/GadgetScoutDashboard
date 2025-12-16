import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET() {
  try {
    // FIX: Use 'AS' to rename columns to match frontend expectations (camelCase)
    const users = await executeQuery(`
      SELECT 
        ID as id, 
        Firstname as firstName, 
        LastName as lastName, 
        Email as email, 
        RoleID as roleId, 
        IsActive as isActive
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
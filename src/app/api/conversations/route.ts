import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET() {
  try {
    const conversations = await executeQuery(`
      SELECT
        c.ID,
        c.Status,
        c.Subject,
        c.Messages,
        c.CreatedAt,
        c.UpdatedAt,
        -- Reverted to 'Name' since 'Firstname' does not exist in M_Customers
        cust.Name as CustomerName,
        cust.Email as CustomerEmail,
        c.Priority,
        c.AssignedAgent
      FROM T_Conversations c
      LEFT JOIN M_Customers cust ON c.CustomerID = cust.ID
      ORDER BY c.UpdatedAt DESC
      LIMIT 50
    `);

    return NextResponse.json({
      success: true,
      conversations: Array.isArray(conversations) ? conversations : []
    });

  } catch (error) {
    console.error('Conversations API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to load conversations',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  }
}
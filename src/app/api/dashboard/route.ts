import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // FIX: Changed 'M_Users_New' to 'M_Users' to match your database
    const usersResult: any = await executeQuery('SELECT COUNT(*) as count FROM M_Users WHERE IsActive = 1');
    const customersResult: any = await executeQuery('SELECT COUNT(*) as count FROM M_Customers');
    const conversationsResult: any = await executeQuery('SELECT COUNT(*) as count FROM T_Conversations');
    const messagesResult: any = await executeQuery('SELECT COUNT(*) as count FROM T_Messages');
    const openConversationsResult: any = await executeQuery(
      'SELECT COUNT(*) as count FROM T_Conversations WHERE Status = "OPEN"'
    );

    // Note: I removed the destructuring "const [users]" because it can be confusing 
    // depending on how executeQuery returns data. This way is safer:

    return NextResponse.json({
      success: true,
      stats: {
        users: usersResult[0]?.count || 0,
        customers: customersResult[0]?.count || 0,
        conversations: conversationsResult[0]?.count || 0,
        messages: messagesResult[0]?.count || 0,
        openConversations: openConversationsResult[0]?.count || 0
      }
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to load dashboard data',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  }
}
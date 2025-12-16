import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const usersResult: any = await executeQuery('SELECT COUNT(*) as count FROM M_Users WHERE IsActive = 1');
    
    // --- CHANGE 1: Query M_Leads instead of M_Customers ---
    const leadsResult: any = await executeQuery('SELECT COUNT(*) as count FROM M_Leads');
    // ------------------------------------------------------

    const conversationsResult: any = await executeQuery('SELECT COUNT(*) as count FROM T_Conversations');
    const messagesResult: any = await executeQuery('SELECT COUNT(*) as count FROM T_Messages');
    const openConversationsResult: any = await executeQuery(
      'SELECT COUNT(*) as count FROM T_Conversations WHERE Status = "OPEN"'
    );

    return NextResponse.json({
      success: true,
      stats: {
        users: usersResult[0]?.count || 0,
        
        // --- CHANGE 2: Return 'leads' key instead of 'customers' ---
        leads: leadsResult[0]?.count || 0,
        // ----------------------------------------------------------
        
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
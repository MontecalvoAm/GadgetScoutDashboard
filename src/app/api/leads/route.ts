import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET() {
  try {
    // FIX: Changed 'ORDER BY Date' to 'ORDER BY created_at' to match your SELECT
    const result = await executeQuery(
      'SELECT first_name, last_name, messenger_link, queries, created_at FROM M_Leads ORDER BY created_at DESC'
    );

    return NextResponse.json({ 
      success: true, 
      leads: result 
    });

  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leads' }, 
      { status: 500 }
    );
  }
}
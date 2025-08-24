import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/database';

export async function DELETE() {
  try {
    // Delete all orders
    const { error } = await supabaseAdmin
      .from('orders')
      .delete()
      .neq('id', 0); // Delete all rows (using a condition that matches all)

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'All orders cleared successfully'
    });

  } catch (error) {
    console.error('Error clearing orders:', error);
    return NextResponse.json(
      { 
        error: 'Failed to clear orders',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
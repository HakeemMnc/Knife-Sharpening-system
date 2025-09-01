import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    let query = supabase
      .from('sms_logs')
      .select(`
        *,
        orders (
          id,
          first_name,
          last_name,
          phone
        )
      `)
      .order('sent_at', { ascending: false });

    if (orderId) {
      query = query.eq('order_id', parseInt(orderId));
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, logs: data || [] });
  } catch (error) {
    console.error('❌ Failed to fetch SMS logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SMS logs' },
      { status: 500 }
    );
  }
}
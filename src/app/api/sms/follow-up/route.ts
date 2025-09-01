import { NextRequest, NextResponse } from 'next/server';
import { SMSService } from '@/lib/sms-service';
import { DatabaseService } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId is required' },
        { status: 400 }
      );
    }

    // Get the order
    const order = await DatabaseService.getOrder(orderId);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order is in delivered status (prevent duplicate follow-ups)
    if (order.status !== 'delivered') {
      return NextResponse.json(
        { error: 'Order must be in delivered status for follow-up' },
        { status: 400 }
      );
    }

    // Send follow-up SMS
    const result = await SMSService.sendFollowUpSMS(order);
    
    if (result) {
      // Auto-update status to completed after successful follow-up SMS
      await DatabaseService.updateOrder(orderId, { status: 'completed' });
      
      console.log(`✅ Follow-up SMS sent and order ${orderId} marked as completed`);
      
      return NextResponse.json({
        success: true,
        message: 'Follow-up SMS sent successfully and order marked as completed'
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to send follow-up SMS'
      });
    }

  } catch (error) {
    console.error('Follow-up SMS API Error:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown'}` },
      { status: 500 }
    );
  }
}
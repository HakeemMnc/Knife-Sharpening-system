import { NextRequest, NextResponse } from 'next/server';
import { SMSService } from '@/lib/sms-service';
import { DatabaseService } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message, orderId } = await request.json();

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'phoneNumber and message are required' },
        { status: 400 }
      );
    }

    // Send SMS reply via Twilio
    const result = await SMSService.sendAdminReply(phoneNumber, message);
    
    if (result.success) {
      // Save admin reply to conversations
      await DatabaseService.saveConversationMessage({
        order_id: orderId,
        phone_number: phoneNumber,
        message_content: message,
        direction: 'outbound',
        twilio_sid: result.messageSid,
        admin_user: 'Admin' // Could be enhanced for multi-admin support
      });

      return NextResponse.json({
        success: true,
        message: 'Reply sent successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        message: result.error || 'Failed to send reply'
      });
    }

  } catch (error) {
    console.error('❌ SMS Reply API Error:', error);
    return NextResponse.json(
      { error: 'Failed to send reply' },
      { status: 500 }
    );
  }
}
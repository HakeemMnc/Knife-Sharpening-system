import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import { SMSService } from '@/lib/sms-service';

export async function POST(request: NextRequest) {
  try {
    // Parse the form data from Twilio
    const formData = await request.formData();
    
    // Extract Twilio webhook parameters
    const from = formData.get('From') as string; // Customer's phone number
    const body = formData.get('Body') as string; // SMS message content
    const messageSid = formData.get('MessageSid') as string; // Twilio message ID
    const accountSid = formData.get('AccountSid') as string; // Twilio account ID
    
    console.log('📱 Incoming SMS webhook:', {
      from,
      body,
      messageSid,
      accountSid
    });

    // Validate required fields
    if (!from || !body) {
      console.error('❌ Missing required fields in webhook');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find the order associated with this phone number
    const orders = await DatabaseService.getAllOrders();
    const matchingOrder = orders.find(order => 
      order.phone === from || order.phone === from.replace('+61', '0')
    );

    if (!matchingOrder) {
      console.log(`⚠️  No order found for phone number: ${from}`);
      // Still save the message but without order association
    }

    // Save the conversation message to database
    const conversationData = {
      phone_number: from,
      message_content: body,
      direction: 'inbound' as const,
      order_id: matchingOrder?.id || undefined,
      twilio_sid: messageSid
    };

    try {
      const savedConversation = await DatabaseService.saveConversationMessage(conversationData);
      console.log('💾 Conversation saved:', savedConversation.id);
    } catch (error) {
      console.error('❌ Failed to save conversation:', error);
      // Continue processing even if save fails
    }

    // Forward SMS to admin's personal phone
    try {
      const customerName = matchingOrder ? `${matchingOrder.first_name} ${matchingOrder.last_name}` : 'Unknown Customer';
      const adminMessage = `🔔 Customer Reply:\nFrom: ${customerName} (${from})\nOrder: ${matchingOrder ? `#${matchingOrder.id}` : 'No order found'}\nMessage: "${body}"`;
      
      const forwardResult = await SMSService.sendAdminNotification(adminMessage);
      console.log('📲 Admin notification result:', forwardResult);
    } catch (forwardError) {
      console.error('❌ Failed to forward SMS to admin:', forwardError);
      // Don't fail the webhook if forwarding fails
    }

    // Respond to Twilio (empty response = no auto-reply to customer)
    return new NextResponse('', { status: 200 });

  } catch (error) {
    console.error('❌ SMS Webhook Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
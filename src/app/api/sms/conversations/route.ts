import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService, dbHelpers } from '@/lib/database';

export async function GET() {
  try {
    const conversations = await DatabaseService.getAllConversations();
    
    // Get order details to include customer names
    const orderIds = [...new Set(conversations.map(c => c.order_id).filter(id => id))];
    const orders = await DatabaseService.getOrdersByIds(orderIds);
    
    // Group conversations by phone number and order
    const conversationGroups: { [key: string]: any } = {};
    
    conversations.forEach(conversation => {
      // Normalize phone number for consistent grouping
      const normalizedPhone = dbHelpers.formatPhoneForSMS(conversation.phone_number);
      const key = `${normalizedPhone}-${conversation.order_id || 'unknown'}`;
      if (!conversationGroups[key]) {
        const order = orders.find(o => o.id === conversation.order_id);
        conversationGroups[key] = {
          phone_number: normalizedPhone,
          order_id: conversation.order_id,
          customer_name: order ? `${order.first_name} ${order.last_name}` : 'Unknown Customer',
          order_details: order ? {
            id: order.id,
            first_name: order.first_name,
            last_name: order.last_name,
            email: order.email,
            phone: order.phone,
            pickup_address: order.pickup_address,
            service_date: order.service_date,
            pickup_time_slot: (order as any).pickup_time_slot,
            total_items: order.total_items,
            service_level: order.service_level,
            total_amount: order.total_amount,
            status: order.status,
            payment_status: order.payment_status,
            special_instructions: order.special_instructions,
            confirmation_sms_status: order.confirmation_sms_status,
            pickup_sms_status: order.pickup_sms_status,
            delivery_sms_status: order.delivery_sms_status,
            followup_sms_status: order.followup_sms_status,
            internal_notes: order.internal_notes
          } : null,
          messages: []
        };
      }
      conversationGroups[key].messages.push(conversation);
    });

    // Convert to array and sort by latest message
    const groupedConversations = Object.values(conversationGroups).map(group => ({
      ...group,
      latestMessage: group.messages[group.messages.length - 1],
      messages: group.messages.sort((a: any, b: any) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    })).sort((a, b) => 
      new Date(b.latestMessage.created_at).getTime() - new Date(a.latestMessage.created_at).getTime()
    );

    return NextResponse.json({
      success: true,
      conversations: groupedConversations
    });

  } catch (error) {
    console.error('❌ Failed to fetch conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
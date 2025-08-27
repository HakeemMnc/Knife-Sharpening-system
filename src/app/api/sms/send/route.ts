import { NextRequest, NextResponse } from 'next/server';
import { SMSService } from '@/lib/sms-service';
import { DatabaseService } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { orderId, smsType } = await request.json();

    // Validate inputs
    if (!orderId || !smsType) {
      return NextResponse.json(
        { error: 'orderId and smsType are required' },
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

    // Send SMS based on type
    let result = false;
    switch (smsType) {
      case 'confirmation':
        result = await SMSService.sendOrderConfirmation(order);
        break;
      case 'reminder_24h':
        result = await SMSService.send24HourReminder(order);
        break;
      case 'morning_reminder':
        result = await SMSService.sendMorningReminder(order);
        break;
      case 'pickup':
        result = await SMSService.sendPickupConfirmation(order);
        break;
      case 'delivery':
        result = await SMSService.sendDeliveryConfirmation(order);
        break;
      case 'followup':
        result = await SMSService.sendFollowUpSMS(order);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid SMS type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: result,
      message: result ? 'SMS sent successfully' : 'Failed to send SMS'
    });

  } catch (error) {
    console.error('SMS API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
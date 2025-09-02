import { NextRequest, NextResponse } from 'next/server';
import { SMSService } from '@/lib/sms-service';
import { DatabaseService } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    console.log('=== SMS API Debug ===');
    console.log('Environment Check:');
    console.log('TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER);
    console.log('ADMIN_PHONE_NUMBER:', process.env.ADMIN_PHONE_NUMBER);
    console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID?.substring(0, 10) + '...');
    
    const { orderId, smsType } = await request.json();
    console.log('Request data:', { orderId, smsType });

    // Validate inputs
    if (!orderId || !smsType) {
      return NextResponse.json(
        { error: 'orderId and smsType are required' },
        { status: 400 }
      );
    }

    // Get the order
    const order = await DatabaseService.getOrder(orderId);
    console.log('Order found:', order ? 'Yes' : 'No');
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check environment variables
    console.log('Environment check:');
    console.log('- TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? 'Set' : 'Missing');
    console.log('- TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? 'Set' : 'Missing');
    console.log('- TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER || 'Missing');

    // Send SMS based on type
    let result = false;
    try {
      switch (smsType) {
        case 'confirmation':
          console.log('Attempting to send confirmation SMS...');
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
      console.log('SMS send result:', result);
    } catch (smsError) {
      console.error('SMS Service Error:', smsError);
      return NextResponse.json({
        success: false,
        message: `SMS Error: ${smsError instanceof Error ? smsError.message : 'Unknown error'}`
      });
    }

    return NextResponse.json({
      success: result,
      message: result ? 'SMS sent successfully' : 'Failed to send SMS'
    });

  } catch (error) {
    console.error('SMS API Error:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown'}` },
      { status: 500 }
    );
  }
}
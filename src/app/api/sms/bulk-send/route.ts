import { NextRequest, NextResponse } from 'next/server';
import { SMSService } from '@/lib/sms-service';
import { DatabaseService } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Bulk SMS API Debug ===');
    const { orderIds, smsType } = await request.json();
    console.log('Request data:', { orderIds, smsType, count: orderIds?.length });

    // Validate inputs
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { error: 'orderIds array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (!smsType) {
      return NextResponse.json(
        { error: 'smsType is required' },
        { status: 400 }
      );
    }

    // Validate SMS type
    const validSMSTypes = ['confirmation', 'reminder_24h', 'morning_reminder', 'pickup', 'delivery', 'followup'];
    if (!validSMSTypes.includes(smsType)) {
      return NextResponse.json(
        { error: 'Invalid SMS type' },
        { status: 400 }
      );
    }

    // Get all orders
    const orders = [];
    for (const orderId of orderIds) {
      const order = await DatabaseService.getOrder(orderId);
      if (order) {
        orders.push(order);
      }
    }

    console.log(`Found ${orders.length} orders out of ${orderIds.length} requested`);

    if (orders.length === 0) {
      return NextResponse.json(
        { error: 'No valid orders found' },
        { status: 404 }
      );
    }

    // Send bulk SMS
    const result = await SMSService.sendBulkSMS(orders, smsType);
    console.log('Bulk SMS result:', result);

    return NextResponse.json({
      success: result.success,
      failed: result.failed,
      results: result.results,
      message: `SMS sent to ${result.success} customers successfully. ${result.failed} failed.`
    });

  } catch (error) {
    console.error('Bulk SMS API Error:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown'}` },
      { status: 500 }
    );
  }
}
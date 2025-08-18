import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Debug Order - Received body:', body);
    
    // Test database connection first
    try {
      const testConnection = await DatabaseService.getAllOrders();
      console.log('Database connection test: SUCCESS, found', testConnection.length, 'orders');
    } catch (dbError) {
      console.error('Database connection test: FAILED', dbError);
      return NextResponse.json({
        error: 'Database connection failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 500 });
    }

    // Test order creation with minimal data
    const minimalOrderData = {
      first_name: body.firstName || 'Test',
      last_name: body.lastName || 'User',
      email: body.email || 'test@example.com',
      phone: body.phone || '0412345678',
      pickup_address: body.address || 'Test Address',
      total_items: body.totalItems || 5,
      service_level: body.serviceLevel || 'standard',
      base_amount: 85,
      upgrade_amount: 0,
      delivery_fee: 0,
      total_amount: 85,
      service_date: body.serviceDate || '2025-08-22',
      pickup_date: '2025-08-26',
      pickup_time_slot: 'morning' as const,
      status: 'pending' as const,
      payment_status: 'unpaid' as const,
      confirmation_sms_sent: false,
      reminder_24h_sent: false,
      reminder_1h_sent: false,
      pickup_confirmation_sent: false,
      delivery_confirmation_sent: false,
      followup_sms_sent: false,
    };

    console.log('Attempting to create order with data:', minimalOrderData);
    
    const order = await DatabaseService.createOrder(minimalOrderData);
    console.log('Order created successfully:', order);

    return NextResponse.json({
      success: true,
      message: 'Debug order created successfully',
      orderId: order.id,
      serviceDate: order.service_date
    });

  } catch (error) {
    console.error('Debug order creation failed:', error);
    
    return NextResponse.json({
      error: 'Debug order creation failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
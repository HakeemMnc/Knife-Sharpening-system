import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService, dbHelpers } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🚨🚨 ORDERS API CALLED - Someone is creating an order!');
    console.log('🔍 Orders API - Received request body:', JSON.stringify(body, null, 2));
    console.log('🔍 Request URL:', request.url);
    console.log('🔍 Timestamp:', new Date().toISOString());
    
    // Extract form data
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      streetAddress,
      suburb,
      state,
      postalCode,
      specialInstructions,
      totalItems,
      serviceLevel = 'standard',
      serviceDate
    } = body;

    // Validate required fields
    console.log('🔍 Validation check:', {
      firstName: !!firstName,
      lastName: !!lastName,
      email: !!email,
      phone: !!phone,
      address: !!address,
      totalItems: !!totalItems,
      serviceDate: !!serviceDate
    });
    
    if (!firstName || !lastName || !email || !phone || !address || !totalItems || !serviceDate) {
      const missingFields = [];
      if (!firstName) missingFields.push('firstName');
      if (!lastName) missingFields.push('lastName');
      if (!email) missingFields.push('email');
      if (!phone) missingFields.push('phone');
      if (!address) missingFields.push('address');
      if (!totalItems) missingFields.push('totalItems');
      if (!serviceDate) missingFields.push('serviceDate');
      
      console.log('❌ Missing required fields:', missingFields);
      return NextResponse.json(
        { error: 'Missing required fields', missing: missingFields },
        { status: 400 }
      );
    }

    // Validate address components if provided
    if (streetAddress && (!suburb || !state || !postalCode)) {
      return NextResponse.json(
        { error: 'Incomplete address information' },
        { status: 400 }
      );
    }

    // Calculate order totals
    console.log('🔍 Calculating totals for:', { totalItems, serviceLevel });
    const totals = dbHelpers.calculateOrderTotals(totalItems, serviceLevel);
    console.log('🔍 Calculated totals:', totals);

    // Create order data
    const orderData = {
      first_name: firstName,
      last_name: lastName,
      email: email.toLowerCase(),
      phone: phone.replace(/\s/g, ''), // Remove spaces
      pickup_address: address,
      street_address: streetAddress || null,
      suburb: suburb || null,
      state: state || null,
      postal_code: postalCode || null,
      special_instructions: specialInstructions || null,
      total_items: totalItems,
      service_level: serviceLevel,
      base_amount: totals.base_amount,
      upgrade_amount: totals.upgrade_amount,
      delivery_fee: totals.delivery_fee,
      total_amount: totals.total_amount,
      service_date: serviceDate,
      pickup_date: dbHelpers.getNextMonday(), // Legacy compatibility
      pickup_time_slot: 'morning' as const,
      status: 'pending' as const,
      payment_status: 'unpaid' as const,
      confirmation_sms_sent: false,
      reminder_24h_sent: false,
      reminder_1h_sent: false,
      pickup_confirmation_sent: false,
      delivery_confirmation_sent: false,
      followup_sms_sent: false,
      internal_notes: undefined,
    };

    // Save order to database
    console.log('🔍 Creating order with data:', JSON.stringify(orderData, null, 2));
    const order = await DatabaseService.createOrder(orderData);
    console.log('✅ Order created successfully:', order.id);

    // Return success response
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        total: order.total_amount,
        serviceDate: order.service_date,
        pickupDate: order.pickup_date, // Legacy compatibility
        status: order.status
      }
    });

  } catch (error) {
    console.error('❌ Error creating order:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Failed to create order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get all orders for admin dashboard
    const orders = await DatabaseService.getAllOrders();
    
    return NextResponse.json({
      success: true,
      orders: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

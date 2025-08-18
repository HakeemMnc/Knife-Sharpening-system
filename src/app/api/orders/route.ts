import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService, dbHelpers } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
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
      serviceLevel = 'standard'
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !address || !totalItems) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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
    const totals = dbHelpers.calculateOrderTotals(totalItems, serviceLevel);

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
      pickup_date: dbHelpers.getNextMonday(),
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
    const order = await DatabaseService.createOrder(orderData);

    // Return success response
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        total: order.total_amount,
        pickupDate: order.pickup_date,
        status: order.status
      }
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
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

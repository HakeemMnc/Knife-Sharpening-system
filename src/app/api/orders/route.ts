import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService, dbHelpers } from '@/lib/database';
import { BookingLimitsService } from '@/lib/booking-limits';
import { SMSService } from '@/lib/sms-service';

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
      totalAmount,
      serviceLevel = 'standard',
      serviceDate,
      stripePaymentId // If provided, this is a paid order
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

    // Check booking availability
    console.log('🔍 Checking booking availability for:', serviceDate);
    const canBook = await BookingLimitsService.canBookForDate(serviceDate, 1, totalItems);
    if (!canBook) {
      console.log('❌ Booking not available for date:', serviceDate);
      return NextResponse.json(
        { 
          success: false, 
          error: 'The selected date is no longer available. Please choose another date.',
          details: 'Daily booking limit has been reached or date is unavailable'
        },
        { status: 400 }
      );
    }
    console.log('✅ Booking availability confirmed for:', serviceDate);

    // Calculate order totals or use provided amount
    let finalTotals;
    if (totalAmount && stripePaymentId) {
      // For paid orders, use the amount that was actually paid
      console.log('💰 Using provided total amount for paid order:', totalAmount);
      finalTotals = {
        base_amount: totalAmount,
        upgrade_amount: 0,
        delivery_fee: 0,
        total_amount: totalAmount,
      };
    } else {
      // Calculate totals normally for unpaid orders
      console.log('🔍 Calculating totals for:', { totalItems, serviceLevel });
      finalTotals = dbHelpers.calculateOrderTotals(totalItems, serviceLevel);
      console.log('🔍 Calculated totals:', finalTotals);
    }

    // Determine order status based on payment
    const isPaymentCompleted = !!stripePaymentId;
    console.log(isPaymentCompleted ? '✅ Creating PAID order' : '⚠️ Creating PENDING order');

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
      base_amount: finalTotals.base_amount,
      upgrade_amount: finalTotals.upgrade_amount,
      delivery_fee: finalTotals.delivery_fee,
      total_amount: finalTotals.total_amount,
      service_date: serviceDate,
      pickup_date: dbHelpers.getNextMonday(), // Legacy compatibility
      pickup_time_slot: 'morning' as const,
      status: isPaymentCompleted ? 'paid' as const : 'pending' as const,
      payment_status: isPaymentCompleted ? 'paid' as const : 'unpaid' as const,
      stripe_payment_id: stripePaymentId || undefined,
      confirmation_sms_sent: false,
      reminder_24h_sent: false,
      morning_reminder_sent: false,
      pickup_sms_sent: false,
      delivery_sms_sent: false,
      followup_sms_sent: false,
      internal_notes: undefined,
    };

    // Save order to database
    console.log('🔍 Creating order with data:', JSON.stringify(orderData, null, 2));
    const order = await DatabaseService.createOrder(orderData);
    console.log('✅ Order created successfully:', order.id);

    // Increment booking count
    console.log('🔍 Incrementing booking count for:', serviceDate);
    try {
      await BookingLimitsService.incrementBookingCount(serviceDate, 1, totalItems);
      console.log('✅ Booking count incremented successfully');
    } catch (error) {
      console.error('⚠️ Error incrementing booking count:', error);
      // Don't fail the order creation for this
    }

    // Send admin notification SMS for new booking
    console.log('🔍 Sending admin notification for new booking');
    try {
      const serviceFormatted = new Date(serviceDate).toLocaleDateString('en-AU', { 
        weekday: 'long',
        day: '2-digit', 
        month: '2-digit',
        year: 'numeric'
      });
      
      const notificationMessage = `🔪 NEW BOOKING ALERT\n\n` +
        `Customer: ${firstName} ${lastName}\n` +
        `Phone: ${phone}\n` +
        `Service: ${serviceFormatted}\n` +
        `Items: ${totalItems}\n` +
        `Amount: $${finalTotals.total_amount.toFixed(2)}\n` +
        `Status: ${isPaymentCompleted ? 'PAID' : 'PENDING PAYMENT'}\n` +
        `Order ID: #${order.id}`;
      
      await SMSService.sendAdminNotification(notificationMessage);
      console.log('✅ Admin notification sent successfully');
    } catch (error) {
      console.error('⚠️ Error sending admin notification:', error);
      // Don't fail the order creation for this
    }

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
    
    // Debug logging
    console.log('=== Orders API Debug ===');
    console.log('Found orders:', orders.length);
    if (orders.length > 0) {
      console.log('First order SMS status fields:', {
        id: orders[0].id,
        confirmation_sms_status: orders[0].confirmation_sms_status,
        reminder_24h_status: orders[0].reminder_24h_status,
        morning_reminder_status: orders[0].morning_reminder_status,
        pickup_sms_status: orders[0].pickup_sms_status
      });
    }
    
    // Ensure SMS status fields are included in the response
    const ordersWithSMS = orders.map(order => ({
      ...order,
      // Explicitly include SMS status fields
      confirmation_sms_status: order.confirmation_sms_status || 'pending',
      reminder_24h_status: order.reminder_24h_status || 'pending',
      morning_reminder_status: order.morning_reminder_status || 'pending',
      pickup_sms_status: order.pickup_sms_status || 'pending',
      delivery_sms_status: order.delivery_sms_status || 'pending',
      followup_sms_status: order.followup_sms_status || 'pending'
    }));

    return NextResponse.json({
      success: true,
      orders: ordersWithSMS
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

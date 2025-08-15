import { NextRequest, NextResponse } from 'next/server';
import { StripeService } from '@/lib/stripe-service';
import { DatabaseService } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get the order from database
    const order = await DatabaseService.getOrder(orderId);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order is already paid
    if (order.payment_status === 'paid') {
      return NextResponse.json(
        { error: 'Order is already paid' },
        { status: 400 }
      );
    }

    // Create or retrieve Stripe customer
    const customerId = await StripeService.createOrRetrieveCustomer(order);
    
    // Update order with customer ID
    await DatabaseService.updateOrder(orderId, {
      stripe_customer_id: customerId,
    });

    // Create payment intent
    const { clientSecret, paymentIntentId } = await StripeService.createPaymentIntent(order);

    return NextResponse.json({
      success: true,
      clientSecret,
      paymentIntentId,
      customerId,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}

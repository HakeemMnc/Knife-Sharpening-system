import { NextRequest, NextResponse } from 'next/server';
import { StripeService } from '@/lib/stripe-service';
import { DatabaseService } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, orderData } = body;

    if (!amount || !orderData) {
      return NextResponse.json(
        { error: 'Amount and order data are required' },
        { status: 400 }
      );
    }

    console.log('💳 Creating payment intent for amount:', amount);

    // Create or retrieve Stripe customer using new method
    const customerId = await StripeService.createOrRetrieveCustomerFromData({
      email: orderData.email,
      firstName: orderData.firstName,
      lastName: orderData.lastName,
      phone: orderData.phone,
      address: orderData.address,
    });
    
    // Create payment intent directly with amount
    const { clientSecret, paymentIntentId } = await StripeService.createPaymentIntentWithAmount(
      amount, 
      customerId,
      orderData
    );

    return NextResponse.json({
      success: true,
      clientSecret,
      paymentIntentId,
      customerId,
    });
  } catch (error) {
    console.error('❌ Error creating payment intent:', error);
    console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { 
        error: 'Failed to create payment intent',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

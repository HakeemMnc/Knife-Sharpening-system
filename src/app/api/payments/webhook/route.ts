import { NextRequest, NextResponse } from 'next/server';
import { StripeService } from '@/lib/stripe-service';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  console.log('🎯 WEBHOOK: Webhook received at', new Date().toISOString());
  
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('Missing stripe signature');
    return NextResponse.json(
      { error: 'Missing stripe signature' },
      { status: 400 }
    );
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log('Webhook signature verified, event type:', event.type);

    // Handle the event
    await StripeService.handleWebhookEvent(event);

    console.log('Webhook processed successfully');
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { StripeConnectService } from '@/lib/stripe-connect';
import { B2BDatabaseService } from '@/lib/b2b-database';
import { DatabaseService } from '@/lib/database';
import type Stripe from 'stripe';

// POST: Handle Stripe Connect webhook events
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('No Stripe Connect webhook secret configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  try {
    const event = StripeConnectService.constructWebhookEvent(body, signature, webhookSecret);

    // Idempotency check
    const alreadyProcessed = await DatabaseService.isWebhookProcessed(event.id);
    if (alreadyProcessed) {
      return NextResponse.json({ received: true, duplicate: true });
    }
    await DatabaseService.markWebhookProcessed(event.id, event.type);

    switch (event.type) {
      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        await StripeConnectService.handleAccountUpdated(account);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice, event.account);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.error(`Invoice payment failed for account ${event.account}: ${invoice.id}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      default:
        // Unhandled event type — log and acknowledge
        console.log(`Unhandled Connect webhook event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Connect webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 });
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice, connectedAccountId: string | null | undefined): Promise<void> {
  // Find the contract by subscription ID and mark visits as billed
  const subscriptionId = typeof invoice.subscription === 'string'
    ? invoice.subscription
    : invoice.subscription?.id;

  if (!subscriptionId) return;

  // The subscription metadata contains the contract_id
  // Since we can't easily query contracts by stripe_subscription_id via the current DB service,
  // we log this for now. The usage reporting already marks visits as billed.
  console.log(`Invoice paid: ${invoice.id} for subscription ${subscriptionId} on account ${connectedAccountId}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  const contractId = subscription.metadata?.contract_id;
  if (!contractId) return;

  // Sync pause state
  if (subscription.pause_collection) {
    await B2BDatabaseService.updateContract(contractId, { status: 'paused' });
  } else if (subscription.status === 'active') {
    const contract = await B2BDatabaseService.getContract(contractId);
    if (contract && contract.status === 'paused') {
      await B2BDatabaseService.updateContract(contractId, { status: 'active' });
    }
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  const contractId = subscription.metadata?.contract_id;
  if (!contractId) return;

  await B2BDatabaseService.updateContract(contractId, { status: 'cancelled' });
}

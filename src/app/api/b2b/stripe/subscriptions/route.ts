import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { B2BDatabaseService } from '@/lib/b2b-database';
import { StripeConnectService } from '@/lib/stripe-connect';

// POST: Create a metered subscription for a contract
export async function POST(request: NextRequest) {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) return result;

  try {
    if (!result.tenant_id) {
      return NextResponse.json({ error: 'No tenant associated with this account' }, { status: 400 });
    }

    const tenant = await B2BDatabaseService.getTenant(result.tenant_id);
    if (!tenant || !tenant.stripe_account_id || !tenant.stripe_onboarding_complete) {
      return NextResponse.json({ error: 'Stripe Connect not set up. Please connect your Stripe account first.' }, { status: 400 });
    }

    const body = await request.json();
    const { contract_id, client_email, client_name } = body;

    if (!contract_id) {
      return NextResponse.json({ error: 'contract_id is required' }, { status: 400 });
    }

    const contract = await B2BDatabaseService.getContract(contract_id);
    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    if (contract.tenant_id !== result.tenant_id && result.role !== 'platform_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (contract.stripe_subscription_id) {
      return NextResponse.json({ error: 'Contract already has a subscription' }, { status: 400 });
    }

    // Create or use existing Stripe customer on the connected account
    const stripeCustomerId = await StripeConnectService.createStripeCustomerForClient(
      client_email || `client-${contract.client_id}@placeholder.com`,
      client_name || 'Client',
      tenant.stripe_account_id
    );

    // Create the metered subscription
    const { subscriptionId, priceId } = await StripeConnectService.createMeteredSubscription(
      contract,
      stripeCustomerId,
      tenant.stripe_account_id
    );

    return NextResponse.json({
      success: true,
      data: { subscriptionId, priceId },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create subscription';
    console.error('Subscription creation error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

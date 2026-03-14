import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { B2BDatabaseService } from '@/lib/b2b-database';
import { StripeConnectService } from '@/lib/stripe-connect';

// POST: Create Express Connect account and return onboarding URL
// GET: Check account status
export async function POST(request: NextRequest) {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) return result;

  try {
    if (!result.tenant_id) {
      return NextResponse.json({ error: 'No tenant associated with this account' }, { status: 400 });
    }

    const tenant = await B2BDatabaseService.getTenant(result.tenant_id);
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // If they already have an account, generate a new onboarding link
    if (tenant.stripe_account_id) {
      const url = await StripeConnectService.createAccountLink(
        tenant.stripe_account_id,
        tenant.id
      );
      return NextResponse.json({ success: true, data: { accountId: tenant.stripe_account_id, onboardingUrl: url } });
    }

    // Create new Express Connect account
    const { accountId, onboardingUrl } = await StripeConnectService.createConnectAccount(tenant);

    return NextResponse.json({
      success: true,
      data: { accountId, onboardingUrl },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create Stripe Connect account';
    console.error('Stripe Connect error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) return result;

  try {
    if (!result.tenant_id) {
      return NextResponse.json({ error: 'No tenant associated with this account' }, { status: 400 });
    }

    const tenant = await B2BDatabaseService.getTenant(result.tenant_id);
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    if (!tenant.stripe_account_id) {
      return NextResponse.json({
        success: true,
        data: { connected: false },
      });
    }

    const status = await StripeConnectService.getAccountStatus(tenant.stripe_account_id);

    // Generate dashboard link if onboarding is complete
    let dashboardUrl: string | null = null;
    if (status.onboardingComplete) {
      dashboardUrl = await StripeConnectService.getExpressDashboardLink(tenant.stripe_account_id);
    }

    return NextResponse.json({
      success: true,
      data: {
        connected: true,
        accountId: tenant.stripe_account_id,
        ...status,
        dashboardUrl,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get Stripe account status';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

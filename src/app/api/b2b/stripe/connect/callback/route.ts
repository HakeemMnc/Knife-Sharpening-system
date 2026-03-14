import { NextRequest, NextResponse } from 'next/server';
import { B2BDatabaseService } from '@/lib/b2b-database';
import { StripeConnectService } from '@/lib/stripe-connect';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// GET: Handle return from Stripe Express onboarding
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get('account_id');
  const tenantId = searchParams.get('tenant_id');

  if (!accountId || !tenantId) {
    return NextResponse.redirect(`${APP_URL}/operator?tab=settings&stripe=error`);
  }

  try {
    // Check the account status
    const status = await StripeConnectService.getAccountStatus(accountId);

    // Update tenant with onboarding status
    await B2BDatabaseService.updateTenant(tenantId, {
      stripe_account_id: accountId,
      stripe_onboarding_complete: status.onboardingComplete,
    });

    if (status.onboardingComplete) {
      return NextResponse.redirect(`${APP_URL}/operator?tab=settings&stripe=success`);
    }

    // Onboarding not yet complete — redirect back with pending status
    return NextResponse.redirect(`${APP_URL}/operator?tab=settings&stripe=pending`);
  } catch (error) {
    console.error('Stripe callback error:', error);
    return NextResponse.redirect(`${APP_URL}/operator?tab=settings&stripe=error`);
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { B2BDatabaseService } from '@/lib/b2b-database';
import { StripeConnectService } from '@/lib/stripe-connect';

// POST: Report usage for a completed visit
export async function POST(request: NextRequest) {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) return result;

  try {
    if (!result.tenant_id) {
      return NextResponse.json({ error: 'No tenant associated with this account' }, { status: 400 });
    }

    const tenant = await B2BDatabaseService.getTenant(result.tenant_id);
    if (!tenant || !tenant.stripe_account_id) {
      return NextResponse.json({ error: 'Stripe Connect not set up' }, { status: 400 });
    }

    const body = await request.json();
    const { visit_id } = body;

    if (!visit_id) {
      return NextResponse.json({ error: 'visit_id is required' }, { status: 400 });
    }

    const visit = await B2BDatabaseService.getVisit(visit_id);
    if (!visit) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
    }

    if (visit.tenant_id !== result.tenant_id && result.role !== 'platform_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (visit.status !== 'completed') {
      return NextResponse.json({ error: 'Visit must be completed before reporting usage' }, { status: 400 });
    }

    if (visit.billed) {
      return NextResponse.json({ error: 'Visit has already been billed' }, { status: 400 });
    }

    if (!visit.contract_id) {
      return NextResponse.json({ error: 'Visit has no associated contract' }, { status: 400 });
    }

    const contract = await B2BDatabaseService.getContract(visit.contract_id);
    if (!contract || !contract.stripe_subscription_id) {
      return NextResponse.json({ error: 'No active subscription for this contract' }, { status: 400 });
    }

    // Report 1 unit of usage (one visit completed)
    const usageRecordId = await StripeConnectService.reportUsage(
      contract.stripe_subscription_id,
      1,
      tenant.stripe_account_id,
      visit.id
    );

    return NextResponse.json({
      success: true,
      data: { usageRecordId, visitId: visit.id, billed: true },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to report usage';
    console.error('Usage reporting error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

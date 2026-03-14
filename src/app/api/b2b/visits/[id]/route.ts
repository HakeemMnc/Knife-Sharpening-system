import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { B2BDatabaseService } from '@/lib/b2b-database';
import { StripeConnectService } from '@/lib/stripe-connect';
import type { VisitStatus } from '@/types/b2b';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) return result;

  try {
    const { id } = await params;
    const visit = await B2BDatabaseService.getVisit(id);
    if (!visit) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
    }

    if (visit.tenant_id !== result.tenant_id && result.role !== 'platform_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: visit });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch visit';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) return result;

  try {
    const { id } = await params;
    const existing = await B2BDatabaseService.getVisit(id);
    if (!existing) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
    }

    if (existing.tenant_id !== result.tenant_id && result.role !== 'platform_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const newStatus = body.status as VisitStatus | undefined;

    // If only status is being updated, use the status update method
    let visit;
    if (newStatus && Object.keys(body).length === 1) {
      visit = await B2BDatabaseService.updateVisitStatus(id, newStatus);
    } else {
      visit = await B2BDatabaseService.updateVisit(id, body);
    }

    // Auto-report usage to Stripe when visit is completed
    if (newStatus === 'completed' && existing.status !== 'completed' && visit.contract_id && !visit.billed) {
      try {
        const contract = await B2BDatabaseService.getContract(visit.contract_id);
        if (contract?.stripe_subscription_id && result.tenant_id) {
          const tenant = await B2BDatabaseService.getTenant(result.tenant_id);
          if (tenant?.stripe_account_id) {
            await StripeConnectService.reportUsage(
              contract.stripe_subscription_id,
              1,
              tenant.stripe_account_id,
              visit.id
            );
            // Re-fetch the visit to include updated billing fields
            const updatedVisit = await B2BDatabaseService.getVisit(id);
            if (updatedVisit) visit = updatedVisit;
          }
        }
      } catch (billingError) {
        console.error('Auto-billing error (visit still marked completed):', billingError);
        // Don't fail the visit update if billing fails
      }
    }

    return NextResponse.json({ success: true, data: visit });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update visit';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

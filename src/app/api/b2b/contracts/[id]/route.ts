import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { B2BDatabaseService } from '@/lib/b2b-database';
import { StripeConnectService } from '@/lib/stripe-connect';
import type { ContractStatus } from '@/types/b2b';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) return result;

  try {
    const { id } = await params;
    const contract = await B2BDatabaseService.getContract(id);
    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    if (contract.tenant_id !== result.tenant_id && result.role !== 'platform_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: contract });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch contract';
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
    const existing = await B2BDatabaseService.getContract(id);
    if (!existing) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    if (existing.tenant_id !== result.tenant_id && result.role !== 'platform_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const newStatus = body.status as ContractStatus | undefined;

    // Handle Stripe subscription lifecycle on status changes
    if (newStatus && existing.stripe_subscription_id && result.tenant_id) {
      const tenant = await B2BDatabaseService.getTenant(result.tenant_id);
      if (tenant?.stripe_account_id) {
        try {
          if (newStatus === 'paused' && existing.status === 'active') {
            await StripeConnectService.pauseSubscription(
              existing.stripe_subscription_id,
              tenant.stripe_account_id
            );
          } else if (newStatus === 'active' && existing.status === 'paused') {
            await StripeConnectService.resumeSubscription(
              existing.stripe_subscription_id,
              tenant.stripe_account_id
            );
          } else if (newStatus === 'cancelled') {
            await StripeConnectService.cancelSubscription(
              existing.stripe_subscription_id,
              tenant.stripe_account_id
            );
          }
        } catch (stripeError) {
          console.error('Stripe subscription lifecycle error:', stripeError);
          // Continue with the DB update even if Stripe fails
        }
      }
    }

    const contract = await B2BDatabaseService.updateContract(id, body);
    return NextResponse.json({ success: true, data: contract });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update contract';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

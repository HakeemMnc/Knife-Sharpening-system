import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { StripePlatformService } from '@/lib/stripe-platform';
import type { PlatformPlan } from '@/types/b2b';

export async function GET(request: NextRequest) {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) return result;

  if (!result.tenant_id) {
    return NextResponse.json({ error: 'No business account found' }, { status: 404 });
  }

  try {
    const subscription = await StripePlatformService.getPlatformSubscription(result.tenant_id);
    const plans = StripePlatformService.getAllPlans();

    return NextResponse.json({
      success: true,
      data: {
        subscription,
        plans,
        currentPlan: subscription?.plan || 'free',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch subscription';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) return result;

  if (!result.tenant_id) {
    return NextResponse.json({ error: 'No business account found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const plan = body.plan as PlatformPlan;

    if (!['free', 'pro', 'enterprise'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    await StripePlatformService.changePlatformPlan(result.tenant_id, plan);

    return NextResponse.json({ success: true, message: `Plan changed to ${plan}` });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to change plan';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) return result;

  if (!result.tenant_id) {
    return NextResponse.json({ error: 'No business account found' }, { status: 404 });
  }

  try {
    await StripePlatformService.cancelPlatformSubscription(result.tenant_id);

    return NextResponse.json({ success: true, message: 'Subscription will cancel at end of period' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to cancel subscription';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

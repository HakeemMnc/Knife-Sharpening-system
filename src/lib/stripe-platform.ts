import Stripe from 'stripe';
import type { PlatformPlan } from '@/types/b2b';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Platform SaaS pricing — platform's own Stripe account (not Express Connect)
const PLATFORM_PLANS: Record<PlatformPlan, { name: string; priceMonthly: number; maxClients: number; stripePriceId: string | null }> = {
  free: {
    name: 'Free',
    priceMonthly: 0,
    maxClients: 5,
    stripePriceId: null, // No Stripe subscription for free tier
  },
  pro: {
    name: 'Pro',
    priceMonthly: 4900, // $49.00 in cents
    maxClients: -1, // Unlimited
    stripePriceId: process.env.STRIPE_PLATFORM_PRO_PRICE_ID || null,
  },
  enterprise: {
    name: 'Enterprise',
    priceMonthly: 14900, // $149.00 in cents
    maxClients: -1, // Unlimited
    stripePriceId: process.env.STRIPE_PLATFORM_ENTERPRISE_PRICE_ID || null,
  },
};

export class StripePlatformService {
  // ============================================================
  // PLAN DEFINITIONS
  // ============================================================

  static getPlanDetails(plan: PlatformPlan) {
    return PLATFORM_PLANS[plan];
  }

  static getAllPlans() {
    return Object.entries(PLATFORM_PLANS).map(([key, value]) => ({
      id: key as PlatformPlan,
      ...value,
    }));
  }

  // ============================================================
  // CUSTOMER MANAGEMENT — Platform-level Stripe customer
  // ============================================================

  static async createPlatformCustomer(tenantId: string, email: string, businessName: string): Promise<string> {
    const customer = await stripe.customers.create({
      email,
      name: businessName,
      metadata: {
        tenant_id: tenantId,
        type: 'platform_operator',
      },
    });

    // Update tenant with platform customer ID
    const { supabaseAdmin } = await import('@/lib/database');
    await supabaseAdmin
      .from('tenants')
      .update({ platform_customer_id: customer.id })
      .eq('id', tenantId);

    return customer.id;
  }

  // ============================================================
  // SUBSCRIPTION MANAGEMENT
  // ============================================================

  static async createPlatformSubscription(
    tenantId: string,
    customerId: string,
    plan: PlatformPlan
  ): Promise<{ subscriptionId: string | null; status: string }> {
    const planDetails = PLATFORM_PLANS[plan];

    // Free tier — no Stripe subscription needed
    if (plan === 'free' || !planDetails.stripePriceId) {
      const { supabaseAdmin } = await import('@/lib/database');

      // Create local subscription record
      await supabaseAdmin.from('platform_subscriptions').insert({
        tenant_id: tenantId,
        stripe_customer_id: customerId,
        plan: 'free',
        status: 'active',
      });

      // Update tenant
      await supabaseAdmin
        .from('tenants')
        .update({
          platform_plan: 'free',
          platform_subscription_status: 'active',
          max_clients: planDetails.maxClients,
        })
        .eq('id', tenantId);

      return { subscriptionId: null, status: 'active' };
    }

    // Paid tier — create Stripe subscription with trial
    const trialDays = 14;
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: planDetails.stripePriceId }],
      trial_period_days: trialDays,
      metadata: {
        tenant_id: tenantId,
        platform_plan: plan,
      },
    });

    const { supabaseAdmin } = await import('@/lib/database');

    // Create local subscription record
    await supabaseAdmin.from('platform_subscriptions').insert({
      tenant_id: tenantId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customerId,
      plan,
      status: subscription.status === 'trialing' ? 'trialing' : 'active',
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    });

    // Calculate trial end date
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

    // Update tenant
    await supabaseAdmin
      .from('tenants')
      .update({
        platform_plan: plan,
        platform_subscription_id: subscription.id,
        platform_subscription_status: subscription.status === 'trialing' ? 'trialing' : 'active',
        trial_ends_at: trialEndsAt.toISOString(),
        max_clients: planDetails.maxClients,
      })
      .eq('id', tenantId);

    return {
      subscriptionId: subscription.id,
      status: subscription.status === 'trialing' ? 'trialing' : 'active',
    };
  }

  static async changePlatformPlan(
    tenantId: string,
    newPlan: PlatformPlan
  ): Promise<void> {
    const { supabaseAdmin } = await import('@/lib/database');

    // Get current tenant
    const { data: tenant } = await supabaseAdmin
      .from('tenants')
      .select('platform_subscription_id, platform_customer_id, platform_plan')
      .eq('id', tenantId)
      .single();

    if (!tenant) throw new Error('Tenant not found');

    const newPlanDetails = PLATFORM_PLANS[newPlan];

    // Downgrading to free — cancel existing subscription
    if (newPlan === 'free') {
      if (tenant.platform_subscription_id) {
        await stripe.subscriptions.update(tenant.platform_subscription_id, {
          cancel_at_period_end: true,
        });
      }

      await supabaseAdmin
        .from('tenants')
        .update({
          platform_plan: 'free',
          max_clients: newPlanDetails.maxClients,
        })
        .eq('id', tenantId);

      return;
    }

    // Upgrading to paid plan
    if (!newPlanDetails.stripePriceId) throw new Error('Price not configured for plan');

    if (tenant.platform_subscription_id) {
      // Update existing subscription
      const subscription = await stripe.subscriptions.retrieve(tenant.platform_subscription_id);
      await stripe.subscriptions.update(tenant.platform_subscription_id, {
        items: [{
          id: subscription.items.data[0].id,
          price: newPlanDetails.stripePriceId,
        }],
        metadata: { platform_plan: newPlan },
      });
    } else if (tenant.platform_customer_id) {
      // Create new subscription
      await this.createPlatformSubscription(tenantId, tenant.platform_customer_id, newPlan);
      return;
    }

    await supabaseAdmin
      .from('tenants')
      .update({
        platform_plan: newPlan,
        max_clients: newPlanDetails.maxClients,
      })
      .eq('id', tenantId);
  }

  static async cancelPlatformSubscription(tenantId: string): Promise<void> {
    const { supabaseAdmin } = await import('@/lib/database');

    const { data: tenant } = await supabaseAdmin
      .from('tenants')
      .select('platform_subscription_id')
      .eq('id', tenantId)
      .single();

    if (!tenant?.platform_subscription_id) return;

    await stripe.subscriptions.update(tenant.platform_subscription_id, {
      cancel_at_period_end: true,
    });

    await supabaseAdmin
      .from('platform_subscriptions')
      .update({ cancel_at_period_end: true })
      .eq('tenant_id', tenantId)
      .eq('stripe_subscription_id', tenant.platform_subscription_id);
  }

  static async getPlatformSubscription(tenantId: string) {
    const { supabaseAdmin } = await import('@/lib/database');

    const { data } = await supabaseAdmin
      .from('platform_subscriptions')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return data;
  }

  // ============================================================
  // WEBHOOK HELPERS — Sync Stripe events to local state
  // ============================================================

  static async syncSubscriptionStatus(stripeSubscriptionId: string): Promise<void> {
    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    const tenantId = subscription.metadata.tenant_id;
    if (!tenantId) return;

    const { supabaseAdmin } = await import('@/lib/database');

    const statusMap: Record<string, string> = {
      trialing: 'trialing',
      active: 'active',
      past_due: 'past_due',
      canceled: 'cancelled',
      unpaid: 'unpaid',
    };

    const localStatus = statusMap[subscription.status] || 'active';

    // Update platform_subscriptions table
    await supabaseAdmin
      .from('platform_subscriptions')
      .update({
        status: localStatus,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
      })
      .eq('stripe_subscription_id', stripeSubscriptionId);

    // Update tenant
    await supabaseAdmin
      .from('tenants')
      .update({
        platform_subscription_status: localStatus,
        status: localStatus === 'cancelled' || localStatus === 'unpaid' ? 'suspended' : 'active',
      })
      .eq('id', tenantId);
  }
}

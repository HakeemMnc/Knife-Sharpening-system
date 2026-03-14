import Stripe from 'stripe';
import { B2BDatabaseService } from './b2b-database';
import type { Tenant, ServiceContract } from '@/types/b2b';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export class StripeConnectService {
  // ============================================================
  // EXPRESS CONNECT — Account Onboarding
  // ============================================================

  static async createConnectAccount(tenant: Tenant): Promise<{ accountId: string; onboardingUrl: string }> {
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'AU',
      email: tenant.business_email || undefined,
      business_type: 'company',
      company: {
        name: tenant.business_name || tenant.name,
        tax_id: tenant.abn || undefined,
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        tenant_id: tenant.id,
        tenant_slug: tenant.slug,
      },
    });

    // Save the account ID to the tenant
    await B2BDatabaseService.updateTenant(tenant.id, {
      stripe_account_id: account.id,
    });

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${APP_URL}/operator?tab=settings&stripe=refresh`,
      return_url: `${APP_URL}/api/b2b/stripe/connect/callback?account_id=${account.id}&tenant_id=${tenant.id}`,
      type: 'account_onboarding',
    });

    return {
      accountId: account.id,
      onboardingUrl: accountLink.url,
    };
  }

  static async createAccountLink(accountId: string, tenantId: string): Promise<string> {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${APP_URL}/operator?tab=settings&stripe=refresh`,
      return_url: `${APP_URL}/api/b2b/stripe/connect/callback?account_id=${accountId}&tenant_id=${tenantId}`,
      type: 'account_onboarding',
    });
    return accountLink.url;
  }

  static async getAccountStatus(accountId: string): Promise<{
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    detailsSubmitted: boolean;
    onboardingComplete: boolean;
  }> {
    const account = await stripe.accounts.retrieve(accountId);
    return {
      chargesEnabled: account.charges_enabled ?? false,
      payoutsEnabled: account.payouts_enabled ?? false,
      detailsSubmitted: account.details_submitted ?? false,
      onboardingComplete: (account.charges_enabled && account.details_submitted) ?? false,
    };
  }

  static async getExpressDashboardLink(accountId: string): Promise<string> {
    const loginLink = await stripe.accounts.createLoginLink(accountId);
    return loginLink.url;
  }

  // ============================================================
  // METERED BILLING — Subscriptions & Usage
  // ============================================================

  static async createStripeCustomerForClient(
    clientEmail: string,
    clientName: string,
    connectedAccountId: string
  ): Promise<string> {
    const customer = await stripe.customers.create(
      {
        email: clientEmail,
        name: clientName,
      },
      { stripeAccount: connectedAccountId }
    );
    return customer.id;
  }

  static async createMeteredPrice(
    contract: ServiceContract,
    connectedAccountId: string
  ): Promise<string> {
    const product = await stripe.products.create(
      {
        name: `Knife Sharpening Service — ${contract.frequency}`,
        metadata: {
          contract_id: contract.id,
          tenant_id: contract.tenant_id,
        },
      },
      { stripeAccount: connectedAccountId }
    );

    const price = await stripe.prices.create(
      {
        product: product.id,
        currency: 'aud',
        unit_amount: Math.round(contract.price_per_visit * 100),
        recurring: {
          interval: 'month',
          usage_type: 'metered',
        },
        metadata: {
          contract_id: contract.id,
        },
      },
      { stripeAccount: connectedAccountId }
    );

    return price.id;
  }

  static async createMeteredSubscription(
    contract: ServiceContract,
    stripeCustomerId: string,
    connectedAccountId: string
  ): Promise<{ subscriptionId: string; priceId: string }> {
    // Create the metered price on the connected account
    const priceId = await this.createMeteredPrice(contract, connectedAccountId);

    const subscription = await stripe.subscriptions.create(
      {
        customer: stripeCustomerId,
        items: [{ price: priceId }],
        metadata: {
          contract_id: contract.id,
          tenant_id: contract.tenant_id,
          client_id: contract.client_id,
        },
      },
      { stripeAccount: connectedAccountId }
    );

    // Save subscription details to the contract
    await B2BDatabaseService.updateContract(contract.id, {
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
    });

    return {
      subscriptionId: subscription.id,
      priceId,
    };
  }

  static async reportUsage(
    subscriptionId: string,
    quantity: number,
    connectedAccountId: string,
    visitId: string
  ): Promise<string> {
    // Get the subscription to find the subscription item
    const subscription = await stripe.subscriptions.retrieve(
      subscriptionId,
      { stripeAccount: connectedAccountId }
    );

    const subscriptionItemId = subscription.items.data[0]?.id;
    if (!subscriptionItemId) {
      throw new Error('No subscription item found for usage reporting');
    }

    const usageRecord = await stripe.subscriptionItems.createUsageRecord(
      subscriptionItemId,
      {
        quantity,
        timestamp: Math.floor(Date.now() / 1000),
        action: 'increment',
      },
      { stripeAccount: connectedAccountId }
    );

    // Mark the visit as billed
    await B2BDatabaseService.updateVisit(visitId, {
      billed: true,
      stripe_usage_record_id: usageRecord.id,
    });

    return usageRecord.id;
  }

  // ============================================================
  // INVOICES
  // ============================================================

  static async listInvoices(
    stripeCustomerId: string,
    connectedAccountId: string,
    limit = 12
  ): Promise<Stripe.Invoice[]> {
    const invoices = await stripe.invoices.list(
      {
        customer: stripeCustomerId,
        limit,
      },
      { stripeAccount: connectedAccountId }
    );
    return invoices.data;
  }

  static async getInvoice(
    invoiceId: string,
    connectedAccountId: string
  ): Promise<Stripe.Invoice> {
    return stripe.invoices.retrieve(
      invoiceId,
      { stripeAccount: connectedAccountId }
    );
  }

  // ============================================================
  // SUBSCRIPTION LIFECYCLE
  // ============================================================

  static async pauseSubscription(subscriptionId: string, connectedAccountId: string): Promise<void> {
    await stripe.subscriptions.update(
      subscriptionId,
      { pause_collection: { behavior: 'void' } },
      { stripeAccount: connectedAccountId }
    );
  }

  static async resumeSubscription(subscriptionId: string, connectedAccountId: string): Promise<void> {
    await stripe.subscriptions.update(
      subscriptionId,
      { pause_collection: '' as Stripe.Emptyable<Stripe.SubscriptionUpdateParams.PauseCollection> },
      { stripeAccount: connectedAccountId }
    );
  }

  static async cancelSubscription(subscriptionId: string, connectedAccountId: string): Promise<void> {
    await stripe.subscriptions.cancel(
      subscriptionId,
      { stripeAccount: connectedAccountId }
    );
  }

  // ============================================================
  // WEBHOOK HELPERS
  // ============================================================

  static constructWebhookEvent(
    body: string,
    signature: string,
    secret: string
  ): Stripe.Event {
    return stripe.webhooks.constructEvent(body, signature, secret);
  }

  static async handleAccountUpdated(account: Stripe.Account): Promise<void> {
    const tenantId = account.metadata?.tenant_id;
    if (!tenantId) return;

    const onboardingComplete = (account.charges_enabled && account.details_submitted) ?? false;

    await B2BDatabaseService.updateTenant(tenantId, {
      stripe_onboarding_complete: onboardingComplete,
    });
  }
}

-- Stage 6: SaaS Multi-Tenancy
-- Adds platform-level subscription management for operator SaaS billing
-- Extends tenant isolation and enables self-signup flow

-- ============================================================
-- EXTEND TENANTS — Add platform subscription fields
-- ============================================================
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS platform_plan VARCHAR(20) DEFAULT 'free' CHECK (platform_plan IN ('free', 'pro', 'enterprise')),
  ADD COLUMN IF NOT EXISTS platform_subscription_status VARCHAR(20) DEFAULT 'trialing' CHECK (platform_subscription_status IN ('trialing', 'active', 'past_due', 'cancelled', 'unpaid')),
  ADD COLUMN IF NOT EXISTS platform_customer_id VARCHAR(255),  -- Stripe customer ID for platform billing
  ADD COLUMN IF NOT EXISTS platform_subscription_id VARCHAR(255),  -- Stripe subscription ID for platform billing
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS max_clients INTEGER DEFAULT 5;  -- Free tier: 5 clients

CREATE INDEX IF NOT EXISTS idx_tenants_platform_plan ON tenants(platform_plan);
CREATE INDEX IF NOT EXISTS idx_tenants_platform_status ON tenants(platform_subscription_status);

-- ============================================================
-- PLATFORM SUBSCRIPTIONS — Detailed subscription tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS platform_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),

  plan VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  status VARCHAR(20) NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'past_due', 'cancelled', 'unpaid')),

  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_subs_tenant ON platform_subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_platform_subs_stripe ON platform_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_platform_subs_status ON platform_subscriptions(status);

-- ============================================================
-- RLS POLICIES — Platform Subscriptions
-- ============================================================
ALTER TABLE platform_subscriptions ENABLE ROW LEVEL SECURITY;

-- Tenant owners can read their own subscription
CREATE POLICY platform_subs_tenant_read ON platform_subscriptions
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT t.id FROM tenants t
      JOIN profiles p ON p.tenant_id = t.id
      WHERE p.id = auth.uid()
    )
  );

-- Platform admins can read all subscriptions
CREATE POLICY platform_subs_admin_read ON platform_subscriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'platform_admin'
    )
  );

-- Only service role can insert/update (server-side only)
CREATE POLICY platform_subs_service_write ON platform_subscriptions
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- TENANT ISOLATION HARDENING — Block suspended tenants
-- ============================================================

-- Prevent suspended/cancelled tenants from creating new clients
CREATE POLICY clients_active_tenant_insert ON clients
  FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT id FROM tenants
      WHERE status IN ('onboarding', 'active')
      AND platform_subscription_status IN ('trialing', 'active')
    )
  );

-- Prevent suspended/cancelled tenants from creating new contracts
CREATE POLICY contracts_active_tenant_insert ON service_contracts
  FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT id FROM tenants
      WHERE status IN ('onboarding', 'active')
      AND platform_subscription_status IN ('trialing', 'active')
    )
  );

-- Prevent suspended/cancelled tenants from creating new visits
CREATE POLICY visits_active_tenant_insert ON service_visits
  FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT id FROM tenants
      WHERE status IN ('onboarding', 'active')
      AND platform_subscription_status IN ('trialing', 'active')
    )
  );

-- ============================================================
-- UPDATED_AT TRIGGER for platform_subscriptions
-- ============================================================
CREATE TRIGGER update_platform_subscriptions_updated_at
  BEFORE UPDATE ON platform_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

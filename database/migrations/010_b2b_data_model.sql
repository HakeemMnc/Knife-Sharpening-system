-- Stage 1: B2B Data Model
-- Adds multi-tenant tables for the B2B SaaS transformation:
-- tenants, clients, service_contracts, service_zones, service_visits

-- ============================================================
-- TENANTS — Each knife-sharpening operator is a tenant
-- ============================================================
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL, -- URL-friendly identifier
  owner_id UUID NOT NULL REFERENCES auth.users(id),

  -- Business details
  business_name VARCHAR(255),
  business_email VARCHAR(255),
  business_phone VARCHAR(50),
  abn VARCHAR(20), -- Australian Business Number (or local equivalent)

  -- Stripe Express Connect
  stripe_account_id VARCHAR(255), -- Stripe Connect account ID
  stripe_onboarding_complete BOOLEAN DEFAULT FALSE,

  -- Settings
  timezone VARCHAR(50) DEFAULT 'Australia/Sydney',
  currency VARCHAR(3) DEFAULT 'AUD',
  default_service_radius_km INTEGER DEFAULT 50,

  -- Status
  status VARCHAR(20) DEFAULT 'onboarding' CHECK (status IN ('onboarding', 'active', 'suspended', 'cancelled')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenants_owner ON tenants(owner_id);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);

-- ============================================================
-- CLIENTS — Commercial businesses served by a tenant
-- (restaurants, butchers, hotels, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Business info
  business_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),

  -- Address
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  suburb VARCHAR(100),
  state VARCHAR(50),
  postal_code VARCHAR(10),

  -- Geolocation for route optimization
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),

  -- Service preferences
  preferred_day VARCHAR(10) CHECK (preferred_day IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  preferred_time_window VARCHAR(20) CHECK (preferred_time_window IN ('morning', 'midday', 'afternoon')),
  access_instructions TEXT, -- e.g., "Ring bell at back door"

  -- Billing
  billing_email VARCHAR(255),
  payment_terms INTEGER DEFAULT 30, -- Days until payment due

  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('prospect', 'active', 'paused', 'churned')),
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_tenant ON clients(tenant_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_clients_postal ON clients(tenant_id, postal_code);

-- ============================================================
-- SERVICE_CONTRACTS — Recurring contracts between tenant & client
-- ============================================================
CREATE TABLE IF NOT EXISTS service_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- Contract terms
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('weekly', 'fortnightly', 'monthly', 'on_demand')),
  day_of_week VARCHAR(10) CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),

  -- Pricing (per visit)
  price_per_visit DECIMAL(10, 2) NOT NULL,
  estimated_knives_per_visit INTEGER DEFAULT 10,

  -- Stripe billing
  stripe_subscription_id VARCHAR(255), -- Stripe metered subscription
  stripe_price_id VARCHAR(255), -- Stripe price for usage reporting

  -- Contract dates
  start_date DATE NOT NULL,
  end_date DATE, -- NULL = ongoing

  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'cancelled', 'expired')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contracts_tenant ON service_contracts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contracts_client ON service_contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON service_contracts(tenant_id, status);

-- ============================================================
-- SERVICE_ZONES — Geographic zones for route planning
-- ============================================================
CREATE TABLE IF NOT EXISTS service_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  name VARCHAR(100) NOT NULL, -- e.g., "Byron Bay North", "Ballina CBD"
  color VARCHAR(7), -- Hex color for map display, e.g., "#FF5733"

  -- Zone boundaries (simplified as center + radius for MVP)
  center_latitude DECIMAL(10, 7),
  center_longitude DECIMAL(10, 7),
  radius_km DECIMAL(5, 1),

  -- Scheduling
  service_day VARCHAR(10) CHECK (service_day IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),

  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zones_tenant ON service_zones(tenant_id);

-- ============================================================
-- SERVICE_VISITS — Individual scheduled/completed visits
-- ============================================================
CREATE TABLE IF NOT EXISTS service_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES service_contracts(id) ON DELETE SET NULL,
  zone_id UUID REFERENCES service_zones(id) ON DELETE SET NULL,

  -- Scheduling
  scheduled_date DATE NOT NULL,
  scheduled_time_window VARCHAR(20) CHECK (scheduled_time_window IN ('morning', 'midday', 'afternoon')),
  route_order INTEGER, -- Position in the daily route (1, 2, 3...)

  -- Completion
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'en_route', 'in_progress', 'completed', 'skipped', 'cancelled')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Service details
  knives_sharpened INTEGER,
  other_items_sharpened INTEGER DEFAULT 0,
  notes TEXT,

  -- Billing
  visit_amount DECIMAL(10, 2), -- Actual amount for this visit
  billed BOOLEAN DEFAULT FALSE,
  stripe_usage_record_id VARCHAR(255), -- Stripe usage record for metered billing

  -- SMS
  reminder_sent BOOLEAN DEFAULT FALSE,
  completion_sent BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visits_tenant_date ON service_visits(tenant_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_visits_client ON service_visits(client_id);
CREATE INDEX IF NOT EXISTS idx_visits_contract ON service_visits(contract_id);
CREATE INDEX IF NOT EXISTS idx_visits_status ON service_visits(tenant_id, status, scheduled_date);

-- ============================================================
-- ADD tenant_id FK to profiles (forward reference from migration 009)
-- ============================================================
ALTER TABLE profiles
  ADD CONSTRAINT fk_profiles_tenant
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL;

-- ============================================================
-- ROW-LEVEL SECURITY for new tables
-- ============================================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_visits ENABLE ROW LEVEL SECURITY;

-- Tenants: owners can manage their own tenant
CREATE POLICY tenants_owner_all ON tenants
  FOR ALL USING (owner_id = auth.uid());

-- Tenants: platform admins can see all
CREATE POLICY tenants_platform_admin ON tenants
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'platform_admin')
  );

-- Clients: tenant members can manage clients in their tenant
CREATE POLICY clients_tenant_access ON clients
  FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- Contracts: tenant members can manage contracts in their tenant
CREATE POLICY contracts_tenant_access ON service_contracts
  FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- Zones: tenant members can manage zones in their tenant
CREATE POLICY zones_tenant_access ON service_zones
  FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- Visits: tenant members can manage visits in their tenant
CREATE POLICY visits_tenant_access ON service_visits
  FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- Platform admins can access everything
CREATE POLICY clients_platform_admin ON clients
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'platform_admin')
  );

CREATE POLICY contracts_platform_admin ON service_contracts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'platform_admin')
  );

CREATE POLICY zones_platform_admin ON service_zones
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'platform_admin')
  );

CREATE POLICY visits_platform_admin ON service_visits
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'platform_admin')
  );

-- ============================================================
-- UPDATED_AT trigger function (reusable)
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all new tables
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON service_contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_zones_updated_at BEFORE UPDATE ON service_zones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON service_visits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

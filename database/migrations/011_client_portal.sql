-- Stage 4: Client Portal
-- Adds client_id to profiles (links auth users to client records)
-- Adds stripe_customer_id to clients (for invoice retrieval)
-- Adds RLS policies for client self-service access

-- Add client_id to profiles (for client user accounts)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_client ON profiles(client_id);

-- Add stripe_customer_id to clients (for Stripe invoice lookups)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);

-- RLS: Allow clients to read their own client record
CREATE POLICY clients_self_read ON clients
  FOR SELECT USING (
    id IN (SELECT client_id FROM profiles WHERE id = auth.uid())
  );

-- RLS: Allow clients to update limited fields on their own record
CREATE POLICY clients_self_update ON clients
  FOR UPDATE USING (
    id IN (SELECT client_id FROM profiles WHERE id = auth.uid())
  );

-- RLS: Allow clients to read their own visits
CREATE POLICY visits_client_read ON service_visits
  FOR SELECT USING (
    client_id IN (SELECT client_id FROM profiles WHERE id = auth.uid())
  );

-- RLS: Allow clients to read their own contracts
CREATE POLICY contracts_client_read ON service_contracts
  FOR SELECT USING (
    client_id IN (SELECT client_id FROM profiles WHERE id = auth.uid())
  );

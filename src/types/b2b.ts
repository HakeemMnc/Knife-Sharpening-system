// B2B SaaS Types — Stage 1 Data Model
// These types mirror the database schema from migration 010_b2b_data_model.sql

// ============================================================
// Tenants
// ============================================================
export type TenantStatus = 'onboarding' | 'active' | 'suspended' | 'cancelled';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  owner_id: string;

  business_name: string | null;
  business_email: string | null;
  business_phone: string | null;
  abn: string | null;

  stripe_account_id: string | null;
  stripe_onboarding_complete: boolean;

  timezone: string;
  currency: string;
  default_service_radius_km: number;

  status: TenantStatus;

  created_at: string;
  updated_at: string;
}

export type TenantInsert = Omit<Tenant, 'id' | 'created_at' | 'updated_at' | 'stripe_account_id' | 'stripe_onboarding_complete'> & {
  stripe_account_id?: string;
  stripe_onboarding_complete?: boolean;
};

// ============================================================
// Clients
// ============================================================
export type ClientStatus = 'prospect' | 'active' | 'paused' | 'churned';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type TimeWindow = 'morning' | 'midday' | 'afternoon';

export interface Client {
  id: string;
  tenant_id: string;

  business_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;

  address_line1: string | null;
  address_line2: string | null;
  suburb: string | null;
  state: string | null;
  postal_code: string | null;

  latitude: number | null;
  longitude: number | null;

  preferred_day: DayOfWeek | null;
  preferred_time_window: TimeWindow | null;
  access_instructions: string | null;

  billing_email: string | null;
  payment_terms: number;

  status: ClientStatus;
  notes: string | null;

  created_at: string;
  updated_at: string;
}

export type ClientInsert = Omit<Client, 'id' | 'created_at' | 'updated_at'>;

// ============================================================
// Service Contracts
// ============================================================
export type ContractFrequency = 'weekly' | 'fortnightly' | 'monthly' | 'on_demand';
export type ContractStatus = 'draft' | 'active' | 'paused' | 'cancelled' | 'expired';

export interface ServiceContract {
  id: string;
  tenant_id: string;
  client_id: string;

  frequency: ContractFrequency;
  day_of_week: DayOfWeek | null;

  price_per_visit: number;
  estimated_knives_per_visit: number;

  stripe_subscription_id: string | null;
  stripe_price_id: string | null;

  start_date: string;
  end_date: string | null;

  status: ContractStatus;

  created_at: string;
  updated_at: string;
}

export type ServiceContractInsert = Omit<ServiceContract, 'id' | 'created_at' | 'updated_at' | 'stripe_subscription_id' | 'stripe_price_id'> & {
  stripe_subscription_id?: string;
  stripe_price_id?: string;
};

// ============================================================
// Service Zones
// ============================================================
export interface ServiceZone {
  id: string;
  tenant_id: string;

  name: string;
  color: string | null;

  center_latitude: number | null;
  center_longitude: number | null;
  radius_km: number | null;

  service_day: DayOfWeek | null;
  is_active: boolean;

  created_at: string;
  updated_at: string;
}

export type ServiceZoneInsert = Omit<ServiceZone, 'id' | 'created_at' | 'updated_at'>;

// ============================================================
// Service Visits
// ============================================================
export type VisitStatus = 'scheduled' | 'en_route' | 'in_progress' | 'completed' | 'skipped' | 'cancelled';

export interface ServiceVisit {
  id: string;
  tenant_id: string;
  client_id: string;
  contract_id: string | null;
  zone_id: string | null;

  scheduled_date: string;
  scheduled_time_window: TimeWindow | null;
  route_order: number | null;

  status: VisitStatus;
  started_at: string | null;
  completed_at: string | null;

  knives_sharpened: number | null;
  other_items_sharpened: number;
  notes: string | null;

  visit_amount: number | null;
  billed: boolean;
  stripe_usage_record_id: string | null;

  reminder_sent: boolean;
  completion_sent: boolean;

  created_at: string;
  updated_at: string;
}

export type ServiceVisitInsert = Omit<ServiceVisit, 'id' | 'created_at' | 'updated_at' | 'stripe_usage_record_id'> & {
  stripe_usage_record_id?: string;
};

// ============================================================
// Joined types (for API responses with related data)
// ============================================================
export interface ClientWithContract extends Client {
  active_contract: ServiceContract | null;
}

export interface VisitWithClient extends ServiceVisit {
  client: Pick<Client, 'id' | 'business_name' | 'contact_name' | 'phone' | 'address_line1' | 'suburb' | 'latitude' | 'longitude'>;
}

export interface TenantDashboardStats {
  total_clients: number;
  active_contracts: number;
  visits_this_week: number;
  visits_completed_this_week: number;
  revenue_this_month: number;
}

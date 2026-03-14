import { supabaseAdmin } from './database';
import type {
  Tenant, TenantInsert,
  Client, ClientInsert, ClientStatus,
  ServiceContract, ServiceContractInsert, ContractStatus,
  ServiceZone, ServiceZoneInsert,
  ServiceVisit, ServiceVisitInsert, VisitStatus,
  VisitWithClient,
} from '@/types/b2b';

// B2B Database Service — CRUD operations for multi-tenant tables
// Follows the same static-method pattern as DatabaseService in database.ts

export class B2BDatabaseService {
  // ============================================================
  // TENANTS
  // ============================================================

  static async createTenant(data: TenantInsert): Promise<Tenant> {
    const { data: tenant, error } = await supabaseAdmin
      .from('tenants')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return tenant;
  }

  static async getTenant(id: string): Promise<Tenant | null> {
    const { data, error } = await supabaseAdmin
      .from('tenants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  static async getTenantBySlug(slug: string): Promise<Tenant | null> {
    const { data, error } = await supabaseAdmin
      .from('tenants')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  static async getTenantByOwnerId(ownerId: string): Promise<Tenant | null> {
    const { data, error } = await supabaseAdmin
      .from('tenants')
      .select('*')
      .eq('owner_id', ownerId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  static async updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant> {
    const { data, error } = await supabaseAdmin
      .from('tenants')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ============================================================
  // CLIENTS
  // ============================================================

  static async createClient(data: ClientInsert): Promise<Client> {
    const { data: client, error } = await supabaseAdmin
      .from('clients')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return client;
  }

  static async getClient(id: string): Promise<Client | null> {
    const { data, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  static async getClientsByTenant(tenantId: string, status?: ClientStatus): Promise<Client[]> {
    let query = supabaseAdmin
      .from('clients')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('business_name');

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async updateClient(id: string, updates: Partial<Client>): Promise<Client> {
    const { data, error } = await supabaseAdmin
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteClient(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ============================================================
  // SERVICE CONTRACTS
  // ============================================================

  static async createContract(data: ServiceContractInsert): Promise<ServiceContract> {
    const { data: contract, error } = await supabaseAdmin
      .from('service_contracts')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return contract;
  }

  static async getContract(id: string): Promise<ServiceContract | null> {
    const { data, error } = await supabaseAdmin
      .from('service_contracts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  static async getContractsByTenant(tenantId: string, status?: ContractStatus): Promise<ServiceContract[]> {
    let query = supabaseAdmin
      .from('service_contracts')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async getContractsByClient(clientId: string): Promise<ServiceContract[]> {
    const { data, error } = await supabaseAdmin
      .from('service_contracts')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async updateContract(id: string, updates: Partial<ServiceContract>): Promise<ServiceContract> {
    const { data, error } = await supabaseAdmin
      .from('service_contracts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ============================================================
  // SERVICE ZONES
  // ============================================================

  static async createZone(data: ServiceZoneInsert): Promise<ServiceZone> {
    const { data: zone, error } = await supabaseAdmin
      .from('service_zones')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return zone;
  }

  static async getZonesByTenant(tenantId: string): Promise<ServiceZone[]> {
    const { data, error } = await supabaseAdmin
      .from('service_zones')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  static async updateZone(id: string, updates: Partial<ServiceZone>): Promise<ServiceZone> {
    const { data, error } = await supabaseAdmin
      .from('service_zones')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteZone(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('service_zones')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ============================================================
  // SERVICE VISITS
  // ============================================================

  static async createVisit(data: ServiceVisitInsert): Promise<ServiceVisit> {
    const { data: visit, error } = await supabaseAdmin
      .from('service_visits')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return visit;
  }

  static async createVisitsBatch(visits: ServiceVisitInsert[]): Promise<ServiceVisit[]> {
    const { data, error } = await supabaseAdmin
      .from('service_visits')
      .insert(visits)
      .select();

    if (error) throw error;
    return data || [];
  }

  static async getVisit(id: string): Promise<ServiceVisit | null> {
    const { data, error } = await supabaseAdmin
      .from('service_visits')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  static async getVisitsByDate(tenantId: string, date: string): Promise<VisitWithClient[]> {
    const { data, error } = await supabaseAdmin
      .from('service_visits')
      .select(`
        *,
        client:clients(id, business_name, contact_name, phone, address_line1, suburb, latitude, longitude)
      `)
      .eq('tenant_id', tenantId)
      .eq('scheduled_date', date)
      .order('route_order', { ascending: true, nullsFirst: false });

    if (error) throw error;
    return (data || []) as unknown as VisitWithClient[];
  }

  static async getVisitsByClient(clientId: string, limit = 20): Promise<ServiceVisit[]> {
    const { data, error } = await supabaseAdmin
      .from('service_visits')
      .select('*')
      .eq('client_id', clientId)
      .order('scheduled_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  static async getVisitsByDateRange(tenantId: string, startDate: string, endDate: string): Promise<ServiceVisit[]> {
    const { data, error } = await supabaseAdmin
      .from('service_visits')
      .select('*')
      .eq('tenant_id', tenantId)
      .gte('scheduled_date', startDate)
      .lte('scheduled_date', endDate)
      .order('scheduled_date')
      .order('route_order', { ascending: true, nullsFirst: false });

    if (error) throw error;
    return data || [];
  }

  static async updateVisit(id: string, updates: Partial<ServiceVisit>): Promise<ServiceVisit> {
    const { data, error } = await supabaseAdmin
      .from('service_visits')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateVisitStatus(id: string, status: VisitStatus): Promise<ServiceVisit> {
    const updates: Partial<ServiceVisit> = { status };

    if (status === 'in_progress') {
      updates.started_at = new Date().toISOString();
    } else if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    return this.updateVisit(id, updates);
  }

  // ============================================================
  // CLIENT PORTAL
  // ============================================================

  static async getClientByEmail(email: string, tenantId: string): Promise<Client | null> {
    const { data, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('email', email)
      .eq('tenant_id', tenantId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  static async getClientUpcomingVisits(clientId: string, limit = 10): Promise<ServiceVisit[]> {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabaseAdmin
      .from('service_visits')
      .select('*')
      .eq('client_id', clientId)
      .gte('scheduled_date', today)
      .in('status', ['scheduled', 'en_route', 'in_progress'])
      .order('scheduled_date')
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  static async getClientVisitHistory(clientId: string, limit = 20, offset = 0): Promise<ServiceVisit[]> {
    const { data, error } = await supabaseAdmin
      .from('service_visits')
      .select('*')
      .eq('client_id', clientId)
      .in('status', ['completed', 'skipped', 'cancelled'])
      .order('scheduled_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  }

  static async getClientActiveContract(clientId: string): Promise<ServiceContract | null> {
    const { data, error } = await supabaseAdmin
      .from('service_contracts')
      .select('*')
      .eq('client_id', clientId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  static async getClientPortalStats(clientId: string): Promise<{
    upcomingVisits: number;
    completedVisits: number;
    totalSpent: number;
  }> {
    const today = new Date().toISOString().split('T')[0];

    const [upcoming, completed] = await Promise.all([
      supabaseAdmin
        .from('service_visits')
        .select('id', { count: 'exact', head: true })
        .eq('client_id', clientId)
        .gte('scheduled_date', today)
        .in('status', ['scheduled', 'en_route', 'in_progress']),
      supabaseAdmin
        .from('service_visits')
        .select('visit_amount', { count: 'exact' })
        .eq('client_id', clientId)
        .eq('status', 'completed'),
    ]);

    const totalSpent = (completed.data || []).reduce(
      (sum, v) => sum + (v.visit_amount || 0),
      0
    );

    return {
      upcomingVisits: upcoming.count || 0,
      completedVisits: completed.count || 0,
      totalSpent,
    };
  }

  // ============================================================
  // DASHBOARD / ANALYTICS
  // ============================================================

  static async getUnbilledVisits(tenantId: string): Promise<ServiceVisit[]> {
    const { data, error } = await supabaseAdmin
      .from('service_visits')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('status', 'completed')
      .eq('billed', false)
      .order('completed_at');

    if (error) throw error;
    return data || [];
  }

  static async getUpcomingVisits(tenantId: string, days = 7): Promise<VisitWithClient[]> {
    const today = new Date().toISOString().split('T')[0];
    const future = new Date(Date.now() + days * 86400000).toISOString().split('T')[0];

    const { data, error } = await supabaseAdmin
      .from('service_visits')
      .select(`
        *,
        client:clients(id, business_name, contact_name, phone, address_line1, suburb, latitude, longitude)
      `)
      .eq('tenant_id', tenantId)
      .in('status', ['scheduled', 'en_route'])
      .gte('scheduled_date', today)
      .lte('scheduled_date', future)
      .order('scheduled_date')
      .order('route_order', { ascending: true, nullsFirst: false });

    if (error) throw error;
    return (data || []) as unknown as VisitWithClient[];
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import type { PlatformAnalytics, TenantSummary } from '@/types/b2b';

export async function GET(request: NextRequest) {
  const result = await requireRole(request, ['platform_admin']);
  if (result instanceof NextResponse) return result;

  try {
    const { supabaseAdmin } = await import('@/lib/database');
    const url = new URL(request.url);
    const view = url.searchParams.get('view') || 'analytics';

    if (view === 'tenants') {
      // List all tenants with summary stats
      const { data: tenants } = await supabaseAdmin
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });

      if (!tenants) {
        return NextResponse.json({ success: true, data: [] });
      }

      // Get client counts per tenant
      const { data: clientCounts } = await supabaseAdmin
        .from('clients')
        .select('tenant_id');

      // Get visit counts per tenant
      const { data: visitCounts } = await supabaseAdmin
        .from('service_visits')
        .select('tenant_id, updated_at');

      const tenantSummaries: TenantSummary[] = tenants.map(tenant => {
        const clients = clientCounts?.filter(c => c.tenant_id === tenant.id) || [];
        const visits = visitCounts?.filter(v => v.tenant_id === tenant.id) || [];
        const lastVisit = visits.sort((a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )[0];

        return {
          ...tenant,
          client_count: clients.length,
          visit_count: visits.length,
          last_activity: lastVisit?.updated_at || tenant.updated_at,
        };
      });

      return NextResponse.json({ success: true, data: tenantSummaries });
    }

    // Default: platform analytics
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [
      { count: totalTenants },
      { count: activeTenants },
      { count: trialingTenants },
      { count: suspendedTenants },
      { count: totalVisits },
      { count: visitsThisMonth },
      { count: signupsThisMonth },
    ] = await Promise.all([
      supabaseAdmin.from('tenants').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('tenants').select('*', { count: 'exact', head: true }).eq('platform_subscription_status', 'active'),
      supabaseAdmin.from('tenants').select('*', { count: 'exact', head: true }).eq('platform_subscription_status', 'trialing'),
      supabaseAdmin.from('tenants').select('*', { count: 'exact', head: true }).eq('status', 'suspended'),
      supabaseAdmin.from('service_visits').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('service_visits').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth),
      supabaseAdmin.from('tenants').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth),
    ]);

    // Calculate MRR from paid plans
    const { data: paidTenants } = await supabaseAdmin
      .from('tenants')
      .select('platform_plan')
      .in('platform_subscription_status', ['active', 'trialing'])
      .neq('platform_plan', 'free');

    let mrr = 0;
    if (paidTenants) {
      for (const t of paidTenants) {
        if (t.platform_plan === 'pro') mrr += 49;
        if (t.platform_plan === 'enterprise') mrr += 149;
      }
    }

    const analytics: PlatformAnalytics = {
      total_tenants: totalTenants || 0,
      active_tenants: activeTenants || 0,
      trialing_tenants: trialingTenants || 0,
      suspended_tenants: suspendedTenants || 0,
      total_visits_all_time: totalVisits || 0,
      visits_this_month: visitsThisMonth || 0,
      signups_this_month: signupsThisMonth || 0,
      mrr,
    };

    return NextResponse.json({ success: true, data: analytics });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch analytics';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

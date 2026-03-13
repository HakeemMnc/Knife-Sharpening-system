import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { B2BDatabaseService } from '@/lib/b2b-database';

export async function GET(request: NextRequest) {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) return result;

  try {
    if (result.tenant_id) {
      const tenant = await B2BDatabaseService.getTenant(result.tenant_id);
      return NextResponse.json({ success: true, data: tenant });
    }

    // If no tenant_id, check if they own a tenant
    const tenant = await B2BDatabaseService.getTenantByOwnerId(result.id);
    return NextResponse.json({ success: true, data: tenant });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch tenant';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) return result;

  try {
    const body = await request.json();

    // Generate slug from name
    const slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const tenant = await B2BDatabaseService.createTenant({
      name: body.name,
      slug,
      owner_id: result.id,
      business_name: body.business_name || null,
      business_email: body.business_email || null,
      business_phone: body.business_phone || null,
      abn: body.abn || null,
      timezone: body.timezone || 'Australia/Sydney',
      currency: body.currency || 'AUD',
      default_service_radius_km: body.default_service_radius_km || 50,
      status: 'onboarding',
    });

    // Link the user's profile to this tenant
    const { supabaseAdmin } = await import('@/lib/database');
    await supabaseAdmin
      .from('profiles')
      .update({ tenant_id: tenant.id })
      .eq('id', result.id);

    return NextResponse.json({ success: true, data: tenant }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create tenant';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

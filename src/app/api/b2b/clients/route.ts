import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { B2BDatabaseService } from '@/lib/b2b-database';
import type { ClientStatus } from '@/types/b2b';

export async function GET(request: NextRequest) {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) return result;

  if (!result.tenant_id) {
    return NextResponse.json({ error: 'No tenant associated with your account' }, { status: 400 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as ClientStatus | null;

    const clients = await B2BDatabaseService.getClientsByTenant(
      result.tenant_id,
      status || undefined
    );
    return NextResponse.json({ success: true, data: clients });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch clients';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) return result;

  if (!result.tenant_id) {
    return NextResponse.json({ error: 'No tenant associated with your account' }, { status: 400 });
  }

  try {
    const body = await request.json();

    const client = await B2BDatabaseService.createClient({
      tenant_id: result.tenant_id,
      business_name: body.business_name,
      contact_name: body.contact_name || null,
      email: body.email || null,
      phone: body.phone || null,
      address_line1: body.address_line1 || null,
      address_line2: body.address_line2 || null,
      suburb: body.suburb || null,
      state: body.state || null,
      postal_code: body.postal_code || null,
      latitude: body.latitude || null,
      longitude: body.longitude || null,
      preferred_day: body.preferred_day || null,
      preferred_time_window: body.preferred_time_window || null,
      access_instructions: body.access_instructions || null,
      billing_email: body.billing_email || null,
      payment_terms: body.payment_terms || 30,
      status: body.status || 'active',
      notes: body.notes || null,
    });

    return NextResponse.json({ success: true, data: client }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create client';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

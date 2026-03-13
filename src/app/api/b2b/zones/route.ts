import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { B2BDatabaseService } from '@/lib/b2b-database';

export async function GET(request: NextRequest) {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) return result;

  if (!result.tenant_id) {
    return NextResponse.json({ error: 'No tenant associated with your account' }, { status: 400 });
  }

  try {
    const zones = await B2BDatabaseService.getZonesByTenant(result.tenant_id);
    return NextResponse.json({ success: true, data: zones });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch zones';
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

    const zone = await B2BDatabaseService.createZone({
      tenant_id: result.tenant_id,
      name: body.name,
      color: body.color || null,
      center_latitude: body.center_latitude || null,
      center_longitude: body.center_longitude || null,
      radius_km: body.radius_km || null,
      service_day: body.service_day || null,
      is_active: body.is_active !== false,
    });

    return NextResponse.json({ success: true, data: zone }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create zone';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

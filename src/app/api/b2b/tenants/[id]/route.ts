import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { B2BDatabaseService } from '@/lib/b2b-database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) return result;

  try {
    const { id } = await params;
    const tenant = await B2BDatabaseService.getTenant(id);
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Only owner or platform admin can view
    if (tenant.owner_id !== result.id && result.role !== 'platform_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: tenant });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch tenant';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) return result;

  try {
    const { id } = await params;
    const existing = await B2BDatabaseService.getTenant(id);
    if (!existing) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    if (existing.owner_id !== result.id && result.role !== 'platform_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const tenant = await B2BDatabaseService.updateTenant(id, body);
    return NextResponse.json({ success: true, data: tenant });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update tenant';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

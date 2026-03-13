import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { B2BDatabaseService } from '@/lib/b2b-database';
import type { VisitStatus } from '@/types/b2b';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) return result;

  try {
    const { id } = await params;
    const visit = await B2BDatabaseService.getVisit(id);
    if (!visit) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
    }

    if (visit.tenant_id !== result.tenant_id && result.role !== 'platform_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: visit });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch visit';
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
    const existing = await B2BDatabaseService.getVisit(id);
    if (!existing) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
    }

    if (existing.tenant_id !== result.tenant_id && result.role !== 'platform_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // If only status is being updated, use the status update method
    if (body.status && Object.keys(body).length === 1) {
      const visit = await B2BDatabaseService.updateVisitStatus(id, body.status as VisitStatus);
      return NextResponse.json({ success: true, data: visit });
    }

    const visit = await B2BDatabaseService.updateVisit(id, body);
    return NextResponse.json({ success: true, data: visit });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update visit';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

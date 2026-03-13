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
    const contract = await B2BDatabaseService.getContract(id);
    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    if (contract.tenant_id !== result.tenant_id && result.role !== 'platform_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: contract });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch contract';
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
    const existing = await B2BDatabaseService.getContract(id);
    if (!existing) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    if (existing.tenant_id !== result.tenant_id && result.role !== 'platform_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const contract = await B2BDatabaseService.updateContract(id, body);
    return NextResponse.json({ success: true, data: contract });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update contract';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

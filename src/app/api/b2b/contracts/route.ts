import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { B2BDatabaseService } from '@/lib/b2b-database';
import type { ContractStatus } from '@/types/b2b';

export async function GET(request: NextRequest) {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) return result;

  if (!result.tenant_id) {
    return NextResponse.json({ error: 'No tenant associated with your account' }, { status: 400 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as ContractStatus | null;
    const clientId = searchParams.get('client_id');

    let contracts;
    if (clientId) {
      contracts = await B2BDatabaseService.getContractsByClient(clientId);
    } else {
      contracts = await B2BDatabaseService.getContractsByTenant(
        result.tenant_id,
        status || undefined
      );
    }

    return NextResponse.json({ success: true, data: contracts });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch contracts';
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

    const contract = await B2BDatabaseService.createContract({
      tenant_id: result.tenant_id,
      client_id: body.client_id,
      frequency: body.frequency,
      day_of_week: body.day_of_week || null,
      price_per_visit: body.price_per_visit,
      estimated_knives_per_visit: body.estimated_knives_per_visit || 10,
      start_date: body.start_date,
      end_date: body.end_date || null,
      status: body.status || 'draft',
    });

    return NextResponse.json({ success: true, data: contract }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create contract';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { B2BDatabaseService } from '@/lib/b2b-database';

// GET: Get current client's own data (for client portal)
// PATCH: Update limited profile fields
export async function GET(request: NextRequest) {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) return result;

  if (result.role !== 'client' || !result.client_id) {
    return NextResponse.json({ error: 'Client access required' }, { status: 403 });
  }

  try {
    const client = await B2BDatabaseService.getClient(result.client_id);
    if (!client) {
      return NextResponse.json({ error: 'Client record not found' }, { status: 404 });
    }

    const [contract, stats] = await Promise.all([
      B2BDatabaseService.getClientActiveContract(result.client_id),
      B2BDatabaseService.getClientPortalStats(result.client_id),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        client,
        activeContract: contract,
        stats,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch client data';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) return result;

  if (result.role !== 'client' || !result.client_id) {
    return NextResponse.json({ error: 'Client access required' }, { status: 403 });
  }

  try {
    const body = await request.json();

    // Clients can only update limited fields
    const allowedFields: Record<string, unknown> = {};
    if (body.contact_name !== undefined) allowedFields.contact_name = body.contact_name;
    if (body.phone !== undefined) allowedFields.phone = body.phone;
    if (body.email !== undefined) allowedFields.email = body.email;
    if (body.access_instructions !== undefined) allowedFields.access_instructions = body.access_instructions;
    if (body.preferred_day !== undefined) allowedFields.preferred_day = body.preferred_day;
    if (body.preferred_time_window !== undefined) allowedFields.preferred_time_window = body.preferred_time_window;

    if (Object.keys(allowedFields).length === 0) {
      return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 });
    }

    const client = await B2BDatabaseService.updateClient(result.client_id, allowedFields);
    return NextResponse.json({ success: true, data: client });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

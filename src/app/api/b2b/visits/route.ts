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
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const clientId = searchParams.get('client_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (clientId) {
      const visits = await B2BDatabaseService.getVisitsByClient(clientId);
      return NextResponse.json({ success: true, data: visits });
    }

    if (date) {
      const visits = await B2BDatabaseService.getVisitsByDate(result.tenant_id, date);
      return NextResponse.json({ success: true, data: visits });
    }

    if (startDate && endDate) {
      const visits = await B2BDatabaseService.getVisitsByDateRange(result.tenant_id, startDate, endDate);
      return NextResponse.json({ success: true, data: visits });
    }

    // Default: upcoming 7 days
    const visits = await B2BDatabaseService.getUpcomingVisits(result.tenant_id);
    return NextResponse.json({ success: true, data: visits });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch visits';
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

    // Support batch creation
    if (Array.isArray(body.visits)) {
      const visitsData = body.visits.map((v: Record<string, unknown>) => ({
        tenant_id: result.tenant_id!,
        client_id: v.client_id as string,
        contract_id: (v.contract_id as string) || null,
        zone_id: (v.zone_id as string) || null,
        scheduled_date: v.scheduled_date as string,
        scheduled_time_window: (v.scheduled_time_window as string) || null,
        route_order: (v.route_order as number) || null,
        status: 'scheduled' as const,
        started_at: null,
        completed_at: null,
        knives_sharpened: null,
        other_items_sharpened: 0,
        notes: (v.notes as string) || null,
        visit_amount: (v.visit_amount as number) || null,
        billed: false,
        reminder_sent: false,
        completion_sent: false,
      }));
      const visits = await B2BDatabaseService.createVisitsBatch(visitsData);
      return NextResponse.json({ success: true, data: visits }, { status: 201 });
    }

    // Single visit creation
    const visit = await B2BDatabaseService.createVisit({
      tenant_id: result.tenant_id,
      client_id: body.client_id,
      contract_id: body.contract_id || null,
      zone_id: body.zone_id || null,
      scheduled_date: body.scheduled_date,
      scheduled_time_window: body.scheduled_time_window || null,
      route_order: body.route_order || null,
      status: 'scheduled',
      started_at: null,
      completed_at: null,
      knives_sharpened: null,
      other_items_sharpened: 0,
      notes: body.notes || null,
      visit_amount: body.visit_amount || null,
      billed: false,
      reminder_sent: false,
      completion_sent: false,
    });

    return NextResponse.json({ success: true, data: visit }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create visit';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

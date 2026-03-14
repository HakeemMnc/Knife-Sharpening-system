import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { B2BDatabaseService } from '@/lib/b2b-database';

// GET: Client's own visits (upcoming + history)
export async function GET(request: NextRequest) {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) return result;

  if (result.role !== 'client' || !result.client_id) {
    return NextResponse.json({ error: 'Client access required' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'upcoming';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let visits;
    if (type === 'upcoming') {
      visits = await B2BDatabaseService.getClientUpcomingVisits(result.client_id, limit);
    } else {
      visits = await B2BDatabaseService.getClientVisitHistory(result.client_id, limit, offset);
    }

    return NextResponse.json({ success: true, data: visits });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch visits';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

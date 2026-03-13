import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { B2BDatabaseService } from '@/lib/b2b-database';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) return result;

  try {
    const { id } = await params;
    const body = await request.json();
    const zone = await B2BDatabaseService.updateZone(id, body);
    return NextResponse.json({ success: true, data: zone });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update zone';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) return result;

  try {
    const { id } = await params;
    await B2BDatabaseService.deleteZone(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete zone';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

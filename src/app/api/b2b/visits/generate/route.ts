import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { B2BDatabaseService } from '@/lib/b2b-database';
import { generateVisitDates, buildVisitInserts } from '@/utils/visit-generator';

// POST: Generate upcoming visits from active contracts
export async function POST(request: NextRequest) {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) return result;

  try {
    if (!result.tenant_id) {
      return NextResponse.json({ error: 'No tenant associated with this account' }, { status: 400 });
    }

    const body = await request.json();
    const weeksAhead = body.weeks_ahead || 4;

    // Get all active contracts for this tenant
    const contracts = await B2BDatabaseService.getContractsByTenant(result.tenant_id, 'active');

    if (contracts.length === 0) {
      return NextResponse.json({
        success: true,
        data: { generated: 0, message: 'No active contracts found' },
      });
    }

    // Get existing visits in the date range to avoid duplicates
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + weeksAhead * 7);

    const existingVisits = await B2BDatabaseService.getVisitsByDateRange(
      result.tenant_id,
      today.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );

    let totalGenerated = 0;
    const results: { contractId: string; clientId: string; visitsCreated: number }[] = [];

    for (const contract of contracts) {
      // Build set of existing dates for this contract
      const existingDates = new Set(
        existingVisits
          .filter(v => v.contract_id === contract.id)
          .map(v => v.scheduled_date)
      );

      const newDates = generateVisitDates(contract, weeksAhead, existingDates);

      if (newDates.length > 0) {
        const inserts = buildVisitInserts(contract, newDates);
        await B2BDatabaseService.createVisitsBatch(inserts);
        totalGenerated += newDates.length;
        results.push({
          contractId: contract.id,
          clientId: contract.client_id,
          visitsCreated: newDates.length,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        generated: totalGenerated,
        contracts: results,
        weeksAhead,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate visits';
    console.error('Visit generation error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

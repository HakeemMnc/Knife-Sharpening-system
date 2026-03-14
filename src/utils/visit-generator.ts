import type { ServiceContract, ServiceVisitInsert, DayOfWeek, ContractFrequency } from '@/types/b2b';

const DAY_MAP: Record<DayOfWeek, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

function getNextDayOfWeek(from: Date, dayOfWeek: DayOfWeek): Date {
  const targetDay = DAY_MAP[dayOfWeek];
  const result = new Date(from);
  const currentDay = result.getDay();
  const daysUntil = (targetDay - currentDay + 7) % 7;
  result.setDate(result.getDate() + (daysUntil === 0 ? 0 : daysUntil));
  return result;
}

function getIntervalDays(frequency: ContractFrequency): number {
  switch (frequency) {
    case 'weekly': return 7;
    case 'fortnightly': return 14;
    case 'monthly': return 0; // handled separately
    case 'on_demand': return 0;
  }
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function generateVisitDates(
  contract: ServiceContract,
  weeksAhead: number,
  existingDates: Set<string>
): string[] {
  if (contract.status !== 'active') return [];
  if (contract.frequency === 'on_demand') return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + weeksAhead * 7);

  // Don't go past contract end date
  if (contract.end_date) {
    const contractEnd = new Date(contract.end_date);
    if (contractEnd < endDate) {
      endDate.setTime(contractEnd.getTime());
    }
  }

  const dates: string[] = [];

  if (contract.frequency === 'monthly') {
    // For monthly, generate on the same day_of_week each month
    let current = contract.day_of_week
      ? getNextDayOfWeek(today, contract.day_of_week)
      : new Date(today);

    // If current is before today, move to next occurrence
    if (current < today) {
      current = contract.day_of_week
        ? getNextDayOfWeek(new Date(today.getTime() + 86400000), contract.day_of_week)
        : new Date(today.getTime() + 86400000);
    }

    while (current <= endDate) {
      const dateStr = formatDate(current);
      if (!existingDates.has(dateStr)) {
        dates.push(dateStr);
      }
      current = addMonths(current, 1);
      // For monthly with day_of_week, find next occurrence of that day in the new month
      if (contract.day_of_week) {
        current = getNextDayOfWeek(current, contract.day_of_week);
      }
    }
  } else {
    // Weekly or fortnightly
    const intervalDays = getIntervalDays(contract.frequency);
    const current = contract.day_of_week
      ? getNextDayOfWeek(today, contract.day_of_week)
      : new Date(today);

    if (current < today) {
      current.setDate(current.getDate() + intervalDays);
    }

    while (current <= endDate) {
      const dateStr = formatDate(current);
      if (!existingDates.has(dateStr)) {
        dates.push(dateStr);
      }
      current.setDate(current.getDate() + intervalDays);
    }
  }

  return dates;
}

export function buildVisitInserts(
  contract: ServiceContract,
  dates: string[]
): ServiceVisitInsert[] {
  return dates.map(date => ({
    tenant_id: contract.tenant_id,
    client_id: contract.client_id,
    contract_id: contract.id,
    zone_id: null,
    scheduled_date: date,
    scheduled_time_window: null,
    route_order: null,
    status: 'scheduled' as const,
    started_at: null,
    completed_at: null,
    knives_sharpened: null,
    other_items_sharpened: 0,
    notes: null,
    visit_amount: contract.price_per_visit,
    billed: false,
    reminder_sent: false,
    completion_sent: false,
  }));
}

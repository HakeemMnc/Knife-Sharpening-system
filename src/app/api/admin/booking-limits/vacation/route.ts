import { NextRequest, NextResponse } from 'next/server';
import { BookingLimitsService } from '@/lib/booking-limits';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { startDate, endDate } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Both start and end dates are required' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return NextResponse.json(
        { success: false, error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    if (start < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Cannot set vacation dates in the past' },
        { status: 400 }
      );
    }

    // Set vacation dates (make them unavailable)
    const result = await BookingLimitsService.setVacationDates(startDate, endDate);

    return NextResponse.json({
      success: true,
      data: {
        startDate,
        endDate,
        affectedDates: result.affectedDates
      }
    });
  } catch (error) {
    console.error('Error setting vacation dates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to set vacation dates' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get current vacation periods
    const vacationDates = await BookingLimitsService.getVacationDates();
    
    return NextResponse.json({
      success: true,
      data: vacationDates
    });
  } catch (error) {
    console.error('Error fetching vacation dates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vacation dates' },
      { status: 500 }
    );
  }
}
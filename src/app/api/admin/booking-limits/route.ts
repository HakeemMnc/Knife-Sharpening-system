import { NextRequest, NextResponse } from 'next/server';
import { BookingLimitsService } from '@/lib/booking-limits';

// GET /api/admin/booking-limits - Get booking limits and system settings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const summary = searchParams.get('summary') === 'true';

    if (summary) {
      // Return booking summary for dashboard
      const bookingSummary = await BookingLimitsService.getBookingSummary(14); // 14 days
      return NextResponse.json({
        success: true,
        data: bookingSummary
      });
    }

    if (startDate && endDate) {
      // Return limits for specific date range
      const limits = await BookingLimitsService.getDailyLimits(startDate, endDate);
      return NextResponse.json({
        success: true,
        data: limits
      });
    }

    // Return current system settings
    const settings = await BookingLimitsService.getAllSystemSettings();
    return NextResponse.json({
      success: true,
      data: settings
    });

  } catch (error) {
    console.error('Error fetching booking limits:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch booking limits',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/booking-limits - Update system settings or daily limits
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'updateSystemSettings':
        const { settings } = data;
        
        // Update each setting
        for (const [key, value] of Object.entries(settings)) {
          let type: 'string' | 'boolean' | 'json' | 'integer' = 'string';
          let stringValue = String(value);

          // Determine type based on the key or value
          if (key.includes('limit') || key.includes('count')) {
            type = 'integer';
          } else if (key.includes('enable') || typeof value === 'boolean') {
            type = 'boolean';
            stringValue = String(Boolean(value));
          }

          await BookingLimitsService.updateSystemSetting(key, stringValue, type);
        }

        const updatedSettings = await BookingLimitsService.getAllSystemSettings();
        return NextResponse.json({
          success: true,
          message: 'System settings updated successfully',
          data: updatedSettings
        });

      case 'updateDailyLimit':
        const { serviceDate, updates } = data;
        
        if (!serviceDate) {
          return NextResponse.json(
            { success: false, error: 'Service date is required' },
            { status: 400 }
          );
        }

        const updatedLimit = await BookingLimitsService.updateDailyLimit(serviceDate, updates);
        
        if (!updatedLimit) {
          return NextResponse.json(
            { success: false, error: 'Failed to update daily limit' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Daily limit updated successfully',
          data: updatedLimit
        });

      case 'recalculateCounts':
        const { date } = data;
        
        await BookingLimitsService.recalculateBookingCounts(date);
        
        return NextResponse.json({
          success: true,
          message: date 
            ? `Booking counts recalculated for ${date}` 
            : 'All booking counts recalculated successfully'
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action specified' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error updating booking limits:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update booking limits',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/booking-limits - Batch update multiple daily limits
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { limits } = body;

    if (!Array.isArray(limits)) {
      return NextResponse.json(
        { success: false, error: 'Limits must be an array' },
        { status: 400 }
      );
    }

    const results = [];

    for (const limit of limits) {
      const { serviceDate, ...updates } = limit;
      
      if (!serviceDate) {
        continue; // Skip invalid entries
      }

      try {
        const updatedLimit = await BookingLimitsService.updateDailyLimit(serviceDate, updates);
        if (updatedLimit) {
          results.push(updatedLimit);
        }
      } catch (error) {
        console.error(`Error updating limit for ${serviceDate}:`, error);
        // Continue processing other dates
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${results.length} daily limits`,
      data: results
    });

  } catch (error) {
    console.error('Error batch updating booking limits:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to batch update booking limits',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
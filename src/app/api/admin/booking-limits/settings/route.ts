import { NextRequest, NextResponse } from 'next/server';
import { BookingLimitsService } from '@/lib/booking-limits';

export async function GET() {
  try {
    const settings = await BookingLimitsService.getSystemSettings();
    
    return NextResponse.json({
      success: true,
      data: {
        defaultDailyCustomerLimit: settings.defaultDailyCustomerLimit,
        defaultDailyItemLimit: settings.defaultDailyItemLimit,
        enableBookingLimits: settings.enableBookingLimits
      }
    });
  } catch (error) {
    console.error('Error fetching booking limit settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, dailyLimit } = body;

    if (action === 'updateGlobalLimit') {
      if (!dailyLimit || dailyLimit < 1 || dailyLimit > 50) {
        return NextResponse.json(
          { success: false, error: 'Daily limit must be between 1 and 50' },
          { status: 400 }
        );
      }

      // Update system setting for default daily limit
      await BookingLimitsService.updateSystemSetting(
        'default_daily_customer_limit', 
        dailyLimit.toString()
      );

      // Update all future daily limits that haven't been customized
      const result = await BookingLimitsService.updateFutureDailyLimits(dailyLimit);

      return NextResponse.json({
        success: true,
        data: {
          updatedCount: result.updatedCount,
          defaultDailyLimit: dailyLimit
        }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating booking limit settings:', error);
    return NextResponse.json(
      { success: false, error: `Failed to update settings: ${errorMessage}` },
      { status: 500 }
    );
  }
}
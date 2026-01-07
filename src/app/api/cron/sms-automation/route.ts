import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import { SMSService } from '@/lib/sms-service';

// Helper to get tomorrow's date in YYYY-MM-DD format (Australia/Sydney timezone)
function getTomorrowDate(): string {
  const now = new Date();
  // Adjust for Sydney timezone (UTC+10 or UTC+11 during DST)
  const sydneyOffset = 10 * 60; // minutes
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const sydneyMinutes = utcMinutes + sydneyOffset;

  // If Sydney time has passed midnight, we're already on the next day
  const sydneyDate = new Date(now);
  sydneyDate.setUTCMinutes(sydneyDate.getUTCMinutes() + sydneyOffset);

  // Add 1 day for tomorrow
  sydneyDate.setUTCDate(sydneyDate.getUTCDate() + 1);

  return sydneyDate.toISOString().split('T')[0];
}

// Helper to get today's date in YYYY-MM-DD format (Australia/Sydney timezone)
function getTodayDate(): string {
  const now = new Date();
  const sydneyOffset = 10 * 60; // minutes

  const sydneyDate = new Date(now);
  sydneyDate.setUTCMinutes(sydneyDate.getUTCMinutes() + sydneyOffset);

  return sydneyDate.toISOString().split('T')[0];
}

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // In production, require the cron secret
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.log('Unauthorized cron request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all';

  console.log(`🕐 SMS Cron Job started - type: ${type}`);

  const results = {
    type,
    timestamp: new Date().toISOString(),
    reminder24h: { sent: 0, failed: 0, orders: [] as string[] },
    morningReminder: { sent: 0, failed: 0, orders: [] as string[] },
    followUp: { sent: 0, failed: 0, orders: [] as string[] },
    retries: { sent: 0, failed: 0, orders: [] as string[] },
  };

  try {
    // Evening job (6pm AEST) - Send 24h reminders for tomorrow's orders
    if (type === 'evening' || type === 'all') {
      const tomorrow = getTomorrowDate();
      console.log(`📅 Checking 24h reminders for service date: ${tomorrow}`);

      // Get orders needing 24h reminder
      const ordersFor24h = await DatabaseService.getOrdersNeeding24hReminder(tomorrow);
      console.log(`Found ${ordersFor24h.length} orders needing 24h reminder`);

      for (const order of ordersFor24h) {
        try {
          const success = await SMSService.send24HourReminder(order);
          if (success) {
            results.reminder24h.sent++;
            results.reminder24h.orders.push(`#${order.id} - ${order.first_name}`);
            console.log(`✅ 24h reminder sent to order #${order.id}`);
          } else {
            results.reminder24h.failed++;
            console.log(`❌ Failed to send 24h reminder to order #${order.id}`);
          }
        } catch (error) {
          results.reminder24h.failed++;
          console.error(`❌ Error sending 24h reminder to order #${order.id}:`, error);
        }
      }

      // Retry failed 24h reminders
      const failedReminders = await DatabaseService.getOrdersWithFailedSMS('reminder_24h');
      for (const order of failedReminders) {
        // Only retry if service date is still tomorrow or later
        if (order.service_date >= tomorrow) {
          try {
            const success = await SMSService.send24HourReminder(order);
            if (success) {
              results.retries.sent++;
              results.retries.orders.push(`#${order.id} (24h retry)`);
              console.log(`✅ 24h reminder retry successful for order #${order.id}`);
            } else {
              results.retries.failed++;
            }
          } catch (error) {
            results.retries.failed++;
            console.error(`❌ Error retrying 24h reminder for order #${order.id}:`, error);
          }
        }
      }
    }

    // Morning job (8am AEST) - Send morning reminders + follow-ups
    if (type === 'morning' || type === 'all') {
      const today = getTodayDate();
      console.log(`📅 Checking morning reminders for service date: ${today}`);

      // Get orders needing morning reminder
      const ordersForMorning = await DatabaseService.getOrdersNeedingMorningReminder(today);
      console.log(`Found ${ordersForMorning.length} orders needing morning reminder`);

      for (const order of ordersForMorning) {
        try {
          const success = await SMSService.sendMorningReminder(order);
          if (success) {
            results.morningReminder.sent++;
            results.morningReminder.orders.push(`#${order.id} - ${order.first_name}`);
            console.log(`✅ Morning reminder sent to order #${order.id}`);
          } else {
            results.morningReminder.failed++;
            console.log(`❌ Failed to send morning reminder to order #${order.id}`);
          }
        } catch (error) {
          results.morningReminder.failed++;
          console.error(`❌ Error sending morning reminder to order #${order.id}:`, error);
        }
      }

      // Get orders needing follow-up (delivered 48+ hours ago)
      const ordersForFollowUp = await DatabaseService.getOrdersNeedingFollowUp();
      console.log(`Found ${ordersForFollowUp.length} orders needing follow-up`);

      for (const order of ordersForFollowUp) {
        try {
          const success = await SMSService.sendFollowUpSMS(order);
          if (success) {
            // Mark order as completed after successful follow-up
            await DatabaseService.updateOrder(order.id, { status: 'completed' });
            results.followUp.sent++;
            results.followUp.orders.push(`#${order.id} - ${order.first_name}`);
            console.log(`✅ Follow-up sent and order #${order.id} marked as completed`);
          } else {
            results.followUp.failed++;
            console.log(`❌ Failed to send follow-up to order #${order.id}`);
          }
        } catch (error) {
          results.followUp.failed++;
          console.error(`❌ Error sending follow-up to order #${order.id}:`, error);
        }
      }

      // Retry failed morning reminders
      const failedMorning = await DatabaseService.getOrdersWithFailedSMS('morning_reminder');
      for (const order of failedMorning) {
        if (order.service_date === today) {
          try {
            const success = await SMSService.sendMorningReminder(order);
            if (success) {
              results.retries.sent++;
              results.retries.orders.push(`#${order.id} (morning retry)`);
            } else {
              results.retries.failed++;
            }
          } catch (error) {
            results.retries.failed++;
          }
        }
      }

      // Retry failed follow-ups
      const failedFollowUp = await DatabaseService.getOrdersWithFailedSMS('followup');
      for (const order of failedFollowUp) {
        try {
          const success = await SMSService.sendFollowUpSMS(order);
          if (success) {
            await DatabaseService.updateOrder(order.id, { status: 'completed' });
            results.retries.sent++;
            results.retries.orders.push(`#${order.id} (follow-up retry)`);
          } else {
            results.retries.failed++;
          }
        } catch (error) {
          results.retries.failed++;
        }
      }
    }

    console.log('📊 SMS Cron Job completed:', JSON.stringify(results, null, 2));

    return NextResponse.json({
      success: true,
      message: 'SMS automation completed',
      results,
    });

  } catch (error) {
    console.error('❌ SMS Cron Job error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        results,
      },
      { status: 500 }
    );
  }
}

#!/usr/bin/env node

/**
 * Script to check current booking limit system configuration and logic
 */

async function checkSystem() {
  console.log('=== BOOKING LIMIT SYSTEM ANALYSIS ===\n');
  
  try {
    // Check current system settings via API
    console.log('🔍 Checking current system settings...');
    const settingsResponse = await fetch('http://localhost:3000/api/admin/booking-limits/settings');
    const settingsResult = await settingsResponse.json();
    
    if (settingsResult.success) {
      console.log('✅ Current System Configuration:');
      console.log(`   - Default Daily Customer Limit: ${settingsResult.data.defaultDailyCustomerLimit}`);
      console.log(`   - Default Daily Item Limit: ${settingsResult.data.defaultDailyItemLimit}`);
      console.log(`   - Booking Limits Enabled: ${settingsResult.data.enableBookingLimits}\n`);
    } else {
      console.log('❌ Failed to fetch system settings\n');
    }
    
    // Check some upcoming dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(today.getDate() + 2);
    const threeDays = new Date(today);
    threeDays.setDate(today.getDate() + 3);
    
    const dates = [
      tomorrow.toISOString().split('T')[0],
      dayAfter.toISOString().split('T')[0], 
      threeDays.toISOString().split('T')[0]
    ];
    
    console.log('🔍 Checking upcoming service dates...');
    for (const date of dates) {
      try {
        const response = await fetch(`http://localhost:3000/api/admin/booking-limits?startDate=${date}&endDate=${date}`);
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
          const limit = result.data[0];
          console.log(`📅 ${date}:`);
          console.log(`   - Max Customers: ${limit.max_customers}`);
          console.log(`   - Current Customers: ${limit.current_customers}`);
          console.log(`   - Spots Remaining: ${limit.spots_remaining}`);
          console.log(`   - Status: ${limit.availability_status}`);
          console.log(`   - Limit Type: ${limit.limit_type}`);
          console.log(`   - Active: ${limit.is_active}\n`);
        } else {
          console.log(`📅 ${date}: No limit data found\n`);
        }
      } catch (error) {
        console.log(`📅 ${date}: Error checking - ${error.message}\n`);
      }
    }
    
    // Get booking summary
    console.log('🔍 Getting booking summary...');
    try {
      const summaryResponse = await fetch('http://localhost:3000/api/admin/booking-limits?summary=true');
      const summaryResult = await summaryResponse.json();
      
      if (summaryResult.success) {
        console.log('📊 BOOKING SUMMARY (Next 14 Days):');
        console.log(`   - Total Available Spots: ${summaryResult.data.totalAvailableSpots}`);
        console.log(`   - Total Booked Spots: ${summaryResult.data.totalBookedSpots}`);
        console.log(`   - Upcoming Dates Count: ${summaryResult.data.upcomingDates.length}\n`);
        
        console.log('📅 UPCOMING DATES DETAIL:');
        summaryResult.data.upcomingDates.slice(0, 7).forEach(date => {
          console.log(`   ${date.limit_date}: ${date.current_customers}/${date.max_customers} customers, ${date.spots_remaining} spots remaining (${date.availability_status})`);
        });
      }
    } catch (error) {
      console.log('❌ Error getting booking summary:', error.message);
    }
    
    console.log('\n=== SYSTEM ANALYSIS COMPLETE ===');
    
  } catch (error) {
    console.error('❌ Error analyzing system:', error.message);
    console.error('Make sure your dev server is running on localhost:3000');
  }
}

// Run if script is executed directly
if (require.main === module) {
  checkSystem().then(() => process.exit(0)).catch(console.error);
}

module.exports = { checkSystem };
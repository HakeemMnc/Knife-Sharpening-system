// Test booking limits API for early September dates
require('dotenv').config({ path: '.env.local' });

async function testBookingLimitsAPI() {
  console.log('🔍 Testing Booking Limits API for Early September Dates');
  console.log('=====================================================\n');
  
  const testDates = [
    '2025-09-08', // Monday - should be available for 2481/2479
    '2025-09-09', // Tuesday - should be available for 2482/2483/2489  
    '2025-09-10', // Wednesday - should be available for 2477/2478
    '2025-09-11', // Thursday - should be available for 2481/2479
    '2025-09-12', // Friday - should be available for 2482/2483/2489
    '2025-09-13', // Saturday - should be available for 2477/2478
  ];
  
  for (const testDate of testDates) {
    console.log(`📅 Testing date: ${testDate}`);
    
    try {
      const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/admin/booking-limits?startDate=${testDate}&endDate=${testDate}`;
      const response = await fetch(url);
      const result = await response.json();
      
      console.log(`   Status: ${response.status}`);
      console.log(`   Success: ${result.success}`);
      
      if (result.success && result.data && result.data.length > 0) {
        const dayLimit = result.data[0];
        console.log(`   📊 Data found:`, {
          availability_status: dayLimit.availability_status,
          spots_remaining: dayLimit.spots_remaining,
          current_customers: dayLimit.current_customers,
          max_customers: dayLimit.max_customers
        });
      } else {
        console.log(`   📊 No data found - would use default (7 spots, available)`);
      }
      
    } catch (error) {
      console.log(`   ❌ API Error: ${error.message}`);
      console.log(`   📊 Would use default (7 spots, available) due to error`);
    }
    
    console.log('');
  }
}

// Check current environment
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set'
});
console.log('');

testBookingLimitsAPI().catch(console.error);
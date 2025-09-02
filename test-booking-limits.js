/**
 * Test script for booking limits system
 * Run with: node test-booking-limits.js
 */

async function testBookingLimits() {
  console.log('🧪 Testing Booking Limits System...\n');

  // Test 1: Check system settings
  console.log('📋 Test 1: System Settings');
  try {
    const response = await fetch('http://localhost:3001/api/admin/booking-limits');
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ System settings loaded:', result.data);
    } else {
      console.log('❌ Failed to load settings:', result.error);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }

  console.log('\n📅 Test 2: Booking Summary');
  try {
    const response = await fetch('http://localhost:3001/api/admin/booking-limits?summary=true');
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Booking summary:', {
        totalAvailableSpots: result.data.totalAvailableSpots,
        totalBookedSpots: result.data.totalBookedSpots,
        upcomingDatesCount: result.data.upcomingDates.length,
        firstFewDates: result.data.upcomingDates.slice(0, 3).map(d => ({
          date: d.limit_date,
          available: d.availability_status,
          spots: d.spots_remaining
        }))
      });
    } else {
      console.log('❌ Failed to load summary:', result.error);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }

  console.log('\n🎯 Test 3: Date Range Limits');
  try {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const endDate = nextWeek.toISOString().split('T')[0];

    const response = await fetch(`http://localhost:3001/api/admin/booking-limits?startDate=${today}&endDate=${endDate}`);
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Found ${result.data.length} days with limits`);
      console.log('First few days:', result.data.slice(0, 3).map(d => ({
        date: d.limit_date,
        status: d.availability_status,
        customers: `${d.current_customers}/${d.max_customers}`,
        spots: d.spots_remaining
      })));
    } else {
      console.log('❌ Failed to load date range:', result.error);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }

  console.log('\n🔧 Test 4: Update Daily Limit');
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const response = await fetch('http://localhost:3001/api/admin/booking-limits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updateDailyLimit',
        serviceDate: tomorrowStr,
        updates: {
          max_customers: 10,
          notes: 'Test limit update'
        }
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Updated daily limit:', {
        date: result.data.limit_date,
        maxCustomers: result.data.max_customers,
        notes: result.data.notes
      });
    } else {
      console.log('❌ Failed to update limit:', result.error);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }

  console.log('\n🎉 Testing complete! Check results above.');
}

// Only run if this file is executed directly
if (require.main === module) {
  testBookingLimits();
}

module.exports = { testBookingLimits };
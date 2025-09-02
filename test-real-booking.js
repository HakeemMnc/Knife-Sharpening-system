/**
 * Test booking flow to verify limits work
 * This will make several test bookings to see the limits in action
 */

const BASE_URL = 'http://localhost:3001';

async function testBookingLimits() {
  console.log('🧪 Testing Booking Limits by Making Real Bookings...\n');

  // Step 1: Check current availability for tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  console.log('📅 Step 1: Check availability for', tomorrowStr);
  try {
    const response = await fetch(`${BASE_URL}/api/admin/booking-limits?startDate=${tomorrowStr}&endDate=${tomorrowStr}`);
    const result = await response.json();
    
    if (result.success && result.data.length > 0) {
      const limit = result.data[0];
      console.log('✅ Current status:', {
        date: limit.limit_date,
        customers: `${limit.current_customers}/${limit.max_customers}`,
        spotsLeft: limit.spots_remaining,
        status: limit.availability_status
      });
    }
  } catch (error) {
    console.log('❌ Error checking availability:', error.message);
    return;
  }

  // Step 2: Make a test booking
  console.log('\n🛒 Step 2: Making a test booking...');
  
  const testOrder = {
    firstName: 'Test',
    lastName: 'Customer',
    email: 'test@example.com',
    phone: '0412345678',
    address: '123 Test Street, Byron Bay NSW 2481',
    streetAddress: '123 Test Street',
    suburb: 'Byron Bay',
    state: 'NSW',
    postalCode: '2481',
    specialInstructions: 'This is a test booking for limits system',
    totalItems: 5,
    serviceLevel: 'standard',
    serviceDate: tomorrowStr
  };

  try {
    const response = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOrder),
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Test booking created successfully!', {
        orderId: result.order.id,
        total: `$${result.order.total}`,
        serviceDate: result.order.serviceDate
      });
    } else {
      console.log('❌ Booking failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }

  // Step 3: Check availability again to see the change
  console.log('\n📊 Step 3: Check availability after booking...');
  try {
    const response = await fetch(`${BASE_URL}/api/admin/booking-limits?startDate=${tomorrowStr}&endDate=${tomorrowStr}`);
    const result = await response.json();
    
    if (result.success && result.data.length > 0) {
      const limit = result.data[0];
      console.log('✅ Updated status:', {
        date: limit.limit_date,
        customers: `${limit.current_customers}/${limit.max_customers}`,
        spotsLeft: limit.spots_remaining,
        status: limit.availability_status
      });
      
      if (limit.spots_remaining < 7) {
        console.log('🎉 SUCCESS: Booking count increased! Limits are working.');
      }
    }
  } catch (error) {
    console.log('❌ Error checking updated availability:', error.message);
  }

  console.log('\n🏁 Test complete!');
  console.log('Check your admin dashboard to see the new order.');
}

// Run the test
testBookingLimits();
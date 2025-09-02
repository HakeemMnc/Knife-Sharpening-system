/**
 * Test booking on a valid service day
 */

const BASE_URL = 'http://localhost:3001';

function getNextServiceDay() {
  // Byron Bay (2481) has service on Monday & Thursday
  const today = new Date();
  let checkDate = new Date(today);
  checkDate.setDate(checkDate.getDate() + 1); // Start from tomorrow
  
  // Look for next Monday or Thursday
  for (let i = 0; i < 7; i++) {
    const dayName = checkDate.toLocaleDateString('en-AU', { weekday: 'long' });
    if (dayName === 'Monday' || dayName === 'Thursday') {
      return {
        date: checkDate,
        dateString: checkDate.toISOString().split('T')[0],
        dayName
      };
    }
    checkDate.setDate(checkDate.getDate() + 1);
  }
  return null;
}

async function testValidServiceDay() {
  console.log('🧪 Testing Booking on Valid Service Day...\n');

  const serviceDay = getNextServiceDay();
  if (!serviceDay) {
    console.log('❌ Could not find next service day');
    return;
  }

  console.log('📅 Next service day for Byron Bay (2481):', {
    date: serviceDay.dateString,
    dayName: serviceDay.dayName
  });

  // Step 1: Check availability
  console.log('\n📊 Step 1: Check availability...');
  try {
    const response = await fetch(`${BASE_URL}/api/admin/booking-limits?startDate=${serviceDay.dateString}&endDate=${serviceDay.dateString}`);
    const result = await response.json();
    
    if (result.success && result.data.length > 0) {
      const limit = result.data[0];
      console.log('✅ Current availability:', {
        date: limit.limit_date,
        customers: `${limit.current_customers}/${limit.max_customers}`,
        spotsLeft: limit.spots_remaining,
        status: limit.availability_status
      });
    } else {
      console.log('No limit data found, will create default');
    }
  } catch (error) {
    console.log('❌ Error checking availability:', error.message);
  }

  // Step 2: Make test booking
  console.log('\n🛒 Step 2: Making test booking...');
  
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
    specialInstructions: 'Test booking for limits system',
    totalItems: 3,
    serviceLevel: 'standard',
    serviceDate: serviceDay.dateString
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
    
    console.log('Response status:', response.status);
    
    if (result.success) {
      console.log('✅ Test booking created successfully!', {
        orderId: result.order.id,
        total: `$${result.order.total}`,
        serviceDate: result.order.serviceDate
      });
    } else {
      console.log('❌ Booking failed:', result.error);
      if (result.details) console.log('Details:', result.details);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }

  // Step 3: Check updated availability
  console.log('\n📊 Step 3: Check availability after booking...');
  try {
    const response = await fetch(`${BASE_URL}/api/admin/booking-limits?startDate=${serviceDay.dateString}&endDate=${serviceDay.dateString}`);
    const result = await response.json();
    
    if (result.success && result.data.length > 0) {
      const limit = result.data[0];
      console.log('✅ Updated availability:', {
        date: limit.limit_date,
        customers: `${limit.current_customers}/${limit.max_customers}`,
        spotsLeft: limit.spots_remaining,
        status: limit.availability_status
      });
    }
  } catch (error) {
    console.log('❌ Error checking updated availability:', error.message);
  }

  console.log('\n🎉 Test complete! Check your admin dashboard.');
}

testValidServiceDay();
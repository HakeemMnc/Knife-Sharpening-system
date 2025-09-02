/**
 * Debug the booking failure
 */

const BASE_URL = 'http://localhost:3001';

async function debugBooking() {
  console.log('🔍 Debug: Testing booking step by step...\n');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  // Check what service days are available for this postcode
  console.log('📋 Step 1: Check if tomorrow is a service day...');
  console.log('Tomorrow date:', tomorrowStr);
  console.log('Day of week:', tomorrow.toLocaleDateString('en-AU', { weekday: 'long' }));

  const testOrder = {
    firstName: 'Test',
    lastName: 'Customer',
    email: 'test@example.com',
    phone: '0412345678',
    address: '123 Test Street, Byron Bay NSW 2481',
    streetAddress: '123 Test Street',
    suburb: 'Byron Bay',  
    state: 'NSW',
    postalCode: '2481', // Byron Bay - should be Monday/Thursday service
    specialInstructions: 'This is a test booking for limits system',
    totalItems: 5,
    serviceLevel: 'standard',
    serviceDate: tomorrowStr
  };

  console.log('\n🛒 Step 2: Attempting booking with detailed error...');
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
    console.log('Response body:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('✅ Booking successful!');
    } else {
      console.log('❌ Booking failed with error:', result.error);
      if (result.details) {
        console.log('Details:', result.details);
      }
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

debugBooking();
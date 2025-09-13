const https = require('https');
const http = require('http');

// Get next Monday's date
function getNextMonday() {
  const now = new Date();
  const monday = new Date(now);
  const daysSinceMonday = (now.getDay() + 6) % 7; // 0 = Monday, 1 = Tuesday, etc.
  monday.setDate(now.getDate() - daysSinceMonday + 7); // Next Monday
  return monday.toISOString().split('T')[0]; // YYYY-MM-DD format
}

// Monday orders - Byron Bay (2481) and Bangalow (2479) areas only
const mondayOrders = [
  // Byron Bay Area (2481)
  {
    firstName: 'Sarah',
    lastName: 'Mitchell',
    email: 'sarah.mitchell@email.com',
    phone: '0421 567 890',
    address: '15 Bangalow Road, Byron Bay, NSW 2481',
    totalItems: 3,
    serviceLevel: 'standard',
    specialInstructions: 'Kitchen knives need extra attention'
  },
  {
    firstName: 'James',
    lastName: 'Harrison',
    email: 'j.harrison@email.com',
    phone: '0432 678 901',
    address: '42 Jonson Street, Byron Bay, NSW 2481',
    totalItems: 5,
    serviceLevel: 'premium',
    specialInstructions: 'Chef knives and Japanese steel'
  },
  // Bangalow Area (2479)
  {
    firstName: 'Emma',
    lastName: 'Thompson',
    email: 'emma.thompson@email.com',
    phone: '0443 789 012',
    address: '8 Byron Street, Bangalow, NSW 2479',
    totalItems: 2,
    serviceLevel: 'standard',
    specialInstructions: ''
  },
  {
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@email.com',
    phone: '0454 890 123',
    address: '23 Lismore Road, Bangalow, NSW 2479',
    totalItems: 4,
    serviceLevel: 'premium',
    specialInstructions: 'Garden tools included'
  }
];

// Calculate pricing based on your business model
function calculateFinalTotal(totalItems, serviceLevel) {
  const baseAmount = totalItems * 20; // $20 per item
  const upgradeAmount = serviceLevel === 'premium' ? totalItems * 5 : 0; // $5 upgrade per item
  return baseAmount + upgradeAmount; // No delivery fee for mobile service
}

// Function to make HTTP requests
function makeRequest(url, data, method = 'POST') {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: url,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(data && { 'Content-Length': Buffer.byteLength(postData) })
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(responseData));
          } catch (e) {
            resolve({ success: true });
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(postData);
    }
    req.end();
  });
}

async function clearAndCreateMondayOrders() {
  console.log('🗑️  Clearing all existing orders...');
  
  try {
    // Clear all orders via DELETE endpoint
    await makeRequest('/api/admin/clear-orders', null, 'DELETE');
    console.log('✅ All existing orders cleared');
    
  } catch (error) {
    console.log('⚠️  Could not clear via API, continuing with order creation...');
  }
  
  console.log('📦 Creating Monday orders only...');
  
  const mondayDate = getNextMonday();
  console.log(`\n📅 Creating orders for Monday (${mondayDate}):`);
  
  let totalCreated = 0;
  
  for (const order of mondayOrders) {
    const orderData = {
      ...order,
      serviceDate: mondayDate,
      finalTotal: calculateFinalTotal(order.totalItems, order.serviceLevel)
    };
    
    try {
      const result = await makeRequest('/api/orders', orderData);
      
      console.log(`   ✅ ${order.firstName} ${order.lastName} - ${order.address.split(',')[0]} (${order.totalItems} items, ${order.serviceLevel})`);
      totalCreated++;
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.log(`   ❌ Failed to create order for ${order.firstName} ${order.lastName}: ${error.message}`);
    }
  }
  
  console.log(`\n🎉 Successfully created ${totalCreated} Monday orders!`);
  console.log('\n📋 Order Summary:');
  console.log(`   Monday (Byron Bay/Bangalow): ${totalCreated} orders`);
  console.log(`\n🗺️  All orders have real addresses in Monday's service areas`);
  console.log(`📱 Ready to test GPS route optimization for Monday!`);
}

// Run the script
console.log('🚀 Starting Monday order creation...');
console.log('📡 Make sure your Next.js app is running on localhost:3001');
console.log('');

clearAndCreateMondayOrders();
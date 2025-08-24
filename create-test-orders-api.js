const https = require('https');
const http = require('http');

// Get next Monday's date and calculate the week
function getNextWeekDates() {
  const now = new Date();
  const monday = new Date(now);
  const daysSinceMonday = (now.getDay() + 6) % 7; // 0 = Monday, 1 = Tuesday, etc.
  monday.setDate(now.getDate() - daysSinceMonday + 7); // Next Monday
  
  const dates = {};
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  days.forEach((day, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    dates[day] = date.toISOString().split('T')[0]; // YYYY-MM-DD format
  });
  
  return dates;
}

// Test order data with real Northern Rivers addresses
const testOrders = {
  Monday: [
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
  ],
  
  Tuesday: [
    // Mullumbimby Area (2482)
    {
      firstName: 'Lisa',
      lastName: 'Williams',
      email: 'lisa.williams@email.com',
      phone: '0465 901 234',
      address: '12 Station Street, Mullumbimby, NSW 2482',
      totalItems: 3,
      serviceLevel: 'standard',
      specialInstructions: 'Paring knives mostly'
    },
    {
      firstName: 'David',
      lastName: 'Roberts',
      email: 'david.roberts@email.com',
      phone: '0476 012 345',
      address: '35 Dalley Street, Mullumbimby, NSW 2482',
      totalItems: 6,
      serviceLevel: 'premium',
      specialInstructions: 'Professional kitchen set'
    },
    // Brunswick Heads Area (2483)
    {
      firstName: 'Rachel',
      lastName: 'Davis',
      email: 'rachel.davis@email.com',
      phone: '0487 123 456',
      address: '7 The Terrace, Brunswick Heads, NSW 2483',
      totalItems: 2,
      serviceLevel: 'standard',
      specialInstructions: ''
    },
    // Pottsville Area (2489)
    {
      firstName: 'Andrew',
      lastName: 'Brown',
      email: 'andrew.brown@email.com',
      phone: '0498 234 567',
      address: '18 Coronation Avenue, Pottsville, NSW 2489',
      totalItems: 4,
      serviceLevel: 'standard',
      specialInstructions: 'Mix of kitchen and outdoor knives'
    }
  ],
  
  Wednesday: [
    // Ballina Area (2478)
    {
      firstName: 'Sophie',
      lastName: 'Wilson',
      email: 'sophie.wilson@email.com',
      phone: '0409 345 678',
      address: '45 River Street, Ballina, NSW 2478',
      totalItems: 3,
      serviceLevel: 'premium',
      specialInstructions: 'High-end German knives'
    },
    {
      firstName: 'Thomas',
      lastName: 'Anderson',
      email: 'thomas.anderson@email.com',
      phone: '0410 456 789',
      address: '22 Tamar Street, Ballina, NSW 2478',
      totalItems: 5,
      serviceLevel: 'standard',
      specialInstructions: 'Restaurant prep knives'
    },
    // Alstonville Area (2477)
    {
      firstName: 'Jessica',
      lastName: 'Taylor',
      email: 'jessica.taylor@email.com',
      phone: '0421 567 890',
      address: '9 Main Street, Alstonville, NSW 2477',
      totalItems: 2,
      serviceLevel: 'premium',
      specialInstructions: 'Ceramic knives'
    },
    {
      firstName: 'Mark',
      lastName: 'Johnson',
      email: 'mark.johnson@email.com',
      phone: '0432 678 901',
      address: '31 Wardell Road, Alstonville, NSW 2477',
      totalItems: 4,
      serviceLevel: 'standard',
      specialInstructions: 'Standard home kitchen set'
    }
  ],
  
  Thursday: [
    // Byron Bay Area (2481) - repeat customers
    {
      firstName: 'Caroline',
      lastName: 'White',
      email: 'caroline.white@email.com',
      phone: '0443 789 012',
      address: '28 Fletcher Street, Byron Bay, NSW 2481',
      totalItems: 4,
      serviceLevel: 'premium',
      specialInstructions: 'Santoku knives specialty'
    },
    {
      firstName: 'Robert',
      lastName: 'Green',
      email: 'robert.green@email.com',
      phone: '0454 890 123',
      address: '16 Lawson Street, Byron Bay, NSW 2481',
      totalItems: 3,
      serviceLevel: 'standard',
      specialInstructions: 'Basic sharpening needed'
    },
    // Bangalow Area (2479)
    {
      firstName: 'Amanda',
      lastName: 'Clarke',
      email: 'amanda.clarke@email.com',
      phone: '0465 901 234',
      address: '14 Granuaille Crescent, Bangalow, NSW 2479',
      totalItems: 2,
      serviceLevel: 'standard',
      specialInstructions: ''
    },
    {
      firstName: 'Paul',
      lastName: 'Martinez',
      email: 'paul.martinez@email.com',
      phone: '0476 012 345',
      address: '7 Ashton Street, Bangalow, NSW 2479',
      totalItems: 5,
      serviceLevel: 'premium',
      specialInstructions: 'Butcher knife set'
    }
  ],
  
  Friday: [
    // Mullumbimby Area (2482)
    {
      firstName: 'Helen',
      lastName: 'Lewis',
      email: 'helen.lewis@email.com',
      phone: '0487 123 456',
      address: '26 Burringbar Street, Mullumbimby, NSW 2482',
      totalItems: 3,
      serviceLevel: 'standard',
      specialInstructions: 'Home cooking knives'
    },
    {
      firstName: 'Christopher',
      lastName: 'Hall',
      email: 'christopher.hall@email.com',
      phone: '0498 234 567',
      address: '11 Tincogan Street, Mullumbimby, NSW 2482',
      totalItems: 6,
      serviceLevel: 'premium',
      specialInstructions: 'Professional catering knives'
    },
    // Brunswick Heads Area (2483)
    {
      firstName: 'Jennifer',
      lastName: 'Young',
      email: 'jennifer.young@email.com',
      phone: '0409 345 678',
      address: '19 Fingal Street, Brunswick Heads, NSW 2483',
      totalItems: 2,
      serviceLevel: 'standard',
      specialInstructions: 'Quick touch-up needed'
    },
    // Pottsville Area (2489)
    {
      firstName: 'Steven',
      lastName: 'King',
      email: 'steven.king@email.com',
      phone: '0410 456 789',
      address: '33 Cudgen Road, Pottsville, NSW 2489',
      totalItems: 4,
      serviceLevel: 'premium',
      specialInstructions: 'Fishing and hunting knives'
    }
  ],
  
  Saturday: [
    // Ballina Area (2478)
    {
      firstName: 'Nicole',
      lastName: 'Scott',
      email: 'nicole.scott@email.com',
      phone: '0421 567 890',
      address: '52 Martin Street, Ballina, NSW 2478',
      totalItems: 3,
      serviceLevel: 'standard',
      specialInstructions: 'Weekly maintenance'
    },
    {
      firstName: 'Daniel',
      lastName: 'Adams',
      email: 'daniel.adams@email.com',
      phone: '0432 678 901',
      address: '8 Cherry Street, Ballina, NSW 2478',
      totalItems: 5,
      serviceLevel: 'premium',
      specialInstructions: 'Damascus steel knives'
    },
    // Alstonville Area (2477)
    {
      firstName: 'Rebecca',
      lastName: 'Baker',
      email: 'rebecca.baker@email.com',
      phone: '0443 789 012',
      address: '17 Elizabeth Street, Alstonville, NSW 2477',
      totalItems: 2,
      serviceLevel: 'standard',
      specialInstructions: 'Small paring knives'
    },
    {
      firstName: 'Kevin',
      lastName: 'Turner',
      email: 'kevin.turner@email.com',
      phone: '0454 890 123',
      address: '24 Hickey Street, Alstonville, NSW 2477',
      totalItems: 4,
      serviceLevel: 'premium',
      specialInstructions: 'Complete kitchen knife set'
    }
  ]
};

// Calculate pricing based on your business model
function calculateFinalTotal(totalItems, serviceLevel) {
  const baseAmount = totalItems * 17; // $17 per item
  const upgradeAmount = serviceLevel === 'premium' ? totalItems * 5 : 0; // $5 upgrade per item
  return baseAmount + upgradeAmount; // No delivery fee for mobile service
}

// Function to make HTTP requests
function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(responseData));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function createTestOrders() {
  console.log('🗑️  Note: This script will create test orders alongside existing ones');
  console.log('📦 Creating test orders via API...');
  
  const dates = getNextWeekDates();
  let totalCreated = 0;
  
  try {
    // Create test orders for each day
    for (const [day, orders] of Object.entries(testOrders)) {
      console.log(`\n📅 Creating orders for ${day} (${dates[day]}):`);
      
      for (const order of orders) {
        const orderData = {
          ...order,
          serviceDate: dates[day], // Add the calculated service date
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
    }
    
    console.log(`\n🎉 Successfully created ${totalCreated} test orders!`);
    console.log('\n📋 Order Summary:');
    console.log(`   Monday (Byron Bay/Bangalow): 4 orders`);
    console.log(`   Tuesday (Mullumbimby/Brunswick Heads/Pottsville): 4 orders`);
    console.log(`   Wednesday (Ballina/Alstonville): 4 orders`);
    console.log(`   Thursday (Byron Bay/Bangalow): 4 orders`);
    console.log(`   Friday (Mullumbimby/Brunswick Heads/Pottsville): 4 orders`);
    console.log(`   Saturday (Ballina/Alstonville): 4 orders`);
    console.log(`\n🗺️  All orders have real addresses across Northern Rivers service areas`);
    console.log(`📱 Ready to test GPS route optimization!`);
    
  } catch (error) {
    console.error('❌ Error creating test orders:', error);
  }
}

// Run the script
console.log('🚀 Starting test order creation...');
console.log('📡 Make sure your Next.js app is running on localhost:3001');
console.log('');

createTestOrders();
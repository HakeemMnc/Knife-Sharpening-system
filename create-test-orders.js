const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'northern_rivers_knife',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'your_password',
});

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
      first_name: 'Sarah',
      last_name: 'Mitchell',
      email: 'sarah.mitchell@email.com',
      phone: '0421 567 890',
      street_address: '15 Bangalow Road',
      suburb: 'Byron Bay',
      postal_code: '2481',
      total_items: 3,
      service_level: 'standard'
    },
    {
      first_name: 'James',
      last_name: 'Harrison',
      email: 'j.harrison@email.com',
      phone: '0432 678 901',
      street_address: '42 Jonson Street',
      suburb: 'Byron Bay',
      postal_code: '2481',
      total_items: 5,
      service_level: 'premium'
    },
    // Bangalow Area (2479)
    {
      first_name: 'Emma',
      last_name: 'Thompson',
      email: 'emma.thompson@email.com',
      phone: '0443 789 012',
      street_address: '8 Byron Street',
      suburb: 'Bangalow',
      postal_code: '2479',
      total_items: 2,
      service_level: 'standard'
    },
    {
      first_name: 'Michael',
      last_name: 'Chen',
      email: 'michael.chen@email.com',
      phone: '0454 890 123',
      street_address: '23 Lismore Road',
      suburb: 'Bangalow',
      postal_code: '2479',
      total_items: 4,
      service_level: 'premium'
    }
  ],
  
  Tuesday: [
    // Mullumbimby Area (2482)
    {
      first_name: 'Lisa',
      last_name: 'Williams',
      email: 'lisa.williams@email.com',
      phone: '0465 901 234',
      street_address: '12 Station Street',
      suburb: 'Mullumbimby',
      postal_code: '2482',
      total_items: 3,
      service_level: 'standard'
    },
    {
      first_name: 'David',
      last_name: 'Roberts',
      email: 'david.roberts@email.com',
      phone: '0476 012 345',
      street_address: '35 Dalley Street',
      suburb: 'Mullumbimby',
      postal_code: '2482',
      total_items: 6,
      service_level: 'premium'
    },
    // Brunswick Heads Area (2483)
    {
      first_name: 'Rachel',
      last_name: 'Davis',
      email: 'rachel.davis@email.com',
      phone: '0487 123 456',
      street_address: '7 The Terrace',
      suburb: 'Brunswick Heads',
      postal_code: '2483',
      total_items: 2,
      service_level: 'standard'
    },
    // Pottsville Area (2489)
    {
      first_name: 'Andrew',
      last_name: 'Brown',
      email: 'andrew.brown@email.com',
      phone: '0498 234 567',
      street_address: '18 Coronation Avenue',
      suburb: 'Pottsville',
      postal_code: '2489',
      total_items: 4,
      service_level: 'standard'
    }
  ],
  
  Wednesday: [
    // Ballina Area (2478)
    {
      first_name: 'Sophie',
      last_name: 'Wilson',
      email: 'sophie.wilson@email.com',
      phone: '0409 345 678',
      street_address: '45 River Street',
      suburb: 'Ballina',
      postal_code: '2478',
      total_items: 3,
      service_level: 'premium'
    },
    {
      first_name: 'Thomas',
      last_name: 'Anderson',
      email: 'thomas.anderson@email.com',
      phone: '0410 456 789',
      street_address: '22 Tamar Street',
      suburb: 'Ballina',
      postal_code: '2478',
      total_items: 5,
      service_level: 'standard'
    },
    // Alstonville Area (2477)
    {
      first_name: 'Jessica',
      last_name: 'Taylor',
      email: 'jessica.taylor@email.com',
      phone: '0421 567 890',
      street_address: '9 Main Street',
      suburb: 'Alstonville',
      postal_code: '2477',
      total_items: 2,
      service_level: 'premium'
    },
    {
      first_name: 'Mark',
      last_name: 'Johnson',
      email: 'mark.johnson@email.com',
      phone: '0432 678 901',
      street_address: '31 Wardell Road',
      suburb: 'Alstonville',
      postal_code: '2477',
      total_items: 4,
      service_level: 'standard'
    }
  ],
  
  Thursday: [
    // Byron Bay Area (2481) - repeat customers
    {
      first_name: 'Caroline',
      last_name: 'White',
      email: 'caroline.white@email.com',
      phone: '0443 789 012',
      street_address: '28 Fletcher Street',
      suburb: 'Byron Bay',
      postal_code: '2481',
      total_items: 4,
      service_level: 'premium'
    },
    {
      first_name: 'Robert',
      last_name: 'Green',
      email: 'robert.green@email.com',
      phone: '0454 890 123',
      street_address: '16 Lawson Street',
      suburb: 'Byron Bay',
      postal_code: '2481',
      total_items: 3,
      service_level: 'standard'
    },
    // Bangalow Area (2479)
    {
      first_name: 'Amanda',
      last_name: 'Clarke',
      email: 'amanda.clarke@email.com',
      phone: '0465 901 234',
      street_address: '14 Granuaille Crescent',
      suburb: 'Bangalow',
      postal_code: '2479',
      total_items: 2,
      service_level: 'standard'
    },
    {
      first_name: 'Paul',
      last_name: 'Martinez',
      email: 'paul.martinez@email.com',
      phone: '0476 012 345',
      street_address: '7 Ashton Street',
      suburb: 'Bangalow',
      postal_code: '2479',
      total_items: 5,
      service_level: 'premium'
    }
  ],
  
  Friday: [
    // Mullumbimby Area (2482)
    {
      first_name: 'Helen',
      last_name: 'Lewis',
      email: 'helen.lewis@email.com',
      phone: '0487 123 456',
      street_address: '26 Burringbar Street',
      suburb: 'Mullumbimby',
      postal_code: '2482',
      total_items: 3,
      service_level: 'standard'
    },
    {
      first_name: 'Christopher',
      last_name: 'Hall',
      email: 'christopher.hall@email.com',
      phone: '0498 234 567',
      street_address: '11 Tincogan Street',
      suburb: 'Mullumbimby',
      postal_code: '2482',
      total_items: 6,
      service_level: 'premium'
    },
    // Brunswick Heads Area (2483)
    {
      first_name: 'Jennifer',
      last_name: 'Young',
      email: 'jennifer.young@email.com',
      phone: '0409 345 678',
      street_address: '19 Fingal Street',
      suburb: 'Brunswick Heads',
      postal_code: '2483',
      total_items: 2,
      service_level: 'standard'
    },
    // Pottsville Area (2489)
    {
      first_name: 'Steven',
      last_name: 'King',
      email: 'steven.king@email.com',
      phone: '0410 456 789',
      street_address: '33 Cudgen Road',
      suburb: 'Pottsville',
      postal_code: '2489',
      total_items: 4,
      service_level: 'premium'
    }
  ],
  
  Saturday: [
    // Ballina Area (2478)
    {
      first_name: 'Nicole',
      last_name: 'Scott',
      email: 'nicole.scott@email.com',
      phone: '0421 567 890',
      street_address: '52 Martin Street',
      suburb: 'Ballina',
      postal_code: '2478',
      total_items: 3,
      service_level: 'standard'
    },
    {
      first_name: 'Daniel',
      last_name: 'Adams',
      email: 'daniel.adams@email.com',
      phone: '0432 678 901',
      street_address: '8 Cherry Street',
      suburb: 'Ballina',
      postal_code: '2478',
      total_items: 5,
      service_level: 'premium'
    },
    // Alstonville Area (2477)
    {
      first_name: 'Rebecca',
      last_name: 'Baker',
      email: 'rebecca.baker@email.com',
      phone: '0443 789 012',
      street_address: '17 Elizabeth Street',
      suburb: 'Alstonville',
      postal_code: '2477',
      total_items: 2,
      service_level: 'standard'
    },
    {
      first_name: 'Kevin',
      last_name: 'Turner',
      email: 'kevin.turner@email.com',
      phone: '0454 890 123',
      street_address: '24 Hickey Street',
      suburb: 'Alstonville',
      postal_code: '2477',
      total_items: 4,
      service_level: 'premium'
    }
  ]
};

// Calculate pricing
function calculatePricing(totalItems, serviceLevel) {
  const baseAmount = totalItems * 20; // $20 per item
  const upgradeAmount = serviceLevel === 'premium' ? totalItems * 5 : 0; // $5 upgrade per item
  const deliveryFee = 25; // $25 delivery fee
  const totalAmount = baseAmount + upgradeAmount + deliveryFee;
  
  return {
    base_amount: baseAmount,
    upgrade_amount: upgradeAmount,
    delivery_fee: deliveryFee,
    total_amount: totalAmount
  };
}

async function createTestOrders() {
  const client = await pool.connect();
  
  try {
    console.log('🗑️  Clearing existing orders...');
    
    // Clear existing orders
    await client.query('DELETE FROM orders');
    console.log('✅ All existing orders cleared');
    
    console.log('📦 Creating test orders...');
    
    const dates = getNextWeekDates();
    let totalCreated = 0;
    
    // Insert test orders for each day
    for (const [day, orders] of Object.entries(testOrders)) {
      const serviceDate = dates[day];
      console.log(`\n📅 Creating orders for ${day} (${serviceDate}):`);
      
      for (const order of orders) {
        const pricing = calculatePricing(order.total_items, order.service_level);
        const fullAddress = `${order.street_address}, ${order.suburb}, NSW ${order.postal_code}`;
        
        const insertQuery = `
          INSERT INTO orders (
            first_name, last_name, email, phone,
            pickup_address, street_address, suburb, state, postal_code,
            total_items, service_level,
            base_amount, upgrade_amount, delivery_fee, total_amount,
            service_date, pickup_date,
            status, payment_status,
            created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4,
            $5, $6, $7, $8, $9,
            $10, $11,
            $12, $13, $14, $15,
            $16, $17,
            $18, $19,
            NOW(), NOW()
          )
        `;
        
        await client.query(insertQuery, [
          order.first_name, order.last_name, order.email, order.phone,
          fullAddress, order.street_address, order.suburb, 'NSW', order.postal_code,
          order.total_items, order.service_level,
          pricing.base_amount, pricing.upgrade_amount, pricing.delivery_fee, pricing.total_amount,
          serviceDate, serviceDate, // Both service_date and pickup_date for compatibility
          'paid', 'paid', // Set as paid so they're ready for route optimization
        ]);
        
        console.log(`   ✅ ${order.first_name} ${order.last_name} - ${order.street_address}, ${order.suburb} (${order.total_items} items, ${order.service_level})`);
        totalCreated++;
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
    console.log(`\n🗺️  All orders have real addresses and are set to 'paid' status`);
    console.log(`📱 Ready to test GPS route optimization!`);
    
  } catch (error) {
    console.error('❌ Error creating test orders:', error);
  } finally {
    client.release();
    pool.end();
  }
}

// Run the script
createTestOrders();
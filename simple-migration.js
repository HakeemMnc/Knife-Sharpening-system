/**
 * Simple Service Date Migration
 */

const { createClient } = require('@supabase/supabase-js');

async function addServiceDateColumn() {
  console.log('🔧 Adding service_date column...\n');
  
  // Load environment variables
  require('dotenv').config({ path: '.env.local' });
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Test current table structure by trying to insert without service_date
    console.log('1. Testing current table structure...');
    
    const testInsert = {
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      phone: '0412345678',
      pickup_address: '123 Test St, Byron Bay, NSW 2481',
      total_items: 5,
      service_level: 'standard',
      base_amount: 85,
      upgrade_amount: 0,
      delivery_fee: 0,
      total_amount: 85,
      pickup_date: '2025-08-26'
    };
    
    const { data: testData, error: testError } = await supabase
      .from('orders')
      .insert(testInsert)
      .select()
      .single();
    
    if (testError) {
      if (testError.message.includes('service_date')) {
        console.log('❌ service_date column is required but missing');
        console.log('   Need to add the column through Supabase dashboard');
        return false;
      } else {
        console.log('❌ Test insert failed:', testError.message);
        return false;
      }
    } else {
      console.log('✅ Current structure works - service_date may be optional');
      // Clean up
      await supabase.from('orders').delete().eq('id', testData.id);
    }
    
    // Test with service_date
    console.log('\\n2. Testing with service_date...');
    
    const testWithServiceDate = {
      ...testInsert,
      service_date: '2025-08-22'
    };
    
    const { data: testData2, error: testError2 } = await supabase
      .from('orders')
      .insert(testWithServiceDate)
      .select()
      .single();
    
    if (testError2) {
      console.log('❌ With service_date failed:', testError2.message);
      
      if (testError2.message.includes('column "service_date" of relation "orders" does not exist')) {
        console.log('\\n🚨 SOLUTION NEEDED:');
        console.log('   The service_date column needs to be added to the orders table.');
        console.log('   Please run this SQL in your Supabase SQL Editor:');
        console.log('');
        console.log('   ALTER TABLE orders ADD COLUMN service_date DATE;');
        console.log('   UPDATE orders SET service_date = pickup_date WHERE service_date IS NULL;');
        console.log('   ALTER TABLE orders ALTER COLUMN service_date SET NOT NULL;');
        console.log('   CREATE INDEX idx_orders_service_date ON orders(service_date);');
        console.log('');
        return false;
      }
    } else {
      console.log('✅ service_date column exists and works!');
      console.log(`   Order ID: ${testData2.id}`);
      console.log(`   Service Date: ${testData2.service_date}`);
      // Clean up
      await supabase.from('orders').delete().eq('id', testData2.id);
      return true;
    }
    
  } catch (error) {
    console.error('❌ Migration check failed:', error.message);
    return false;
  }
}

addServiceDateColumn().then(success => {
  if (success) {
    console.log('\\n🎉 Database is ready for mobile service bookings!');
  } else {
    console.log('\\n⚠️  Database needs manual update before bookings will work.');
  }
});
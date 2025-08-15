import { createClient } from '@supabase/supabase-js';

// Your Supabase credentials
const supabaseUrl = 'https://vxnybclsfuftmaokumer.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4bnliY2xzZnVmdG1hb2t1bWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMDQ4OTYsImV4cCI6MjA3MDU4MDg5Nn0.NRFkIgHpmnAS5kuzYhPsyidNgAr5RwqWU4G0dBV3RPc';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4bnliY2xzZnVmdG1hb2t1bWVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTAwNDg5NiwiZXhwIjoyMDcwNTgwODk2fQ.7bBlXhOqrbxG-mOAMXphlAWB85wvGcrNqbuL2MG4kBA';

// Create Supabase clients
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function testDatabaseConnection() {
  console.log('🔍 Testing Supabase Database Connection...\n');

  try {
    // Test 1: Basic connection
    console.log('1. Testing basic connection...');
    const { data, error } = await supabase.from('orders').select('count').limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('✅ Basic connection successful! (Tables not created yet)');
      } else {
        console.log('❌ Basic connection failed:', error.message);
        return;
      }
    } else {
      console.log('✅ Basic connection successful!');
    }

    // Test 2: Check if tables exist using a different approach
    console.log('\n2. Checking if tables exist...');
    try {
      const { data: ordersTest, error: ordersError } = await supabaseAdmin
        .from('orders')
        .select('id')
        .limit(1);

      if (ordersError && ordersError.code === 'PGRST116') {
        console.log('⚠️  Orders table not found. You need to run the database schema first.');
        console.log('\n📋 Next Steps:');
        console.log('1. Go to your Supabase dashboard:');
        console.log('   https://supabase.com/dashboard/project/vxnybclsfuftmaokumer');
        console.log('2. Click "SQL Editor" in the left sidebar');
        console.log('3. Click "New query"');
        console.log('4. Copy and paste the contents of database/schema.sql');
        console.log('5. Click "Run" to execute the SQL script');
        console.log('6. Run this test again to verify everything works');
        return;
      } else if (ordersError) {
        console.log('❌ Error checking orders table:', ordersError.message);
        return;
      } else {
        console.log('✅ Orders table exists!');
      }
    } catch (err) {
      console.log('⚠️  Could not check tables. This might be expected if schema is not set up yet.');
    }

    // Test 3: Try to create a test order
    console.log('\n3. Testing order creation...');
    
    const testOrder = {
      first_name: 'Test',
      last_name: 'Customer',
      email: 'test@example.com',
      phone: '0412345678',
      pickup_address: '123 Test St, Byron Bay NSW 2481',
      total_items: 4,
      service_level: 'standard',
      base_amount: 60,
      upgrade_amount: 0,
      delivery_fee: 25,
      total_amount: 85,
      pickup_date: new Date().toISOString().split('T')[0],
      status: 'pending',
      payment_status: 'unpaid',
    };

    const { data: newOrder, error: createError } = await supabaseAdmin
      .from('orders')
      .insert(testOrder)
      .select()
      .single();

    if (createError) {
      console.log('❌ Order creation failed:', createError.message);
      console.log('This might be expected if the database schema is not set up yet.');
    } else {
      console.log('✅ Test order created successfully!');
      console.log('   Order ID:', newOrder.id);
      
      // Clean up test order
      await supabaseAdmin
        .from('orders')
        .delete()
        .eq('id', newOrder.id);
      console.log('   Test order cleaned up.');
    }

    console.log('\n🎉 Database connection test completed!');
    
    // Test 4: Check other tables
    console.log('\n4. Checking other tables...');
    
    try {
      const { data: smsLogsTest, error: smsError } = await supabaseAdmin
        .from('sms_logs')
        .select('id')
        .limit(1);
      
      if (smsError && smsError.code === 'PGRST116') {
        console.log('⚠️  SMS logs table not found.');
      } else {
        console.log('✅ SMS logs table exists!');
      }
    } catch (err) {
      console.log('⚠️  Could not check SMS logs table.');
    }

    try {
      const { data: customersTest, error: customersError } = await supabaseAdmin
        .from('customers')
        .select('id')
        .limit(1);
      
      if (customersError && customersError.code === 'PGRST116') {
        console.log('⚠️  Customers table not found.');
      } else {
        console.log('✅ Customers table exists!');
      }
    } catch (err) {
      console.log('⚠️  Could not check customers table.');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testDatabaseConnection();

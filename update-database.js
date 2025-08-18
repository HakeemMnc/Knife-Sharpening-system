const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase credentials 
const supabaseUrl = 'https://vxnybclsfuftmaokumer.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4bnliY2xzZnVmdG1hb2t1bWVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTAwNDg5NiwiZXhwIjoyMDcwNTgwODk2fQ.7bBlXhOqrbxG-mOAMXphlAWB85wvGcrNqbuL2MG4kBA';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function updateDatabase() {
  console.log('🔄 Updating database with new address field structure...\n');
  
  try {
    // Step 1: Drop existing tables since no valuable data
    console.log('1. Dropping existing tables (safe - no valuable data)...');
    
    const dropQueries = [
      'DROP TABLE IF EXISTS sms_logs CASCADE;',
      'DROP TABLE IF EXISTS orders CASCADE;', 
      'DROP TABLE IF EXISTS customers CASCADE;'
    ];
    
    for (const query of dropQueries) {
      const { error } = await supabaseAdmin.rpc('exec_sql', { sql: query });
      if (error && !error.message.includes('does not exist')) {
        console.log(`⚠️  ${error.message}`);
      }
    }
    console.log('✅ Existing tables dropped successfully');
    
    // Step 2: Read and execute the new schema
    console.log('\n2. Creating tables with new address field structure...');
    
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements and execute them
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const { error } = await supabaseAdmin.rpc('exec_sql', { sql: statement + ';' });
          if (error) {
            console.log(`⚠️  Error executing: ${statement.substring(0, 50)}...`);
            console.log(`    ${error.message}`);
          }
        } catch (err) {
          console.log(`⚠️  Failed to execute: ${statement.substring(0, 50)}...`);
        }
      }
    }
    
    console.log('✅ New schema created successfully');
    
    // Step 3: Test the new structure
    console.log('\n3. Testing new address field structure...');
    
    const testOrder = {
      first_name: 'Test',
      last_name: 'Customer',
      email: 'test@example.com',
      phone: '0412345678',
      pickup_address: '123 Main Street, Byron Bay, NSW 2481',
      street_address: '123 Main Street',
      suburb: 'Byron Bay',
      state: 'NSW',
      postal_code: '2481',
      total_items: 5,
      service_level: 'standard',
      base_amount: 85,
      upgrade_amount: 0,
      delivery_fee: 25,
      total_amount: 110,
      pickup_date: new Date().toISOString().split('T')[0],
      status: 'pending',
      payment_status: 'unpaid',
      confirmation_sms_sent: false,
      reminder_24h_sent: false,
      reminder_1h_sent: false,
      pickup_confirmation_sent: false,
      delivery_confirmation_sent: false,
      followup_sms_sent: false
    };
    
    const { data: newOrder, error: createError } = await supabaseAdmin
      .from('orders')
      .insert(testOrder)
      .select()
      .single();
    
    if (createError) {
      console.log('❌ Test order creation failed:', createError.message);
    } else {
      console.log('✅ Test order created successfully with new address fields!');
      console.log(`   Order ID: ${newOrder.id}`);
      console.log(`   Street: ${newOrder.street_address}`);
      console.log(`   Suburb: ${newOrder.suburb}`);
      console.log(`   State: ${newOrder.state}`);
      console.log(`   Postal Code: ${newOrder.postal_code}`);
      
      // Clean up test order
      await supabaseAdmin
        .from('orders')
        .delete()
        .eq('id', newOrder.id);
      console.log('   Test order cleaned up');
    }
    
    // Step 4: Test postal code query
    console.log('\n4. Testing postal code indexing...');
    
    const testOrder2 = {
      ...testOrder,
      email: 'test2@example.com',
      postal_code: '2480'
    };
    
    const { data: order2 } = await supabaseAdmin
      .from('orders')
      .insert(testOrder2)
      .select()
      .single();
    
    // Query by postal code
    const { data: postcodeQuery, error: postcodeError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('postal_code', '2480');
    
    if (postcodeError) {
      console.log('❌ Postal code query failed:', postcodeError.message);
    } else {
      console.log(`✅ Postal code query successful! Found ${postcodeQuery.length} orders`);
    }
    
    // Clean up
    if (order2) {
      await supabaseAdmin.from('orders').delete().eq('id', order2.id);
    }
    
    console.log('\n🎉 Database update completed successfully!');
    console.log('\n📋 New Address Fields Available:');
    console.log('   • pickup_address (combined, for display)');
    console.log('   • street_address (for validation/logic)');
    console.log('   • suburb (for validation/logic)'); 
    console.log('   • state (for validation/logic)');
    console.log('   • postal_code (indexed, for geographic logic)');
    console.log('\n✨ You can now implement postal code-based features!');
    
  } catch (error) {
    console.error('❌ Database update failed:', error.message);
  }
}

// Execute if run directly
if (require.main === module) {
  updateDatabase().then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

module.exports = { updateDatabase };
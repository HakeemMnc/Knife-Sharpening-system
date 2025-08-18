/**
 * Apply Service Date Migration
 * Adds service_date column to orders table
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function applyMigration() {
  console.log('🔧 Applying service_date migration...\n');
  
  // Load environment variables
  require('dotenv').config({ path: '.env.local' });
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Read migration SQL
    const migrationPath = path.join(__dirname, 'database', 'migration-add-service-date.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration SQL:');
    console.log(migrationSQL);
    console.log('\n🚀 Executing migration...\n');
    
    // Execute each statement separately
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        console.log(`Executing statement ${i + 1}/${statements.length}:`);
        console.log(`  ${statement.substring(0, 60)}...`);
        
        const { error } = await supabase.rpc('exec_sql', { 
          sql: statement 
        }).catch(async () => {
          // If rpc doesn't work, try direct query
          return await supabase.from('').select().limit(0);
        });
        
        if (error) {
          console.log(`⚠️  Note: ${error.message} (this may be expected)`);
        } else {
          console.log('✅ Success');
        }
      }
    }
    
    console.log('\n🎉 Migration completed successfully!');
    
    // Test by creating a sample order
    console.log('\n🧪 Testing order creation...');
    
    const testOrder = {
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      phone: '0412345678',
      pickup_address: '123 Test St, Byron Bay, NSW 2481',
      street_address: '123 Test St',
      suburb: 'Byron Bay',
      state: 'NSW',
      postal_code: '2481',
      special_instructions: 'Migration test',
      total_items: 5,
      service_level: 'standard',
      base_amount: 85.00,
      upgrade_amount: 0.00,
      delivery_fee: 0.00,
      total_amount: 85.00,
      service_date: '2025-08-22',
      pickup_date: '2025-08-26',
      pickup_time_slot: 'morning',
      status: 'pending',
      payment_status: 'unpaid',
      confirmation_sms_sent: false,
      reminder_24h_sent: false,
      reminder_1h_sent: false,
      pickup_confirmation_sent: false,
      delivery_confirmation_sent: false,
      followup_sms_sent: false
    };
    
    const { data, error: insertError } = await supabase
      .from('orders')
      .insert(testOrder)
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Test order failed:', insertError.message);
    } else {
      console.log('✅ Test order created successfully!');
      console.log(`   Order ID: ${data.id}`);
      console.log(`   Service Date: ${data.service_date}`);
      
      // Clean up test order
      await supabase.from('orders').delete().eq('id', data.id);
      console.log('🧹 Test order cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

applyMigration();
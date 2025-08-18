const { createClient } = require('@supabase/supabase-js');

// Supabase credentials
const supabaseUrl = 'https://vxnybclsfuftmaokumer.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4bnliY2xzZnVmdG1hb2t1bWVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTAwNDg5NiwiZXhwIjoyMDcwNTgwODk2fQ.7bBlXhOqrbxG-mOAMXphlAWB85wvGcrNqbuL2MG4kBA';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndCreateTables() {
  console.log('🔍 Checking current database state...\n');
  
  try {
    // Check if tables exist
    console.log('1. Checking existing tables...');
    
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('id')
      .limit(1);
    
    let tablesExist = false;
    if (ordersError && ordersError.code === 'PGRST116') {
      console.log('⚠️  Orders table does not exist');
    } else if (ordersError) {
      console.log('❌ Error checking orders table:', ordersError.message);
    } else {
      console.log('✅ Orders table exists');
      tablesExist = true;
      
      // Check if new address fields exist
      console.log('\n2. Checking for new address fields...');
      
      const { data: testData, error: fieldError } = await supabaseAdmin
        .from('orders')
        .select('street_address, suburb, state, postal_code')
        .limit(1);
      
      if (fieldError) {
        console.log('❌ New address fields do not exist yet');
        console.log('   Error:', fieldError.message);
        
        console.log('\n📋 Manual Steps Required:');
        console.log('Since I cannot execute raw SQL directly, please:');
        console.log('\n1. Go to your Supabase Dashboard:');
        console.log('   https://supabase.com/dashboard/project/vxnybclsfuftmaokumer');
        console.log('\n2. Click "SQL Editor" in the left sidebar');
        console.log('\n3. Click "New Query"');
        console.log('\n4. Run these commands one by one:');
        console.log('\n-- Drop existing tables (safe since no valuable data):');
        console.log('DROP TABLE IF EXISTS sms_logs CASCADE;');
        console.log('DROP TABLE IF EXISTS orders CASCADE;');
        console.log('DROP TABLE IF EXISTS customers CASCADE;');
        console.log('\n-- Then copy and paste the entire contents of:');
        console.log('   database/schema.sql');
        console.log('\n5. Click "Run" to execute');
        
      } else {
        console.log('✅ New address fields already exist!');
        console.log('   Available fields: street_address, suburb, state, postal_code');
      }
    }
    
    if (!tablesExist) {
      console.log('\n📋 Tables need to be created:');
      console.log('\n1. Go to your Supabase Dashboard:');
      console.log('   https://supabase.com/dashboard/project/vxnybclsfuftmaokumer');
      console.log('\n2. Click "SQL Editor" in the left sidebar');
      console.log('\n3. Click "New Query"');
      console.log('\n4. Copy and paste the entire contents of:');
      console.log('   database/schema.sql');
      console.log('\n5. Click "Run" to execute');
    }
    
    // Test connection
    console.log('\n3. Testing database connection...');
    const { data: healthCheck } = await supabaseAdmin
      .from('orders')
      .select('count')
      .limit(0);
    console.log('✅ Database connection successful!');
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

// Run the check
checkAndCreateTables().then(() => {
  console.log('\n✅ Database check completed');
}).catch((error) => {
  console.error('❌ Check failed:', error);
});
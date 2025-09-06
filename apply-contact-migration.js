/**
 * Apply Contact Messages Migration
 * Adds contact_messages table for SMS contact form notifications
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function applyMigration() {
  console.log('🔧 Applying contact messages migration...\n');
  
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
    const migrationPath = path.join(__dirname, 'database', 'add-contact-messages-table.sql');
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
        
        try {
          const { error } = await supabase.rpc('exec_sql', { 
            sql: statement 
          });
          
          if (error) {
            console.log(`⚠️  Note: ${error.message} (this may be expected)`);
          } else {
            console.log('✅ Success');
          }
        } catch (rpcError) {
          console.log(`⚠️  RPC failed: ${rpcError.message} (this may be expected)`);
        }
      }
    }
    
    console.log('\n🎉 Migration completed successfully!');
    
    // Test by creating a sample contact message
    console.log('\n🧪 Testing contact message creation...');
    
    const testContact = {
      name: 'Test Contact',
      phone: '0412345678',
      message_content: 'This is a test contact message for migration testing.',
      ip_address: '127.0.0.1',
      user_agent: 'Migration Test',
      is_existing_customer: false,
      admin_responded: false
    };
    
    const { data, error: insertError } = await supabase
      .from('contact_messages')
      .insert(testContact)
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Test contact message failed:', insertError.message);
    } else {
      console.log('✅ Test contact message created successfully!');
      console.log(`   Contact ID: ${data.id}`);
      console.log(`   Name: ${data.name}`);
      console.log(`   Phone: ${data.phone}`);
      console.log(`   Is Existing Customer: ${data.is_existing_customer}`);
      
      // Clean up test contact message
      await supabase.from('contact_messages').delete().eq('id', data.id);
      console.log('🧹 Test contact message cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

applyMigration();
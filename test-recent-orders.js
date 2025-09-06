// Test script to check if recent orders exist in database
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRecentOrders() {
  console.log('🔍 Checking recent orders in database...\n');
  
  try {
    // Get all orders from the last 24 hours
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    const { data: recentOrders, error } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Database error:', error);
      return;
    }
    
    console.log(`✅ Found ${recentOrders.length} orders from the last 24 hours:\n`);
    
    recentOrders.forEach((order, index) => {
      console.log(`${index + 1}. Order #${order.id}`);
      console.log(`   Customer: ${order.first_name} ${order.last_name}`);
      console.log(`   Email: ${order.email}`);
      console.log(`   Service Date: ${order.service_date}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Payment Status: ${order.payment_status}`);
      console.log(`   Total: $${order.total_amount}`);
      console.log(`   Created: ${new Date(order.created_at).toLocaleString()}`);
      console.log(`   Stripe Payment ID: ${order.stripe_payment_id}`);
      console.log('');
    });
    
    // Also check what today is and what the admin page might be filtering
    const today = new Date();
    console.log('📅 Today is:', today.toLocaleDateString('en-AU', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }));
    
    console.log('📅 Tomorrow would be:', new Date(today.getTime() + 24*60*60*1000).toLocaleDateString('en-AU', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }));
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

checkRecentOrders();
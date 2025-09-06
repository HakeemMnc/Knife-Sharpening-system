// Check Stripe webhook endpoints
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function checkWebhooks() {
  console.log('🔍 Checking Stripe webhook endpoints...\n');
  
  try {
    const webhooks = await stripe.webhookEndpoints.list();
    
    if (webhooks.data.length === 0) {
      console.log('❌ No webhook endpoints found!');
      console.log('\n📋 You need to create a webhook endpoint in Stripe Dashboard:');
      console.log('   1. Go to: https://dashboard.stripe.com/webhooks');
      console.log('   2. Click "Add endpoint"');
      console.log('   3. Endpoint URL: https://northernriversknifessharpening.com/api/payments/webhook');
      console.log('   4. Events to send: payment_intent.succeeded');
      return;
    }
    
    console.log(`✅ Found ${webhooks.data.length} webhook endpoint(s):\n`);
    
    webhooks.data.forEach((webhook, index) => {
      console.log(`${index + 1}. Webhook ID: ${webhook.id}`);
      console.log(`   URL: ${webhook.url}`);
      console.log(`   Status: ${webhook.status}`);
      console.log(`   Events: ${webhook.enabled_events.join(', ')}`);
      console.log(`   Created: ${new Date(webhook.created * 1000).toLocaleString()}`);
      
      // Check if it's pointing to the right URL
      const expectedUrl = 'https://northernriversknifessharpening.com/api/payments/webhook';
      if (webhook.url === expectedUrl) {
        console.log(`   ✅ URL is correct`);
      } else {
        console.log(`   ❌ URL should be: ${expectedUrl}`);
      }
      
      // Check if payment_intent.succeeded is enabled
      if (webhook.enabled_events.includes('payment_intent.succeeded')) {
        console.log(`   ✅ payment_intent.succeeded is enabled`);
      } else {
        console.log(`   ❌ payment_intent.succeeded is NOT enabled`);
      }
      
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error checking webhooks:', error.message);
  }
}

checkWebhooks();
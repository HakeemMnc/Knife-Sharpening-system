// Debug script to test webhook logic locally
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function debugWebhook() {
  console.log('🔍 Debugging webhook logic...');
  
  // Get recent payment intents to see their metadata
  const paymentIntents = await stripe.paymentIntents.list({
    limit: 5,
  });
  
  console.log('\n📋 Recent Payment Intents:');
  paymentIntents.data.forEach((pi, index) => {
    console.log(`\n${index + 1}. Payment Intent: ${pi.id}`);
    console.log(`   Status: ${pi.status}`);
    console.log(`   Amount: ${pi.amount}`);
    console.log(`   Metadata:`, pi.metadata);
    
    // Check if this would trigger our webhook logic
    const orderId = pi.metadata.orderId ? parseInt(pi.metadata.orderId) : null;
    const hasOrderData = !!pi.metadata.orderDataJSON;
    
    console.log(`   Would find orderId: ${orderId ? 'YES' : 'NO'}`);
    console.log(`   Has orderDataJSON: ${hasOrderData ? 'YES' : 'NO'}`);
    
    if (hasOrderData) {
      try {
        const orderData = JSON.parse(pi.metadata.orderDataJSON);
        console.log(`   Order data preview:`, {
          firstName: orderData.firstName,
          email: orderData.email,
          totalItems: orderData.totalItems,
          totalAmount: orderData.totalAmount
        });
      } catch (e) {
        console.log(`   ❌ Error parsing orderDataJSON:`, e.message);
      }
    }
  });
}

debugWebhook().catch(console.error);
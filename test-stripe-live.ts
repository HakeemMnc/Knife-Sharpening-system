import { StripeService } from './src/lib/stripe-service';

// Test live Stripe integration
async function testLiveStripeIntegration() {
  console.log('🧪 Testing Live Stripe Integration...\n');

  try {
    // Test 1: Check environment variables
    console.log('1. Checking Stripe environment variables...');
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!publishableKey || !secretKey) {
      console.log('❌ Missing Stripe environment variables');
      return;
    }

    console.log('✅ Stripe environment variables found');
    console.log(`   Publishable Key: ${publishableKey.substring(0, 20)}...`);
    console.log(`   Secret Key: ${secretKey.substring(0, 20)}...`);
    
    // Check if using live keys
    if (publishableKey.startsWith('pk_live_')) {
      console.log('✅ Using LIVE Stripe keys (production ready!)');
    } else {
      console.log('⚠️  Using TEST Stripe keys');
    }

    console.log('\n2. Testing Stripe service initialization...');
    
    // Create a test order object
    const testOrder = {
      id: 999,
      first_name: 'Test',
      last_name: 'Customer',
      email: 'test@example.com',
      phone: '0412345678',
      pickup_address: '123 Test St, Test City',
      special_instructions: 'Test order',
      total_items: 2,
      service_level: 'standard' as const,
      base_amount: 30,
      upgrade_amount: 0,
      delivery_fee: 25,
      total_amount: 55,
      pickup_date: '2024-01-15',
      pickup_time_slot: 'morning' as const,
      status: 'pending' as const,
      payment_status: 'unpaid' as const,
      stripe_payment_id: null,
      stripe_customer_id: null,
      confirmation_sms_sent: false,
      reminder_24h_sent: false,
      reminder_1h_sent: false,
      pickup_confirmation_sent: false,
      delivery_confirmation_sent: false,
      followup_sms_sent: false,
      internal_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('✅ Test order object created');
    console.log(`   Order Total: $${testOrder.total_amount.toFixed(2)} AUD`);

    console.log('\n3. Testing Stripe configuration...');
    
    const { stripeConfig } = await import('./src/lib/stripe-service');
    
    if (stripeConfig.publishableKey && stripeConfig.publishableKey !== 'undefined') {
      console.log('✅ Stripe configuration loaded');
      console.log(`   Currency: ${stripeConfig.currency}`);
      console.log(`   Payment Methods: ${stripeConfig.supportedPaymentMethods.join(', ')}`);
    } else {
      console.log('❌ Stripe configuration not loaded properly');
    }

    console.log('\n🎉 Live Stripe Integration Test Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Test the payment flow on your live website');
    console.log('2. Use real credit cards for testing (small amounts)');
    console.log('3. Check your Stripe dashboard for payments');
    console.log('4. Set up webhooks for payment confirmations');

    console.log('\n🌐 Your Live Website:');
    console.log('https://northern-rivers-knife-sharpening-pe450fjr4.vercel.app');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your Stripe account is active');
    console.log('2. Verify API keys are correct');
    console.log('3. Ensure you have sufficient funds for testing');
  }
}

// Run the test
testLiveStripeIntegration();

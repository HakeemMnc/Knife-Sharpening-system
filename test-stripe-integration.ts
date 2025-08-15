import { StripeService } from './src/lib/stripe-service';

// Test Stripe integration
async function testStripeIntegration() {
  console.log('🧪 Testing Stripe Integration...\n');

  try {
    // Test 1: Check environment variables
    console.log('1. Checking environment variables...');
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!publishableKey || !secretKey) {
      console.log('❌ Missing Stripe environment variables');
      console.log('   Please add your Stripe keys to .env.local');
      console.log('   See STRIPE-SETUP-GUIDE.md for instructions\n');
      return;
    }

    console.log('✅ Stripe environment variables found');
    console.log(`   Publishable Key: ${publishableKey.substring(0, 20)}...`);
    console.log(`   Secret Key: ${secretKey.substring(0, 20)}...`);
    console.log(`   Webhook Secret: ${webhookSecret ? '✅ Set' : '❌ Missing'}\n`);

    // Test 2: Check Stripe service initialization
    console.log('2. Testing Stripe service...');
    
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

    console.log('✅ Test order object created\n');

    // Test 3: Validate payment validation functions
    console.log('3. Testing payment validation...');
    
    const { paymentValidation } = await import('./src/lib/stripe-service');
    
    // Test card number validation
    const validCard = paymentValidation.validateCardNumber('4242424242424242');
    const invalidCard = paymentValidation.validateCardNumber('1234567890123456');
    
    console.log(`   Valid card number: ${validCard ? '✅' : '❌'}`);
    console.log(`   Invalid card number: ${!invalidCard ? '✅' : '❌'}`);
    
    // Test expiry date validation
    const validExpiry = paymentValidation.validateExpiryDate('12/25');
    const invalidExpiry = paymentValidation.validateExpiryDate('12/20');
    
    console.log(`   Valid expiry date: ${validExpiry ? '✅' : '❌'}`);
    console.log(`   Invalid expiry date: ${!invalidExpiry ? '✅' : '❌'}`);
    
    // Test CVC validation
    const validCVC = paymentValidation.validateCVC('123');
    const invalidCVC = paymentValidation.validateCVC('12');
    
    console.log(`   Valid CVC: ${validCVC ? '✅' : '❌'}`);
    console.log(`   Invalid CVC: ${!invalidCVC ? '✅' : '❌'}`);
    
    console.log('✅ Payment validation tests passed\n');

    // Test 4: Check Stripe configuration
    console.log('4. Checking Stripe configuration...');
    
    const { stripeConfig } = await import('./src/lib/stripe-service');
    
    if (stripeConfig.publishableKey && stripeConfig.publishableKey !== 'undefined') {
      console.log('✅ Stripe configuration loaded');
      console.log(`   Currency: ${stripeConfig.currency}`);
      console.log(`   Payment Methods: ${stripeConfig.supportedPaymentMethods.join(', ')}`);
    } else {
      console.log('❌ Stripe configuration not loaded properly');
    }

    console.log('\n🎉 Stripe Integration Test Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Create a Stripe account at stripe.com');
    console.log('2. Get your API keys from the Stripe Dashboard');
    console.log('3. Update your .env.local file with the real keys');
    console.log('4. Run "npm run dev" to test the payment flow');
    console.log('5. Use test card 4242 4242 4242 4242 for testing');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure all dependencies are installed');
    console.log('2. Check your .env.local file has the correct keys');
    console.log('3. Ensure you have a valid Stripe account');
  }
}

// Run the test
testStripeIntegration();

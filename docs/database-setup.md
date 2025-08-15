# Database Setup Guide

## Overview

This guide will help you set up the optimized database schema for your Northern Rivers Knife Sharpening business. The database is designed to support the simplified booking flow, SMS automation, and operational workflow management.

## Prerequisites

- Supabase account (free tier available)
- Twilio account for SMS
- Stripe account for payments

## Step 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `northern-rivers-knife-sharpening`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your location (Australia)
6. Click "Create new project"

### 1.2 Get Database Credentials

1. Go to Project Settings → API
2. Copy the following values:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **Anon Public Key** (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - **Service Role Key** (SUPABASE_SERVICE_ROLE_KEY)

### 1.3 Run Database Schema

1. Go to SQL Editor in your Supabase dashboard
2. Copy the contents of `database/schema.sql`
3. Paste and execute the SQL script
4. Verify tables are created:
   - `orders`
   - `sms_logs`
   - `customers`

## Step 2: Environment Configuration

### 2.1 Create Environment File

1. Copy `env.example` to `.env.local`
2. Fill in your Supabase credentials:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 2.2 Install Dependencies

```bash
npm install
```

## Step 3: Twilio SMS Setup

### 3.1 Create Twilio Account

1. Go to [twilio.com](https://twilio.com)
2. Sign up for a free account
3. Verify your phone number
4. Get a Twilio phone number for SMS

### 3.2 Get Twilio Credentials

1. Go to Console Dashboard
2. Copy your credentials:
   - **Account SID**
   - **Auth Token**
   - **Phone Number**

### 3.3 Update Environment Variables

Add to your `.env.local`:

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

## Step 4: Stripe Payment Setup

### 4.1 Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Sign up for an account
3. Complete business verification
4. Get your API keys

### 4.2 Get Stripe Credentials

1. Go to Developers → API Keys
2. Copy your keys:
   - **Publishable Key**
   - **Secret Key**

### 4.3 Update Environment Variables

Add to your `.env.local`:

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## Step 5: Database Verification

### 5.1 Test Database Connection

Create a test script to verify everything works:

```typescript
// test-db.ts
import { DatabaseService, dbHelpers } from './lib/database';

async function testDatabase() {
  try {
    // Test order creation
    const testOrder = await DatabaseService.createOrder({
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
      pickup_date: dbHelpers.getNextMonday(),
      status: 'pending',
      payment_status: 'unpaid',
    });

    console.log('✅ Database connection successful');
    console.log('✅ Test order created:', testOrder.id);

    // Clean up test data
    await DatabaseService.updateOrder(testOrder.id, { status: 'cancelled' });
    console.log('✅ Test cleanup completed');

  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

testDatabase();
```

### 5.2 Run Database Test

```bash
npx tsx test-db.ts
```

## Step 6: SMS Testing

### 6.1 Test SMS Service

Create a test script for SMS:

```typescript
// test-sms.ts
import { SMSService } from './lib/sms-service';

async function testSMS() {
  try {
    const success = await SMSService.sendSMS(
      '0412345678', // Your test phone number
      'Test SMS from Northern Rivers Knife Sharpening',
      1, // Test order ID
      'confirmation'
    );

    if (success) {
      console.log('✅ SMS sent successfully');
    } else {
      console.log('❌ SMS failed');
    }
  } catch (error) {
    console.error('❌ SMS test failed:', error);
  }
}

testSMS();
```

## Step 7: Production Deployment

### 7.1 Environment Variables

For production deployment (Vercel, Netlify, etc.):

1. Add all environment variables to your hosting platform
2. Use production Stripe keys (not test keys)
3. Use production Twilio credentials

### 7.2 Database Backups

1. Set up automatic backups in Supabase
2. Configure backup retention policy
3. Test restore procedures

### 7.3 Monitoring

1. Set up Supabase monitoring
2. Configure SMS delivery tracking
3. Set up error alerting

## Database Schema Overview

### Orders Table

The main table storing all order information:

- **Customer Info**: Name, email, phone, address
- **Order Details**: Item count, service level
- **Pricing**: Base amount, upgrades, delivery fee, total
- **Scheduling**: Pickup date and time slot
- **Status Tracking**: Order and payment status
- **SMS Tracking**: Boolean flags for each SMS type
- **Timestamps**: Created and updated timestamps

### SMS Logs Table

Tracks all SMS communications:

- **Order Reference**: Links to orders table
- **SMS Details**: Type, content, status
- **Twilio Integration**: Message SID and delivery status
- **Error Handling**: Failed SMS error messages

### Customers Table

Optional table for repeat customers:

- **Customer Info**: Basic contact details
- **Order History**: Total orders and spending
- **Default Address**: For convenience

## Performance Optimization

### Indexes

The schema includes optimized indexes for:

- Email and phone lookups
- Date-based queries (pickup dates)
- Status-based filtering
- Composite queries (status + date)

### Query Optimization

Common queries are optimized for:

- Daily pickup lists
- SMS reminder automation
- Status updates
- Analytics and reporting

## Security Considerations

### Row Level Security (RLS)

Consider enabling RLS policies:

```sql
-- Example RLS policy for orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (email = current_user);
```

### Data Encryption

- Supabase encrypts data at rest
- All connections use TLS
- API keys should be kept secure

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check environment variables
   - Verify Supabase project is active
   - Check network connectivity

2. **SMS Not Sending**
   - Verify Twilio credentials
   - Check phone number format
   - Review Twilio account status

3. **Payment Processing Issues**
   - Verify Stripe keys
   - Check webhook configuration
   - Review Stripe dashboard for errors

### Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Twilio SMS API](https://www.twilio.com/docs/sms)
- [Stripe Documentation](https://stripe.com/docs)

## Next Steps

After completing this setup:

1. **Test the booking flow** end-to-end
2. **Set up automated SMS reminders**
3. **Configure payment webhooks**
4. **Set up monitoring and alerts**
5. **Train staff on the system**

Your database is now ready to support your knife sharpening business operations!

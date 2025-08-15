# Stripe Integration Setup Guide

## 🚀 Complete Stripe Setup for Northern Rivers Knife Sharpening

This guide will walk you through setting up Stripe payments for your knife sharpening business.

## 📋 Prerequisites

- A Stripe account (free to create)
- Your knife sharpening website running locally
- Basic understanding of webhooks

## 🔧 Step 1: Create Stripe Account

1. **Go to [stripe.com](https://stripe.com)** and click "Start now"
2. **Sign up** with your business email
3. **Complete account setup**:
   - Business information
   - Bank account details
   - Identity verification
4. **Note**: Use test mode for development

## 🔑 Step 2: Get Your API Keys

1. **Log into your Stripe Dashboard**
2. **Go to Developers → API keys**
3. **Copy these keys**:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

## 🌐 Step 3: Configure Webhooks

### For Development (Local Testing)

1. **Install Stripe CLI**:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Windows
   # Download from https://github.com/stripe/stripe-cli/releases
   ```

2. **Login to Stripe CLI**:
   ```bash
   stripe login
   ```

3. **Forward webhooks to your local server**:
   ```bash
   stripe listen --forward-to localhost:3000/api/payments/webhook
   ```

4. **Copy the webhook signing secret** (starts with `whsec_`)

### For Production

1. **In Stripe Dashboard**, go to **Developers → Webhooks**
2. **Click "Add endpoint"**
3. **Enter your production URL**:
   ```
   https://yourdomain.com/api/payments/webhook
   ```
4. **Select these events**:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. **Copy the webhook signing secret**

## ⚙️ Step 4: Update Environment Variables

Update your `.env.local` file with your actual Stripe keys:

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret
```

## 🧪 Step 5: Test the Integration

### Install Dependencies

```bash
npm install
```

### Test Payment Flow

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Fill out the booking form** with test data

3. **Use Stripe test card numbers**:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - **Requires Authentication**: `4000 0025 0000 3155`

4. **Test card details**:
   - **Expiry**: Any future date (e.g., `12/25`)
   - **CVC**: Any 3 digits (e.g., `123`)
   - **ZIP**: Any 5 digits (e.g., `12345`)

## 🔍 Step 6: Monitor Payments

### In Stripe Dashboard

1. **Go to Payments** to see all transactions
2. **Check Webhooks** for delivery status
3. **View Customer data** for repeat customers

### In Your Admin Dashboard

1. **Visit `/admin`** on your site
2. **Check order status** updates
3. **Monitor payment status** changes

## 🛡️ Step 7: Security Best Practices

### Environment Variables

- ✅ **Never commit API keys** to version control
- ✅ **Use different keys** for development and production
- ✅ **Rotate keys** regularly

### Webhook Security

- ✅ **Always verify webhook signatures**
- ✅ **Use HTTPS** in production
- ✅ **Handle webhook failures** gracefully

### PCI Compliance

- ✅ **Use Stripe Elements** (already implemented)
- ✅ **Never handle raw card data**
- ✅ **Follow Stripe's security guidelines**

## 🚀 Step 8: Go Live

### Switch to Live Mode

1. **In Stripe Dashboard**, toggle to **Live mode**
2. **Get live API keys** from Developers → API keys
3. **Update environment variables** with live keys
4. **Configure production webhook** endpoint
5. **Test with small amounts** first

### Production Checklist

- [ ] Live Stripe API keys configured
- [ ] Production webhook endpoint active
- [ ] SSL certificate installed
- [ ] Error handling tested
- [ ] Payment flow tested with real cards
- [ ] Admin dashboard monitoring payments
- [ ] SMS notifications working

## 📊 Step 9: Analytics & Monitoring

### Stripe Dashboard Features

- **Revenue tracking**
- **Customer analytics**
- **Payment method insights**
- **Refund management**
- **Dispute handling**

### Your Admin Dashboard

- **Order management**
- **Payment status tracking**
- **Customer information**
- **SMS automation logs**

## 🆘 Troubleshooting

### Common Issues

**Payment fails with "card declined"**
- Use test card numbers for development
- Check card details are correct
- Verify Stripe account is active

**Webhook not receiving events**
- Check webhook endpoint URL is correct
- Verify webhook secret matches
- Ensure server is accessible

**Payment intent creation fails**
- Check Stripe API keys are correct
- Verify order data is valid
- Check Stripe account permissions

### Getting Help

- **Stripe Documentation**: [stripe.com/docs](https://stripe.com/docs)
- **Stripe Support**: Available in your dashboard
- **Community**: [Stack Overflow](https://stackoverflow.com/questions/tagged/stripe)

## 🎉 Success!

Your knife sharpening business now has:

- ✅ **Secure payment processing**
- ✅ **Automatic order confirmation**
- ✅ **SMS notifications**
- ✅ **Admin dashboard**
- ✅ **Customer management**
- ✅ **Payment analytics**

You're ready to accept payments and grow your business! 🚀

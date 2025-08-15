# Northern Rivers Knife Sharpening - Database Setup

## 🎯 Overview

This repository contains an optimized database schema and automation system for the Northern Rivers Knife Sharpening business. The system is designed to handle the complete order lifecycle from booking to delivery with automated SMS communications.

## 🏗️ Architecture

### Core Components

1. **Database Schema** (`database/schema.sql`)
   - Optimized PostgreSQL tables for orders, SMS logs, and customers
   - Performance indexes for common queries
   - Automated timestamp updates

2. **Database Service** (`lib/database.ts`)
   - TypeScript interfaces for type safety
   - CRUD operations for all entities
   - Helper functions for common calculations

3. **SMS Automation** (`lib/sms-service.ts`)
   - Twilio integration for SMS sending
   - Automated message templates
   - Delivery status tracking

4. **Order Status Flow** (`docs/order-status-flow.md`)
   - 7-step order lifecycle
   - Status transition rules
   - Operational workflow documentation

## 📊 Database Schema

### Main Tables

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `orders` | Core order data | Customer info, pricing, status tracking, SMS flags |
| `sms_logs` | SMS communication tracking | Message history, delivery status, error handling |
| `customers` | Repeat customer data | Order history, spending patterns, default addresses |

### Order Status Flow

```
pending → paid → picked_up → sharpening → ready → delivered → completed
```

### SMS Automation Timeline

| SMS Type | Trigger | Purpose |
|----------|---------|---------|
| Confirmation | Payment successful | Order confirmation with pickup details |
| 24h Reminder | Day before pickup | Remind customer to prepare items |
| 1h Reminder | Hour before pickup | Final pickup reminder |
| Pickup Confirmation | Items collected | Confirm pickup and begin sharpening |
| Delivery Confirmation | Items delivered | Confirm delivery completion |
| Follow-up | 2 days post-delivery | Request feedback and encourage repeat business |

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `env.example` to `.env.local` and configure:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_phone_number

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key
STRIPE_SECRET_KEY=your_secret_key
```

### 3. Deploy Database Schema

1. Create Supabase project
2. Run `database/schema.sql` in Supabase SQL Editor
3. Verify tables and indexes are created

### 4. Test Setup

```bash
# Test database connection
npx tsx test-db.ts

# Test SMS functionality
npx tsx test-sms.ts
```

## 📈 Key Features

### ✅ Simplified Booking Flow
- Single form with item count
- Automatic pricing calculation
- Next Monday pickup scheduling
- Service level upgrades (standard/premium)

### ✅ Automated SMS Communications
- Order confirmation
- Pickup reminders (24h and 1h)
- Status updates throughout process
- Follow-up for feedback

### ✅ Operational Efficiency
- Daily pickup route optimization
- Status-based order filtering
- SMS delivery tracking
- Customer history for repeat business

### ✅ Payment Integration
- Stripe payment processing
- Automatic order status updates
- Payment failure handling
- Refund processing support

## 🔧 Database Operations

### Common Queries

```sql
-- Get today's pickups
SELECT * FROM orders 
WHERE pickup_date = CURRENT_DATE 
AND status IN ('paid', 'picked_up');

-- Get pending SMS reminders
SELECT * FROM orders 
WHERE pickup_date IN (CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day')
AND status = 'paid'
AND (reminder_24h_sent = false OR reminder_1h_sent = false);

-- Get orders ready for delivery
SELECT * FROM orders 
WHERE status = 'ready'
ORDER BY created_at ASC;
```

### API Operations

```typescript
// Create new order
const order = await DatabaseService.createOrder({
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  phone: '0412345678',
  pickup_address: '123 Main St, Byron Bay NSW 2481',
  total_items: 4,
  service_level: 'standard',
  // ... other fields
});

// Send SMS confirmation
await SMSService.sendOrderConfirmation(order);

// Update order status
await DatabaseService.updateOrder(order.id, { 
  status: 'picked_up' 
});
```

## 📱 SMS Templates

### Order Confirmation
```
Hi {firstName}! Your knife sharpening order #{orderId} has been confirmed for pickup on {pickupDate}. Total: ${totalAmount}. Please leave your items on your porch by 9am. Questions? Reply to this message.
```

### Pickup Reminder
```
Reminder: Your knife sharpening pickup is tomorrow ({pickupDate}). Please leave your {totalItems} items on your porch by 9am. Order #{orderId}
```

### Delivery Confirmation
```
Your sharpened items have been delivered! Please check your porch. We hope you love the results. Order #{orderId}. Thank you for choosing Northern Rivers Knife Sharpening!
```

## 🔒 Security & Performance

### Security Features
- Row Level Security (RLS) support
- Encrypted data at rest
- TLS connections
- Secure API key management

### Performance Optimizations
- Strategic database indexes
- Optimized query patterns
- Efficient status filtering
- SMS delivery tracking

### Monitoring
- SMS delivery rates
- Order status distribution
- Payment success rates
- Customer satisfaction metrics

## 📚 Documentation

- [Database Setup Guide](docs/database-setup.md) - Complete setup instructions
- [Order Status Flow](docs/order-status-flow.md) - Detailed workflow documentation
- [Environment Variables](env.example) - Configuration template

## 🛠️ Development

### File Structure

```
├── database/
│   └── schema.sql              # Database schema
├── lib/
│   ├── database.ts             # Database service
│   └── sms-service.ts          # SMS automation
├── docs/
│   ├── database-setup.md       # Setup guide
│   └── order-status-flow.md    # Workflow docs
├── env.example                 # Environment template
└── README-DATABASE.md          # This file
```

### Testing

```bash
# Test database operations
npm run test:db

# Test SMS functionality
npm run test:sms

# Test complete workflow
npm run test:workflow
```

## 🚀 Deployment

### Production Checklist

- [ ] Supabase project created and configured
- [ ] Database schema deployed
- [ ] Environment variables set
- [ ] Twilio account configured
- [ ] Stripe account configured
- [ ] SMS templates tested
- [ ] Payment flow tested
- [ ] Monitoring configured

### Hosting Platforms

- **Vercel**: Recommended for Next.js apps
- **Netlify**: Alternative hosting option
- **Railway**: Full-stack deployment
- **Supabase**: Database hosting (already configured)

## 📞 Support

### Common Issues

1. **Database Connection**: Check environment variables and Supabase project status
2. **SMS Not Sending**: Verify Twilio credentials and phone number format
3. **Payment Issues**: Check Stripe keys and webhook configuration

### Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Twilio SMS API](https://www.twilio.com/docs/sms)
- [Stripe Documentation](https://stripe.com/docs)

## 🎉 Success Metrics

### Operational Efficiency
- Reduced manual SMS sending
- Automated status tracking
- Streamlined pickup/delivery process
- Improved customer communication

### Business Impact
- Increased customer satisfaction
- Reduced no-shows for pickup
- Better order tracking
- Improved repeat business

---

**Ready to streamline your knife sharpening business operations?** 

Follow the [Database Setup Guide](docs/database-setup.md) to get started!

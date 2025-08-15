# Order Status Flow Documentation

## Order Lifecycle Overview

The knife sharpening business follows a streamlined 7-step order lifecycle designed for operational efficiency and customer communication.

### Status Flow Diagram

```
1. pending → 2. paid → 3. picked_up → 4. sharpening → 5. ready → 6. delivered → 7. completed
```

## Detailed Status Descriptions

### 1. `pending`
- **Trigger**: Customer completes booking form
- **Description**: Order created, awaiting payment
- **Actions Required**: 
  - Customer completes Stripe payment
  - System validates payment
- **SMS Sent**: None
- **Duration**: Minutes to hours

### 2. `paid`
- **Trigger**: Payment successful via Stripe
- **Description**: Payment confirmed, order ready for pickup
- **Actions Required**:
  - Send confirmation SMS
  - Schedule pickup for next Monday
- **SMS Sent**: Order confirmation
- **Duration**: Until pickup day

### 3. `picked_up`
- **Trigger**: Items collected from customer porch
- **Description**: Items in possession, ready for sharpening
- **Actions Required**:
  - Send pickup confirmation SMS
  - Begin sharpening process
- **SMS Sent**: Pickup confirmation
- **Duration**: 1-2 hours

### 4. `sharpening`
- **Trigger**: Sharpening process begins
- **Description**: Items being sharpened in workshop
- **Actions Required**:
  - Complete sharpening work
  - Quality check
- **SMS Sent**: None
- **Duration**: 2-4 hours

### 5. `ready`
- **Trigger**: Sharpening complete, items ready
- **Description**: Items sharpened and ready for delivery
- **Actions Required**:
  - Prepare for delivery
  - Schedule delivery
- **SMS Sent**: None
- **Duration**: Until delivery

### 6. `delivered`
- **Trigger**: Items returned to customer porch
- **Description**: Items delivered, customer notified
- **Actions Required**:
  - Send delivery confirmation SMS
  - Schedule follow-up SMS
- **SMS Sent**: Delivery confirmation
- **Duration**: 2 days

### 7. `completed`
- **Trigger**: Follow-up SMS sent
- **Description**: Order fully completed
- **Actions Required**:
  - Send follow-up SMS
  - Archive order
- **SMS Sent**: Follow-up
- **Duration**: Final state

## Payment Status Flow

### Payment Statuses

- **`unpaid`**: Default state, payment pending
- **`paid`**: Payment successful
- **`failed`**: Payment failed
- **`refunded`**: Payment refunded

### Payment Flow

```
unpaid → paid (successful payment)
unpaid → failed (payment failure)
paid → refunded (refund processed)
```

## SMS Automation Timeline

### Automatic SMS Triggers

| SMS Type | Trigger | Timing | Status Update |
|----------|---------|---------|---------------|
| Confirmation | Order payment successful | Immediate | `confirmation_sms_sent = true` |
| 24h Reminder | Day before pickup | 24h before pickup | `reminder_24h_sent = true` |
| 1h Reminder | Hour before pickup | 1h before pickup | `reminder_1h_sent = true` |
| Pickup Confirmation | Items collected | After pickup | `pickup_confirmation_sent = true` |
| Delivery Confirmation | Items delivered | After delivery | `delivery_confirmation_sent = true` |
| Follow-up | 2 days after delivery | 2 days post-delivery | `followup_sms_sent = true` |

## Operational Workflow

### Daily Operations

1. **Morning (7-9 AM)**
   - Check orders with `pickup_date = today`
   - Send 1-hour reminders
   - Prepare pickup route

2. **Midday (9 AM - 2 PM)**
   - Collect items from porches
   - Update orders to `picked_up`
   - Send pickup confirmations
   - Begin sharpening

3. **Afternoon (2-6 PM)**
   - Complete sharpening
   - Update orders to `ready`
   - Prepare delivery route

4. **Evening (6-8 PM)**
   - Deliver sharpened items
   - Update orders to `delivered`
   - Send delivery confirmations

### Weekly Operations

1. **Monday**: Pickup and delivery day
2. **Tuesday-Friday**: Sharpening and preparation
3. **Saturday**: Follow-up SMS for previous week's orders
4. **Sunday**: Route planning for next Monday

## Status Transition Rules

### Valid Transitions

```sql
-- Valid status transitions
pending → paid
paid → picked_up
picked_up → sharpening
sharpening → ready
ready → delivered
delivered → completed

-- Payment status transitions
unpaid → paid
unpaid → failed
paid → refunded
```

### Business Rules

1. **Payment Required**: Orders cannot progress beyond `pending` without payment
2. **Sequential Flow**: Status must follow the defined sequence
3. **Pickup Date**: Items can only be picked up on scheduled pickup date
4. **SMS Tracking**: Each SMS type can only be sent once per order
5. **Completion**: Orders must complete all steps before marking as `completed`

## Error Handling

### Common Scenarios

1. **Payment Failure**
   - Order remains `pending`
   - Payment status set to `failed`
   - Send payment reminder SMS

2. **Missed Pickup**
   - Reschedule for next Monday
   - Send rescheduling SMS
   - Update pickup date

3. **Delivery Issues**
   - Attempt redelivery
   - Contact customer if needed
   - Update internal notes

4. **SMS Failures**
   - Log error in `sms_logs`
   - Retry with exponential backoff
   - Manual intervention if needed

## Database Queries

### Common Status Queries

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

-- Get orders needing follow-up
SELECT * FROM orders 
WHERE status = 'delivered'
AND delivery_confirmation_sent = true
AND followup_sms_sent = false
AND updated_at < CURRENT_DATE - INTERVAL '2 days';
```

## Performance Considerations

### Indexing Strategy

- Primary indexes on `status`, `pickup_date`, `payment_status`
- Composite indexes for common query patterns
- SMS tracking indexes for automation queries

### Monitoring

- Track average time in each status
- Monitor SMS delivery rates
- Alert on stuck orders (>24h in same status)
- Daily status distribution reports

## Integration Points

### External Services

1. **Stripe**: Payment processing and webhooks
2. **Twilio**: SMS sending and delivery tracking
3. **Supabase**: Database and real-time updates

### Webhooks

- Stripe payment confirmation
- Twilio SMS delivery status
- Order status change notifications

This status flow ensures efficient operations while maintaining clear customer communication throughout the entire knife sharpening process.

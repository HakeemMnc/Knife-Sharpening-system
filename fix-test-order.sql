-- Update the test order to have proper SMS status fields
UPDATE orders 
SET 
  confirmation_sms_status = 'sent',
  reminder_24h_status = 'sent',
  morning_reminder_status = 'sent',
  pickup_sms_status = 'pending',
  delivery_sms_status = 'pending',
  followup_sms_status = 'pending',
  confirmation_sms_sent_at = NOW(),
  reminder_24h_sent_at = NOW(),
  morning_reminder_sent_at = NOW()
WHERE id = 1;
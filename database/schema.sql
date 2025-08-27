-- Northern Rivers Knife Sharpening Database Schema
-- Optimized for simplified booking flow with SMS automation support

-- Main Orders Table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  
  -- Customer Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  pickup_address TEXT NOT NULL, -- Combined address for backward compatibility
  street_address VARCHAR(255),
  suburb VARCHAR(100),
  state VARCHAR(10),
  postal_code VARCHAR(4),
  special_instructions TEXT,
  
  -- Order Details
  total_items INTEGER NOT NULL,
  service_level VARCHAR(20) NOT NULL DEFAULT 'standard', -- 'standard' or 'premium'
  
  -- Pricing Breakdown
  base_amount DECIMAL(10,2) NOT NULL, -- total_items × $17
  upgrade_amount DECIMAL(10,2) DEFAULT 0, -- $5 × items if premium
  delivery_fee DECIMAL(10,2) NOT NULL, -- $25 or $0
  total_amount DECIMAL(10,2) NOT NULL,
  
  -- Mobile Service Scheduling
  service_date DATE NOT NULL, -- Selected service date from mobile route
  pickup_date DATE, -- Legacy field - kept for backward compatibility
  
  -- Status Tracking
  status VARCHAR(20) DEFAULT 'pending', -- pending, paid, picked_up, sharpening, ready, delivered, completed
  payment_status VARCHAR(20) DEFAULT 'unpaid', -- unpaid, paid, refunded, failed
  
  -- Payment Information
  stripe_payment_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  
  -- SMS Automation Tracking (enhanced for new workflow)
  confirmation_sms_sent BOOLEAN DEFAULT FALSE,
  reminder_24h_sent BOOLEAN DEFAULT FALSE,
  morning_reminder_sent BOOLEAN DEFAULT FALSE,
  pickup_sms_sent BOOLEAN DEFAULT FALSE,
  delivery_sms_sent BOOLEAN DEFAULT FALSE,
  followup_sms_sent BOOLEAN DEFAULT FALSE,
  
  -- SMS Status Tracking (for UI indicators)
  confirmation_sms_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed'
  reminder_24h_status VARCHAR(20) DEFAULT 'pending',
  morning_reminder_status VARCHAR(20) DEFAULT 'pending',
  pickup_sms_status VARCHAR(20) DEFAULT 'pending',
  delivery_sms_status VARCHAR(20) DEFAULT 'pending',
  followup_sms_status VARCHAR(20) DEFAULT 'pending',
  
  -- SMS Timestamps
  confirmation_sms_sent_at TIMESTAMP,
  reminder_24h_sent_at TIMESTAMP,
  morning_reminder_sent_at TIMESTAMP,
  pickup_sms_sent_at TIMESTAMP,
  delivery_sms_sent_at TIMESTAMP,
  followup_sms_sent_at TIMESTAMP,
  
  -- Operational Notes
  internal_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- SMS Logs Table for tracking all SMS communications
CREATE TABLE sms_logs (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  sms_type VARCHAR(50) NOT NULL, -- 'confirmation', 'reminder_24h', 'morning_reminder', 'pickup', 'delivery', 'followup'
  phone_number VARCHAR(20) NOT NULL,
  message_content TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'sent', -- 'sent', 'failed', 'delivered', 'undelivered'
  twilio_sid VARCHAR(255),
  error_message TEXT,
  sent_at TIMESTAMP DEFAULT NOW(),
  delivered_at TIMESTAMP,
  direction VARCHAR(10) DEFAULT 'outbound' -- 'outbound' for sent SMS, 'inbound' for received replies
);

-- SMS Conversations Table for tracking customer replies and admin responses
CREATE TABLE sms_conversations (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  phone_number VARCHAR(20) NOT NULL,
  message_content TEXT NOT NULL,
  direction VARCHAR(10) NOT NULL, -- 'inbound' for customer replies, 'outbound' for admin responses
  twilio_sid VARCHAR(255),
  admin_user VARCHAR(100), -- Track which admin sent the message (for future multi-admin support)
  created_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP -- Track when admin has read customer replies
);

-- SMS Templates Table for managing message templates
CREATE TABLE sms_templates (
  id SERIAL PRIMARY KEY,
  template_name VARCHAR(50) UNIQUE NOT NULL, -- 'confirmation', 'reminder_24h', etc.
  template_content TEXT NOT NULL,
  description TEXT,
  placeholders TEXT[], -- Array of available placeholders like {Name}, {DD/MM}, etc.
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Customer Table for repeat customers (optional enhancement)
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  default_address TEXT,
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX idx_orders_email ON orders(email);
CREATE INDEX idx_orders_phone ON orders(phone);
CREATE INDEX idx_orders_service_date ON orders(service_date);
CREATE INDEX idx_orders_pickup_date ON orders(pickup_date); -- Legacy compatibility
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_stripe_payment_id ON orders(stripe_payment_id);
CREATE INDEX idx_orders_postal_code ON orders(postal_code);

-- SMS Logs Indexes
CREATE INDEX idx_sms_logs_order_id ON sms_logs(order_id);
CREATE INDEX idx_sms_logs_sms_type ON sms_logs(sms_type);
CREATE INDEX idx_sms_logs_status ON sms_logs(status);
CREATE INDEX idx_sms_logs_sent_at ON sms_logs(sent_at);
CREATE INDEX idx_sms_logs_direction ON sms_logs(direction);

-- SMS Conversations Indexes
CREATE INDEX idx_sms_conversations_order_id ON sms_conversations(order_id);
CREATE INDEX idx_sms_conversations_phone ON sms_conversations(phone_number);
CREATE INDEX idx_sms_conversations_direction ON sms_conversations(direction);
CREATE INDEX idx_sms_conversations_created_at ON sms_conversations(created_at);
CREATE INDEX idx_sms_conversations_read_at ON sms_conversations(read_at);

-- SMS Templates Indexes
CREATE INDEX idx_sms_templates_name ON sms_templates(template_name);
CREATE INDEX idx_sms_templates_active ON sms_templates(is_active);

-- Customer Indexes
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);

-- Composite Indexes for Common Queries
CREATE INDEX idx_orders_status_service_date ON orders(status, service_date);
CREATE INDEX idx_orders_status_pickup_date ON orders(status, pickup_date); -- Legacy compatibility
CREATE INDEX idx_orders_payment_status_created_at ON orders(payment_status, created_at);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sms_templates_updated_at BEFORE UPDATE ON sms_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert Default SMS Templates
INSERT INTO sms_templates (template_name, template_content, description, placeholders) VALUES
('confirmation', 'Hi {Name}, your knife sharpening service is confirmed for {DD/MM}. Please place your items in a secure location on your property by 8 am. For safety, wrap sharp items in a towel or place them in a box. I''ll have them back to you within an hour. – Northern Rivers Knife Sharpening', 'Order confirmation message sent when payment is received', ARRAY['Name', 'DD/MM']),

('reminder_24h', 'Hi {Name}, I''ll be collecting your items tomorrow between 8 am–2 pm. Please ensure they''re ready in a safe, accessible spot. Thank you – Northern Rivers Knife Sharpening', '24-hour reminder before service day', ARRAY['Name']),

('morning_reminder', 'Good morning {Name}, I''ll be collecting your items today between 8 am–2 pm. Please confirm your {ItemCount} are ready for pickup. Thank you – Northern Rivers Knife Sharpening', 'Morning of service reminder', ARRAY['Name', 'ItemCount']),

('pickup', 'Hi {Name}, I''ve collected your {ItemCount} items and I''m sharpening them now. I''ll let you know once they''re ready for return. – Northern Rivers Knife Sharpening', 'Pickup confirmation message', ARRAY['Name', 'ItemCount']),

('delivery', 'Hi {Name}, I''ve returned your professionally sharpened items. Thank you for choosing my service — I really appreciate it! Enjoy the cut. – Northern Rivers Knife Sharpening', 'Delivery confirmation message', ARRAY['Name']),

('followup', 'Hi {Name}, I hope you''re happy with your freshly sharpened items! If you are, I''d be so grateful if you left me a quick Google review — it helps others in the area find me: {ReviewLink} Thank you – Northern Rivers Knife Sharpening', '48-hour follow-up message', ARRAY['Name', 'ReviewLink']);

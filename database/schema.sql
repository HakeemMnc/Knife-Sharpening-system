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
  
  -- Scheduling
  pickup_date DATE NOT NULL, -- Next Monday
  pickup_time_slot VARCHAR(20) DEFAULT 'morning', -- 'morning', 'afternoon', 'evening'
  
  -- Status Tracking
  status VARCHAR(20) DEFAULT 'pending', -- pending, paid, picked_up, sharpening, ready, delivered, completed
  payment_status VARCHAR(20) DEFAULT 'unpaid', -- unpaid, paid, refunded, failed
  
  -- Payment Information
  stripe_payment_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  
  -- SMS Automation Tracking
  confirmation_sms_sent BOOLEAN DEFAULT FALSE,
  reminder_24h_sent BOOLEAN DEFAULT FALSE,
  reminder_1h_sent BOOLEAN DEFAULT FALSE,
  pickup_confirmation_sent BOOLEAN DEFAULT FALSE,
  delivery_confirmation_sent BOOLEAN DEFAULT FALSE,
  followup_sms_sent BOOLEAN DEFAULT FALSE,
  
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
  sms_type VARCHAR(50) NOT NULL, -- 'confirmation', 'reminder_24h', 'reminder_1h', 'pickup_confirmation', 'delivery_confirmation', 'followup'
  phone_number VARCHAR(20) NOT NULL,
  message_content TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'sent', -- 'sent', 'failed', 'delivered', 'undelivered'
  twilio_sid VARCHAR(255),
  error_message TEXT,
  sent_at TIMESTAMP DEFAULT NOW(),
  delivered_at TIMESTAMP
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
CREATE INDEX idx_orders_pickup_date ON orders(pickup_date);
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

-- Customer Indexes
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);

-- Composite Indexes for Common Queries
CREATE INDEX idx_orders_status_pickup_date ON orders(status, pickup_date);
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

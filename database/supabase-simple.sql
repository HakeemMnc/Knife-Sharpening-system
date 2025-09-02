-- Simple Supabase Booking Limits Setup
-- Run this in your Supabase SQL Editor

-- Create daily_limits table
CREATE TABLE IF NOT EXISTS daily_limits (
  id SERIAL PRIMARY KEY,
  limit_date DATE NOT NULL UNIQUE,
  limit_type VARCHAR(20) NOT NULL DEFAULT 'customers',
  max_customers INTEGER DEFAULT 7,
  max_items INTEGER DEFAULT 100,
  current_customers INTEGER DEFAULT 0,
  current_items INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  setting_type VARCHAR(20) DEFAULT 'string',
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_daily_limits_date ON daily_limits(limit_date);
CREATE INDEX IF NOT EXISTS idx_daily_limits_active ON daily_limits(is_active);
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('default_daily_customer_limit', '7', 'integer', 'Default maximum customers per day'),
('default_daily_item_limit', '100', 'integer', 'Default maximum items per day'),
('default_limit_type', 'customers', 'string', 'Default limit type: customers or items'),
('enable_booking_limits', 'true', 'boolean', 'Enable or disable booking limits globally')
ON CONFLICT (setting_key) DO NOTHING;

-- Disable Row Level Security for simpler access
ALTER TABLE daily_limits DISABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings DISABLE ROW LEVEL SECURITY;

-- Grant permissions to service role
GRANT ALL PRIVILEGES ON daily_limits TO service_role;
GRANT ALL PRIVILEGES ON system_settings TO service_role;
GRANT USAGE, SELECT ON SEQUENCE daily_limits_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE system_settings_id_seq TO service_role;
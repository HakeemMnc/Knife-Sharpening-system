-- Supabase-compatible Booking Limits Migration
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

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers
DROP TRIGGER IF EXISTS update_daily_limits_updated_at ON daily_limits;
CREATE TRIGGER update_daily_limits_updated_at 
  BEFORE UPDATE ON daily_limits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at 
  BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Initialize limits for the next 30 days with default settings
DO $$
DECLARE
  current_date DATE := CURRENT_DATE;
  end_date DATE := CURRENT_DATE + INTERVAL '30 days';
BEGIN
  WHILE current_date <= end_date LOOP
    INSERT INTO daily_limits (
      limit_date,
      limit_type,
      max_customers,
      max_items,
      current_customers,
      current_items,
      is_active
    ) VALUES (
      current_date,
      'customers',
      7,
      100,
      0,
      0,
      true
    ) ON CONFLICT (limit_date) DO NOTHING;
    
    current_date := current_date + INTERVAL '1 day';
  END LOOP;
END $$;

-- Count existing orders and update current counts
UPDATE daily_limits 
SET 
  current_customers = (
    SELECT COUNT(*)
    FROM orders 
    WHERE service_date = daily_limits.limit_date 
    AND status NOT IN ('cancelled', 'refunded')
  ),
  current_items = (
    SELECT COALESCE(SUM(total_items), 0)
    FROM orders 
    WHERE service_date = daily_limits.limit_date 
    AND status NOT IN ('cancelled', 'refunded')
  )
WHERE limit_date >= CURRENT_DATE - INTERVAL '7 days';

-- Enable Row Level Security (RLS) for Supabase
ALTER TABLE daily_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (admin access)
-- Note: Adjust these policies based on your auth setup
CREATE POLICY "Allow authenticated users to read daily_limits" ON daily_limits
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to modify daily_limits" ON daily_limits
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read system_settings" ON system_settings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to modify system_settings" ON system_settings
  FOR ALL TO authenticated USING (true);

-- Grant permissions to service role
GRANT ALL ON daily_limits TO service_role;
GRANT ALL ON system_settings TO service_role;

-- Display current setup
SELECT 
  'Tables created successfully' AS message,
  (SELECT COUNT(*) FROM daily_limits) AS daily_limits_count,
  (SELECT COUNT(*) FROM system_settings) AS settings_count;
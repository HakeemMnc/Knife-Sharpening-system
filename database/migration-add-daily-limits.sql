-- Migration: Add Daily Booking Limits System
-- This adds support for limiting bookings per day by customer count or item count

-- Create daily_limits table for tracking booking limits
CREATE TABLE daily_limits (
  id SERIAL PRIMARY KEY,
  limit_date DATE NOT NULL,
  limit_type VARCHAR(20) NOT NULL DEFAULT 'customers', -- 'customers' or 'items'
  max_customers INTEGER DEFAULT 7, -- Default to 7 customers per day
  max_items INTEGER, -- Optional item-based limit
  current_customers INTEGER DEFAULT 0, -- Current booking count for customers
  current_items INTEGER DEFAULT 0, -- Current booking count for items
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT, -- Optional notes for admin (e.g., "Holiday closure", "Half day")
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(limit_date) -- Only one limit configuration per date
);

-- Create system_settings table for global limit defaults
CREATE TABLE system_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  setting_type VARCHAR(20) DEFAULT 'string', -- 'string', 'integer', 'boolean', 'json'
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_daily_limits_date ON daily_limits(limit_date);
CREATE INDEX idx_daily_limits_active ON daily_limits(is_active);
CREATE INDEX idx_daily_limits_type ON daily_limits(limit_type);
CREATE INDEX idx_system_settings_key ON system_settings(setting_key);

-- Add updated_at trigger for daily_limits
CREATE TRIGGER update_daily_limits_updated_at BEFORE UPDATE ON daily_limits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('default_daily_customer_limit', '7', 'integer', 'Default maximum customers per day'),
('default_daily_item_limit', '100', 'integer', 'Default maximum items per day (optional)'),
('default_limit_type', 'customers', 'string', 'Default limit type: customers or items'),
('enable_booking_limits', 'true', 'boolean', 'Enable or disable booking limits globally');

-- Function to get or create daily limit for a specific date
CREATE OR REPLACE FUNCTION get_or_create_daily_limit(target_date DATE)
RETURNS daily_limits AS $$
DECLARE
    limit_record daily_limits;
    default_customer_limit INTEGER;
    default_item_limit INTEGER;
    default_type VARCHAR(20);
BEGIN
    -- Try to get existing limit
    SELECT * INTO limit_record FROM daily_limits WHERE limit_date = target_date;
    
    -- If not found, create one with defaults
    IF NOT FOUND THEN
        -- Get default settings
        SELECT CAST(setting_value AS INTEGER) INTO default_customer_limit 
        FROM system_settings WHERE setting_key = 'default_daily_customer_limit';
        
        SELECT CAST(setting_value AS INTEGER) INTO default_item_limit 
        FROM system_settings WHERE setting_key = 'default_daily_item_limit';
        
        SELECT setting_value INTO default_type 
        FROM system_settings WHERE setting_key = 'default_limit_type';
        
        -- Create new limit record
        INSERT INTO daily_limits (
            limit_date, 
            limit_type, 
            max_customers, 
            max_items, 
            current_customers, 
            current_items
        ) VALUES (
            target_date, 
            COALESCE(default_type, 'customers'),
            COALESCE(default_customer_limit, 7),
            COALESCE(default_item_limit, 100),
            0,
            0
        ) RETURNING * INTO limit_record;
    END IF;
    
    RETURN limit_record;
END;
$$ LANGUAGE plpgsql;

-- Function to check if booking is allowed for a date
CREATE OR REPLACE FUNCTION can_book_for_date(
    target_date DATE, 
    customer_count INTEGER DEFAULT 1, 
    item_count INTEGER DEFAULT 1
) RETURNS BOOLEAN AS $$
DECLARE
    limit_record daily_limits;
    booking_enabled BOOLEAN;
BEGIN
    -- Check if booking limits are enabled globally
    SELECT CAST(setting_value AS BOOLEAN) INTO booking_enabled 
    FROM system_settings WHERE setting_key = 'enable_booking_limits';
    
    -- If limits disabled, always allow booking
    IF NOT COALESCE(booking_enabled, true) THEN
        RETURN true;
    END IF;
    
    -- Get or create limit record for the date
    SELECT * INTO limit_record FROM get_or_create_daily_limit(target_date);
    
    -- Check if limit is active
    IF NOT limit_record.is_active THEN
        RETURN false; -- Bookings disabled for this date
    END IF;
    
    -- Check limits based on type
    IF limit_record.limit_type = 'customers' THEN
        RETURN (limit_record.current_customers + customer_count) <= limit_record.max_customers;
    ELSIF limit_record.limit_type = 'items' THEN
        RETURN (limit_record.current_items + item_count) <= limit_record.max_items;
    ELSE
        -- Check both limits if type is mixed/unknown
        RETURN (limit_record.current_customers + customer_count) <= limit_record.max_customers 
            AND (limit_record.current_items + item_count) <= limit_record.max_items;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to increment booking counts when an order is created
CREATE OR REPLACE FUNCTION increment_daily_booking_count(
    target_date DATE,
    customer_count INTEGER DEFAULT 1,
    item_count INTEGER DEFAULT 1
) RETURNS VOID AS $$
DECLARE
    limit_record daily_limits;
BEGIN
    -- Get or create limit record
    SELECT * INTO limit_record FROM get_or_create_daily_limit(target_date);
    
    -- Update counts
    UPDATE daily_limits 
    SET 
        current_customers = current_customers + customer_count,
        current_items = current_items + item_count,
        updated_at = NOW()
    WHERE limit_date = target_date;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement booking counts when an order is cancelled
CREATE OR REPLACE FUNCTION decrement_daily_booking_count(
    target_date DATE,
    customer_count INTEGER DEFAULT 1,
    item_count INTEGER DEFAULT 1
) RETURNS VOID AS $$
BEGIN
    UPDATE daily_limits 
    SET 
        current_customers = GREATEST(0, current_customers - customer_count),
        current_items = GREATEST(0, current_items - item_count),
        updated_at = NOW()
    WHERE limit_date = target_date;
END;
$$ LANGUAGE plpgsql;

-- Function to recalculate daily counts from actual orders (for data consistency)
CREATE OR REPLACE FUNCTION recalculate_daily_counts(target_date DATE DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
    date_record RECORD;
BEGIN
    -- If specific date provided, recalculate just that date
    IF target_date IS NOT NULL THEN
        -- Get or create the limit record first
        PERFORM get_or_create_daily_limit(target_date);
        
        UPDATE daily_limits SET
            current_customers = (
                SELECT COUNT(*)
                FROM orders 
                WHERE service_date = target_date 
                AND status NOT IN ('cancelled', 'refunded')
            ),
            current_items = (
                SELECT COALESCE(SUM(total_items), 0)
                FROM orders 
                WHERE service_date = target_date 
                AND status NOT IN ('cancelled', 'refunded')
            ),
            updated_at = NOW()
        WHERE limit_date = target_date;
    ELSE
        -- Recalculate for all dates in daily_limits table
        FOR date_record IN 
            SELECT DISTINCT limit_date FROM daily_limits
        LOOP
            UPDATE daily_limits SET
                current_customers = (
                    SELECT COUNT(*)
                    FROM orders 
                    WHERE service_date = date_record.limit_date 
                    AND status NOT IN ('cancelled', 'refunded')
                ),
                current_items = (
                    SELECT COALESCE(SUM(total_items), 0)
                    FROM orders 
                    WHERE service_date = date_record.limit_date 
                    AND status NOT IN ('cancelled', 'refunded')
                ),
                updated_at = NOW()
            WHERE limit_date = date_record.limit_date;
        END LOOP;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create a view for easy querying of daily booking status
CREATE OR REPLACE VIEW daily_booking_status AS
SELECT 
    dl.limit_date,
    dl.limit_type,
    dl.max_customers,
    dl.max_items,
    dl.current_customers,
    dl.current_items,
    dl.is_active,
    dl.notes,
    CASE 
        WHEN dl.limit_type = 'customers' THEN 
            dl.max_customers - dl.current_customers
        WHEN dl.limit_type = 'items' THEN 
            dl.max_items - dl.current_items
        ELSE 
            LEAST(dl.max_customers - dl.current_customers, dl.max_items - dl.current_items)
    END as spots_remaining,
    CASE 
        WHEN NOT dl.is_active THEN 'closed'
        WHEN dl.limit_type = 'customers' AND dl.current_customers >= dl.max_customers THEN 'full'
        WHEN dl.limit_type = 'items' AND dl.current_items >= dl.max_items THEN 'full'
        WHEN dl.limit_type NOT IN ('customers', 'items') AND 
             (dl.current_customers >= dl.max_customers OR dl.current_items >= dl.max_items) THEN 'full'
        ELSE 'available'
    END as availability_status,
    dl.created_at,
    dl.updated_at
FROM daily_limits dl
ORDER BY dl.limit_date;

-- Initialize limits for next 30 days with current bookings
DO $$
DECLARE
    current_date DATE := CURRENT_DATE;
    end_date DATE := CURRENT_DATE + INTERVAL '30 days';
BEGIN
    WHILE current_date <= end_date LOOP
        PERFORM get_or_create_daily_limit(current_date);
        current_date := current_date + INTERVAL '1 day';
    END LOOP;
END $$;

-- Recalculate current counts from existing orders
SELECT recalculate_daily_counts();
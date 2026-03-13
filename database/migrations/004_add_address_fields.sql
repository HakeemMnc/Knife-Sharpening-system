-- Migration to add separate address fields to existing orders table
-- Run this on your Supabase database to add the new address fields

-- Add new address columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS street_address VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS suburb VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS state VARCHAR(10);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS postal_code VARCHAR(4);

-- Add index for postal code lookups
CREATE INDEX IF NOT EXISTS idx_orders_postal_code ON orders(postal_code);

-- Update the customers table default_address comment for clarity
COMMENT ON COLUMN customers.default_address IS 'Legacy combined address field - use separate address fields for new records';

-- Add comments to new fields
COMMENT ON COLUMN orders.pickup_address IS 'Combined address for backward compatibility and display';
COMMENT ON COLUMN orders.street_address IS 'Street number and name (e.g., 123 Main Street)';
COMMENT ON COLUMN orders.suburb IS 'Suburb/city name';
COMMENT ON COLUMN orders.state IS 'State abbreviation (e.g., NSW, VIC)';
COMMENT ON COLUMN orders.postal_code IS 'Australian postal code (4 digits)';
-- Migration: Add service_date column for mobile service scheduling
-- This migration adds support for mobile service scheduling by adding service_date column

-- Add the service_date column
ALTER TABLE orders 
ADD COLUMN service_date DATE;

-- Create index for service_date
CREATE INDEX IF NOT EXISTS idx_orders_service_date ON orders(service_date);

-- Create composite index for status and service_date queries
CREATE INDEX IF NOT EXISTS idx_orders_status_service_date ON orders(status, service_date);

-- Update existing records to use pickup_date as service_date for backward compatibility
-- This ensures existing orders don't break
UPDATE orders 
SET service_date = pickup_date 
WHERE service_date IS NULL;

-- Make service_date NOT NULL after populating existing records
ALTER TABLE orders 
ALTER COLUMN service_date SET NOT NULL;

-- Add comment to explain the columns
COMMENT ON COLUMN orders.service_date IS 'Selected service date for mobile sharpening (new model)';
COMMENT ON COLUMN orders.pickup_date IS 'Legacy pickup date field (kept for backward compatibility)';
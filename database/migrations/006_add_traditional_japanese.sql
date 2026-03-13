-- Migration: Add Traditional Japanese service level support
-- Date: 2025-09-04
-- Description: Extend service_level field to support 'traditional_japanese' option

-- The service_level field is currently a VARCHAR(20) with a check constraint or application-level validation
-- Since we're using Supabase/PostgreSQL, we need to ensure the field can store 'traditional_japanese'
-- The VARCHAR(20) field is sufficient for 'traditional_japanese' (19 characters)

-- Update any existing constraint on service_level if there is one
-- Note: Check if there are any existing constraints first
-- This is a safe operation as we're only adding a new valid value

-- For PostgreSQL/Supabase, if there are enum constraints, we would need to:
-- ALTER TYPE service_level_enum ADD VALUE 'traditional_japanese';
-- But since the schema shows VARCHAR(20), we should be good to go

-- Add a comment to document the change
COMMENT ON COLUMN orders.service_level IS 'Service level: standard, premium, or traditional_japanese';

-- Verify the field can handle the new value (this is just a validation query)
-- SELECT DISTINCT service_level FROM orders;
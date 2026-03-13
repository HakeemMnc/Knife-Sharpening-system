-- Coupons Table for Northern Rivers Knife Sharpening
-- Run this SQL in your Supabase SQL Editor

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  description VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster code lookups
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);

-- Enable Row Level Security
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access for active coupons (for validation)
CREATE POLICY "Allow public read active coupons" ON coupons
  FOR SELECT
  USING (is_active = true);

-- Policy: Allow service role full access (for admin operations)
CREATE POLICY "Allow service role full access" ON coupons
  FOR ALL
  USING (auth.role() = 'service_role');

-- Insert the first 25% off coupon
INSERT INTO coupons (code, discount_percent, description, is_active)
VALUES ('WELCOME25', 25, '25% off your first order', true)
ON CONFLICT (code) DO NOTHING;

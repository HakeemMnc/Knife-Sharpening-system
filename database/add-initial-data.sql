-- Add initial booking limits for next 30 days
-- Run this AFTER the simple setup works

INSERT INTO daily_limits (limit_date, limit_type, max_customers, max_items, current_customers, current_items, is_active)
SELECT 
  (CURRENT_DATE + INTERVAL '1 day' * generate_series(0, 29))::DATE as limit_date,
  'customers' as limit_type,
  7 as max_customers,
  100 as max_items,
  0 as current_customers,
  0 as current_items,
  true as is_active
ON CONFLICT (limit_date) DO NOTHING;

-- Update current counts based on existing orders
UPDATE daily_limits 
SET current_customers = subq.customer_count,
    current_items = subq.item_count
FROM (
  SELECT 
    service_date,
    COUNT(*) as customer_count,
    COALESCE(SUM(total_items), 0) as item_count
  FROM orders 
  WHERE service_date IS NOT NULL
    AND status NOT IN ('cancelled', 'refunded')
    AND service_date >= CURRENT_DATE - INTERVAL '7 days'
  GROUP BY service_date
) subq
WHERE daily_limits.limit_date = subq.service_date;

-- Show results
SELECT COUNT(*) as total_limits_created FROM daily_limits;
-- Add initial booking limits for next 30 days (Fixed version)
-- Run this AFTER the simple setup works

-- Insert daily limits for the next 30 days, one by one
INSERT INTO daily_limits (limit_date, limit_type, max_customers, max_items, current_customers, current_items, is_active) VALUES
(CURRENT_DATE + 1, 'customers', 7, 100, 0, 0, true),
(CURRENT_DATE + 2, 'customers', 7, 100, 0, 0, true),
(CURRENT_DATE + 3, 'customers', 7, 100, 0, 0, true),
(CURRENT_DATE + 4, 'customers', 7, 100, 0, 0, true),
(CURRENT_DATE + 5, 'customers', 7, 100, 0, 0, true),
(CURRENT_DATE + 6, 'customers', 7, 100, 0, 0, true),
(CURRENT_DATE + 7, 'customers', 7, 100, 0, 0, true),
(CURRENT_DATE + 8, 'customers', 7, 100, 0, 0, true),
(CURRENT_DATE + 9, 'customers', 7, 100, 0, 0, true),
(CURRENT_DATE + 10, 'customers', 7, 100, 0, 0, true),
(CURRENT_DATE + 11, 'customers', 7, 100, 0, 0, true),
(CURRENT_DATE + 12, 'customers', 7, 100, 0, 0, true),
(CURRENT_DATE + 13, 'customers', 7, 100, 0, 0, true),
(CURRENT_DATE + 14, 'customers', 7, 100, 0, 0, true),
(CURRENT_DATE + 15, 'customers', 7, 100, 0, 0, true),
(CURRENT_DATE + 16, 'customers', 7, 100, 0, 0, true),
(CURRENT_DATE + 17, 'customers', 7, 100, 0, 0, true),
(CURRENT_DATE + 18, 'customers', 7, 100, 0, 0, true),
(CURRENT_DATE + 19, 'customers', 7, 100, 0, 0, true),
(CURRENT_DATE + 20, 'customers', 7, 100, 0, 0, true),
(CURRENT_DATE + 21, 'customers', 7, 100, 0, 0, true),
(CURRENT_DATE + 22, 'customers', 7, 100, 0, 0, true),
(CURRENT_DATE + 23, 'customers', 7, 100, 0, 0, true),
(CURRENT_DATE + 24, 'customers', 7, 100, 0, 0, true),
(CURRENT_DATE + 25, 'customers', 7, 100, 0, 0, true),
(CURRENT_DATE + 26, 'customers', 7, 100, 0, 0, true),
(CURRENT_DATE + 27, 'customers', 7, 100, 0, 0, true),
(CURRENT_DATE + 28, 'customers', 7, 100, 0, 0, true),
(CURRENT_DATE + 29, 'customers', 7, 100, 0, 0, true),
(CURRENT_DATE + 30, 'customers', 7, 100, 0, 0, true)
ON CONFLICT (limit_date) DO NOTHING;

-- Count and show existing orders by service date
SELECT 
  service_date,
  COUNT(*) as customer_count,
  SUM(total_items) as item_count
FROM orders 
WHERE service_date IS NOT NULL
  AND service_date >= CURRENT_DATE - INTERVAL '7 days'
  AND status NOT IN ('cancelled', 'refunded')
GROUP BY service_date
ORDER BY service_date;

-- Show created limits
SELECT 
  limit_date,
  max_customers,
  current_customers,
  (max_customers - current_customers) as spots_remaining
FROM daily_limits 
WHERE limit_date >= CURRENT_DATE
ORDER BY limit_date
LIMIT 10;
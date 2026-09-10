-- Run this in Supabase SQL Editor

-- 1. Add kot_number column to active_orders
ALTER TABLE active_orders ADD COLUMN kot_number INTEGER;

-- 2. Create sequence for daily KOT numbers
CREATE SEQUENCE kot_daily_seq START 1;

-- 3. Create function to generate daily KOT number
CREATE OR REPLACE FUNCTION generate_kot_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Use date-based prefix + daily sequence
  NEW.kot_number := nextval('kot_daily_seq');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger to auto-assign KOT number on insert
CREATE TRIGGER set_kot_number
  BEFORE INSERT ON active_orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_kot_number();

-- 5. Reset sequence daily (run this daily or use pg_cron)
-- For now, manual reset: SELECT setval('kot_daily_seq', 1);

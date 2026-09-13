-- Run this in Supabase SQL Editor after supabase-setup.sql and supabase-kot.sql

-- 1. Categories table (dynamic, replaces hardcoded CATEGORIES array)
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- Seed default categories
INSERT INTO categories (name, sort_order) VALUES
  ('Breakfast', 1),
  ('Rice & Biriyani', 2),
  ('Special', 3),
  ('Fish Fry & Curry', 4),
  ('Homely Special', 5),
  ('Non Veg Curry', 6),
  ('Egg Special', 7),
  ('Starters', 8),
  ('Shawarma', 9),
  ('Alfam', 10),
  ('Mandi', 11),
  ('Fried Rice & Noodles', 12),
  ('Chinese', 13),
  ('Juice & Shakes', 14)
ON CONFLICT (name) DO NOTHING;

-- 2. Order history table (archive completed orders)
CREATE TABLE IF NOT EXISTS orders_history (
  id UUID PRIMARY KEY,
  table_number TEXT NOT NULL,
  items JSONB NOT NULL,
  total_amount NUMERIC NOT NULL,
  kot_number INTEGER,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for orders_history: anyone can read, authenticated can write
ALTER TABLE orders_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read orders_history" ON orders_history FOR SELECT USING (true);
CREATE POLICY "Allow insert orders_history" ON orders_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow delete orders_history" ON orders_history FOR DELETE USING (true);

-- 3. Users table (simple PIN auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  pin TEXT NOT NULL,
  role TEXT DEFAULT 'staff' CHECK (role IN ('owner', 'staff')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for users: no public access
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- No public policies = no anonymous access to users table

-- 4. Add category_id to menu_items for dynamic categories
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id);

-- 5. Enable RLS on menu_items with proper policies
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read menu_items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Allow insert menu_items" ON menu_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update menu_items" ON menu_items FOR UPDATE USING (true);
CREATE POLICY "Allow delete menu_items" ON menu_items FOR DELETE USING (true);

-- 6. Enable RLS on active_orders
ALTER TABLE active_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all active_orders" ON active_orders FOR ALL USING (true) WITH CHECK (true);

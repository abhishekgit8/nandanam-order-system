-- Nandanam: Auto-set veg/non-veg + food emojis for all 181 items
-- Run this ONCE in Supabase SQL Editor

-- 1. Add veg column (if not exists)
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS veg BOOLEAN DEFAULT true;

-- 2. Default all to veg first
UPDATE menu_items SET veg = true;

-- 3. Mark Egg items as non-veg
UPDATE menu_items SET veg = false WHERE name ILIKE '%egg%';

-- 4. Mark Chicken items as non-veg
UPDATE menu_items SET veg = false WHERE name ILIKE '%chicken%';

-- 5. Mark Mutton items as non-veg
UPDATE menu_items SET veg = false WHERE name ILIKE '%mutton%';

-- 6. Mark Pothu (goat meat) items as non-veg
UPDATE menu_items SET veg = false WHERE name ILIKE '%pothu%';

-- 7. Mark Kada (quail) items as non-veg
UPDATE menu_items SET veg = false WHERE name ILIKE '%kada%';

-- 8. Mark Fish items as non-veg
UPDATE menu_items SET veg = false WHERE name ILIKE '%fish%';
UPDATE menu_items SET veg = false WHERE category = 'Fish Fry & Curry';

-- 9. Mark Prawns items as non-veg
UPDATE menu_items SET veg = false WHERE name ILIKE '%prawn%';

-- 10. Mark Squid items as non-veg
UPDATE menu_items SET veg = false WHERE name ILIKE '%squid%';

-- 11. Mark Shawarma as non-veg
UPDATE menu_items SET veg = false WHERE category = 'Shawarma';

-- 12. Mark Alfam as non-veg
UPDATE menu_items SET veg = false WHERE category = 'Alfam';

-- 13. Mark Mandi as non-veg
UPDATE menu_items SET veg = false WHERE category = 'Mandi';

-- 14. Mark Non Veg Curry as non-veg
UPDATE menu_items SET veg = false WHERE category = 'Non Veg Curry';

-- 15. Mark BDF as non-veg (Beef Dry Fry)
UPDATE menu_items SET veg = false WHERE name = 'BDF';

-- 16. Mark specific Homely Special non-veg items
UPDATE menu_items SET veg = false WHERE name IN ('Kanji & Fish Fry', 'Kanji & Chicken Fry', 'Chatti Choru', 'Bellari Pothu Fry', 'Kanthari Pothu Fry');

-- 17. Mark specific Special category non-veg items
UPDATE menu_items SET veg = false WHERE name IN (
  'Kappa Mix Fish', 'Kappa Mix Chicken', 'Kappa Mix Pothu',
  'Puttu Mix Egg', 'Puttu Mix Chicken', 'Puttu Mix Pothu',
  'Kizhi Porotta Chicken', 'Kizhi Porotta Pothu',
  'Pothi Porotta Chicken', 'Pothi Porotta Pothu',
  'Kothu Porotta Egg', 'Kothu Porotta Chicken', 'Kothu Porotta Pothu',
  'Pathal Mix Pothu'
);

-- 18. Mark specific Starters non-veg items
UPDATE menu_items SET veg = false WHERE name ILIKE '%kabab%' OR name ILIKE '%chilli chicken%' OR name ILIKE '%garlic chicken%' OR name ILIKE '%pepper chicken%' OR name ILIKE '%lemon chicken%' OR name ILIKE '%ginger chicken%';

-- 19. Mark specific Chinese non-veg items
UPDATE menu_items SET veg = false WHERE name IN ('Butter Chicken', 'Kadai Chicken');

-- 20. Mark specific Fried Rice & Noodles non-veg items
UPDATE menu_items SET veg = false WHERE name ILIKE '%egg fried%' OR name ILIKE '%egg noodles%' OR name ILIKE '%chicken fried%' OR name ILIKE '%chicken noodles%' OR name ILIKE '%non veg%';

-- ============================================================
-- FOOD EMOJIS - Category-appropriate for each item
-- ============================================================

-- Breakfast items
UPDATE menu_items SET emoji = '🫓' WHERE name = 'Appam';
UPDATE menu_items SET emoji = '🍜' WHERE name = 'Idiappam';
UPDATE menu_items SET emoji = '🍚' WHERE name = 'Puttu';
UPDATE menu_items SET emoji = '🫓' WHERE name = 'Chappathi';
UPDATE menu_items SET emoji = '🫓' WHERE name = 'Porotta';
UPDATE menu_items SET emoji = '🫓' WHERE name = 'Wheat Porotta';
UPDATE menu_items SET emoji = '🫓' WHERE name = 'Nool Porotta';
UPDATE menu_items SET emoji = '🫓' WHERE name = 'Poori Baji';
UPDATE menu_items SET emoji = '🫓' WHERE name = 'Neer Dosa';
UPDATE menu_items SET emoji = '🫓' WHERE name = 'Set Dosa';
UPDATE menu_items SET emoji = '🫓' WHERE name = 'Plain Dosa';
UPDATE menu_items SET emoji = '🫓' WHERE name = 'Masala Dosa';
UPDATE menu_items SET emoji = '🫓' WHERE name = 'Ghee Roast';
UPDATE menu_items SET emoji = '🫓' WHERE name = 'Onion Dosa';
UPDATE menu_items SET emoji = '🫓' WHERE name = 'Egg Dosa';
UPDATE menu_items SET emoji = '🍛' WHERE name = 'Kadala Curry';
UPDATE menu_items SET emoji = '🍛' WHERE name = 'Greenpeas Curry';
UPDATE menu_items SET emoji = '🍛' WHERE name = 'Cherupayar Curry';
UPDATE menu_items SET emoji = '🍛' WHERE name = 'Egg Curry';
UPDATE menu_items SET emoji = '🍛' WHERE name = 'Egg Roast';
UPDATE menu_items SET emoji = '🍛' WHERE name = 'Aloobaji';
UPDATE menu_items SET emoji = '🍛' WHERE name = 'Veg Kuruma';

-- Rice & Biriyani
UPDATE menu_items SET emoji = '🍛' WHERE name = 'Kerala Meals';
UPDATE menu_items SET emoji = '🍛' WHERE name = 'Fish Curry Meals';
UPDATE menu_items SET emoji = '🍛' WHERE name = 'Chicken Curry Meals';
UPDATE menu_items SET emoji = '🍱' WHERE name = 'Pothichoru Veg';
UPDATE menu_items SET emoji = '🍱' WHERE name = 'Pothichoru Egg';
UPDATE menu_items SET emoji = '🍱' WHERE name = 'Pothichoru Fish';
UPDATE menu_items SET emoji = '🍱' WHERE name = 'Pothichoru Chicken';
UPDATE menu_items SET emoji = '🍚' WHERE name = 'Ghee Rice';
UPDATE menu_items SET emoji = '🍚' WHERE name = 'Biriyani Rice';
UPDATE menu_items SET emoji = '🍛' WHERE name = 'Egg Biriyani';
UPDATE menu_items SET emoji = '🍛' WHERE name = 'Veg Biriyani';
UPDATE menu_items SET emoji = '🍛' WHERE name = 'Paneer Biriyani';
UPDATE menu_items SET emoji = '🍛' WHERE name = 'Chicken Biriyani (Half)';
UPDATE menu_items SET emoji = '🍛' WHERE name = 'Chicken Biriyani (Full)';
UPDATE menu_items SET emoji = '🍛' WHERE name = 'Chicken Pothi Biriyani';
UPDATE menu_items SET emoji = '🍛' WHERE name = 'Pothu Biriyani (Half)';
UPDATE menu_items SET emoji = '🍛' WHERE name = 'Pothu Biriyani (Full)';
UPDATE menu_items SET emoji = '🍛' WHERE name = 'Pothu Pothi Biriyani';
UPDATE menu_items SET emoji = '🍛' WHERE name = 'Mutton Biriyani';
UPDATE menu_items SET emoji = '🍛' WHERE name = 'Kada Biriyani';

-- Special
UPDATE menu_items SET emoji = '🍲' WHERE name = 'Kappa';
UPDATE menu_items SET emoji = '🍲' WHERE name = 'Kappa Mix Veg';
UPDATE menu_items SET emoji = '🍲' WHERE name = 'Kappa Mix Fish';
UPDATE menu_items SET emoji = '🍲' WHERE name = 'Kappa Mix Chicken';
UPDATE menu_items SET emoji = '🍲' WHERE name = 'Kappa Mix Pothu';
UPDATE menu_items SET emoji = '🍲' WHERE name = 'Puttu Mix Egg';
UPDATE menu_items SET emoji = '🍲' WHERE name = 'Puttu Mix Chicken';
UPDATE menu_items SET emoji = '🍲' WHERE name = 'Puttu Mix Pothu';
UPDATE menu_items SET emoji = '🫓' WHERE name = 'Kizhi Porotta Chicken';
UPDATE menu_items SET emoji = '🫓' WHERE name = 'Kizhi Porotta Pothu';
UPDATE menu_items SET emoji = '🫓' WHERE name = 'Pothi Porotta Chicken';
UPDATE menu_items SET emoji = '🫓' WHERE name = 'Pothi Porotta Pothu';
UPDATE menu_items SET emoji = '🫓' WHERE name = 'Kothu Porotta Veg';
UPDATE menu_items SET emoji = '🫓' WHERE name = 'Kothu Porotta Egg';
UPDATE menu_items SET emoji = '🫓' WHERE name = 'Kothu Porotta Chicken';
UPDATE menu_items SET emoji = '🫓' WHERE name = 'Kothu Porotta Pothu';
UPDATE menu_items SET emoji = '🫓' WHERE name = 'Pathal Mix Pothu';

-- Fish Fry & Curry
UPDATE menu_items SET emoji = '🐟' WHERE name = 'Ayala Fry';
UPDATE menu_items SET emoji = '🐟' WHERE name = 'Mathi Fry';
UPDATE menu_items SET emoji = '🦑' WHERE name = 'Squid Fry';
UPDATE menu_items SET emoji = '🐟' WHERE name = 'Choora Fry';
UPDATE menu_items SET emoji = '🐟' WHERE name = 'Avoli Fry';
UPDATE menu_items SET emoji = '🐟' WHERE name = 'Podimeen Fry';
UPDATE menu_items SET emoji = '🐟' WHERE name = 'Neimeen Fry';
UPDATE menu_items SET emoji = '🐟' WHERE name = 'Kilimeen Fry';
UPDATE menu_items SET emoji = '🦐' WHERE name = 'Prawns Fry';
UPDATE menu_items SET emoji = '🦐' WHERE name = 'Prawns Roast';
UPDATE menu_items SET emoji = '🦑' WHERE name = 'Squid Roast';
UPDATE menu_items SET emoji = '🐟' WHERE name = 'Ayala Mulakittath';
UPDATE menu_items SET emoji = '🐟' WHERE name = 'Mathi Mulakittath';
UPDATE menu_items SET emoji = '🐟' WHERE name = 'Choora Mulakittath';

-- Homely Special
UPDATE menu_items SET emoji = '🍚' WHERE name = 'Kanji';
UPDATE menu_items SET emoji = '🍚' WHERE name = 'Kanji & Fish Fry';
UPDATE menu_items SET emoji = '🍚' WHERE name = 'Kanji & Chicken Fry';
UPDATE menu_items SET emoji = '🍱' WHERE name = 'Chatti Choru';
UPDATE menu_items SET emoji = '🍗' WHERE name = 'Bellari Pothu Fry';
UPDATE menu_items SET emoji = '🍗' WHERE name = 'Kanthari Pothu Fry';

-- Non Veg Curry
UPDATE menu_items SET emoji = '🍗' WHERE name = 'Chicken Varutharachath';
UPDATE menu_items SET emoji = '🍗' WHERE name = 'Chicken Varattu';
UPDATE menu_items SET emoji = '🍗' WHERE name = 'Chicken Kuruma';
UPDATE menu_items SET emoji = '🍗' WHERE name = 'Chicken Roast';
UPDATE menu_items SET emoji = '🍗' WHERE name = 'Chicken Chukka';
UPDATE menu_items SET emoji = '🍗' WHERE name = 'Chicken Hyderabadi';
UPDATE menu_items SET emoji = '🍗' WHERE name = 'Kada Roast';
UPDATE menu_items SET emoji = '🍗' WHERE name = 'Kada Fry';
UPDATE menu_items SET emoji = '🍗' WHERE name = 'BDF';
UPDATE menu_items SET emoji = '🍗' WHERE name = 'Pothu Chilli';
UPDATE menu_items SET emoji = '🍗' WHERE name = 'Chicken Masala';
UPDATE menu_items SET emoji = '🍗' WHERE name = 'Thattukada Chicken Fry';
UPDATE menu_items SET emoji = '🍲' WHERE name = 'Chicken Stew';
UPDATE menu_items SET emoji = '🍗' WHERE name = 'Kadai Chicken' AND category = 'Non Veg Curry';
UPDATE menu_items SET emoji = '🍗' WHERE name = 'Pothu Roast (Half)';
UPDATE menu_items SET emoji = '🍗' WHERE name = 'Pothu Roast (Full)';
UPDATE menu_items SET emoji = '🍗' WHERE name = 'Pothu Fry (Half)';
UPDATE menu_items SET emoji = '🍗' WHERE name = 'Pothu Fry (Full)';
UPDATE menu_items SET emoji = '🍗' WHERE name = 'Mutton Roast';

-- Egg Special
UPDATE menu_items SET emoji = '🍳' WHERE name = 'Egg Chilli';
UPDATE menu_items SET emoji = '🍳' WHERE name = 'Egg Manchurian';
UPDATE menu_items SET emoji = '🍳' WHERE name = 'Egg Masala Double';
UPDATE menu_items SET emoji = '🍳' WHERE name = 'Egg Burji';
UPDATE menu_items SET emoji = '🍳' WHERE name = 'Egg Omlet Single';
UPDATE menu_items SET emoji = '🍳' WHERE name = 'Bulls Eye Single';
UPDATE menu_items SET emoji = '🥚' WHERE name = 'Boiled Egg';

-- Starters (veg)
UPDATE menu_items SET emoji = '🥦' WHERE name = 'Gobi 65';
UPDATE menu_items SET emoji = '🥦' WHERE name = 'Gobi Manchurian';
UPDATE menu_items SET emoji = '🥦' WHERE name = 'Chilli Gobi';
UPDATE menu_items SET emoji = '🧀' WHERE name = 'Paneer 65';
UPDATE menu_items SET emoji = '🧀' WHERE name = 'Paneer Manchurian';
UPDATE menu_items SET emoji = '🧀' WHERE name = 'Paneer Chilli';
UPDATE menu_items SET emoji = '🧀' WHERE name = 'Paneer Pepper Dry';
UPDATE menu_items SET emoji = '🍄' WHERE name = 'Mushroom Chilli';
UPDATE menu_items SET emoji = '🍄' WHERE name = 'Mushroom Pepper Dry';
UPDATE menu_items SET emoji = '🍄' WHERE name = 'Mushroom Manchurian';

-- Starters (non-veg)
UPDATE menu_items SET emoji = '🍗' WHERE name ILIKE '%kabab%';
UPDATE menu_items SET emoji = '🍗' WHERE name = 'Chicken Manchurian';
UPDATE menu_items SET emoji = '🍗' WHERE name = 'Chicken 65';
UPDATE menu_items SET emoji = '🍗' WHERE name = 'Chilli Chicken';
UPDATE menu_items SET emoji = '🍗' WHERE name = 'Garlic Chicken';
UPDATE menu_items SET emoji = '🍗' WHERE name = 'Pepper Chicken';
UPDATE menu_items SET emoji = '🍗' WHERE name = 'Lemon Chicken';
UPDATE menu_items SET emoji = '🍗' WHERE name = 'Ginger Chicken';

-- Shawarma
UPDATE menu_items SET emoji = '🌯' WHERE name = 'Shawarma Roll';
UPDATE menu_items SET emoji = '🌯' WHERE name = 'Shawarma Plate';
UPDATE menu_items SET emoji = '🌯' WHERE name = 'Peri Peri Shawarma Roll';
UPDATE menu_items SET emoji = '🌯' WHERE name = 'Peri Peri Shawarma Plate';

-- Alfam
UPDATE menu_items SET emoji = '🍗' WHERE name ILIKE '%alfam%' AND category = 'Alfam';

-- Mandi
UPDATE menu_items SET emoji = '🍛' WHERE name ILIKE '%mandi%';

-- Fried Rice & Noodles
UPDATE menu_items SET emoji = '🍚' WHERE name ILIKE '%fried rice%' AND category = 'Fried Rice & Noodles';
UPDATE menu_items SET emoji = '🍜' WHERE name ILIKE '%noodles%' AND category = 'Fried Rice & Noodles';

-- Chinese (veg)
UPDATE menu_items SET emoji = '🍅' WHERE name = 'Tomato Fry';
UPDATE menu_items SET emoji = '🍛' WHERE name = 'Mix Veg Curry';
UPDATE menu_items SET emoji = '🧀' WHERE name = 'Paneer Butter Masala';
UPDATE menu_items SET emoji = '🧀' WHERE name = 'Kadai Paneer';
UPDATE menu_items SET emoji = '🍄' WHERE name = 'Mushroom Masala';
UPDATE menu_items SET emoji = '🍗' WHERE name = 'Butter Chicken';
UPDATE menu_items SET emoji = '🍗' WHERE name = 'Kadai Chicken' AND category = 'Chinese';

-- Juice & Shakes
UPDATE menu_items SET emoji = '🍍' WHERE name = 'Pineapple Juice';
UPDATE menu_items SET emoji = '🍉' WHERE name = 'Watermelon Juice';
UPDATE menu_items SET emoji = '🍈' WHERE name = 'Muskmelon Juice';
UPDATE menu_items SET emoji = '🍊' WHERE name = 'Orange Juice';
UPDATE menu_items SET emoji = '🍋' WHERE name = 'Mosambi Juice';
UPDATE menu_items SET emoji = '🍇' WHERE name = 'Grape Pulpi';
UPDATE menu_items SET emoji = '🍋' WHERE name = 'Lime Juice';
UPDATE menu_items SET emoji = '🍋' WHERE name = 'Lime Soda';
UPDATE menu_items SET emoji = '🥤' WHERE name = 'Chikku Shake';
UPDATE menu_items SET emoji = '🥭' WHERE name = 'Mango Shake';

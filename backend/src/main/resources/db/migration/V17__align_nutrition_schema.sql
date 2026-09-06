-- V17: Align legacy nutrition table columns with JPA entities
-- 1. meal_items: allow null or default on legacy 'servings' column, backfilling from 'quantity'
ALTER TABLE meal_items ALTER COLUMN servings DROP NOT NULL;
UPDATE meal_items SET servings = quantity WHERE servings IS NULL AND quantity IS NOT NULL;
ALTER TABLE meal_items ALTER COLUMN servings SET DEFAULT 1.0;

-- 2. foods: allow null on legacy 'calories', 'serving_size', 'serving_unit' columns
ALTER TABLE foods ALTER COLUMN calories DROP NOT NULL;
ALTER TABLE foods ALTER COLUMN serving_size DROP NOT NULL;
ALTER TABLE foods ALTER COLUMN serving_unit DROP NOT NULL;
UPDATE foods SET calories = calories_kcal WHERE calories IS NULL AND calories_kcal IS NOT NULL;
UPDATE foods SET serving_size = serving_size_g WHERE serving_size IS NULL AND serving_size_g IS NOT NULL;
UPDATE foods SET serving_unit = COALESCE(serving_label, 'g') WHERE serving_unit IS NULL;

-- 3. nutrition_goals: allow null on legacy target_* columns
ALTER TABLE nutrition_goals ALTER COLUMN target_calories DROP NOT NULL;
ALTER TABLE nutrition_goals ALTER COLUMN target_protein_g DROP NOT NULL;
ALTER TABLE nutrition_goals ALTER COLUMN target_carbs_g DROP NOT NULL;
ALTER TABLE nutrition_goals ALTER COLUMN target_fat_g DROP NOT NULL;

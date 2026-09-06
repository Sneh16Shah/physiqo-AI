-- V16: Seed comprehensive food database with standard whole foods, proteins, carbs, and fats
INSERT INTO foods (
    id, name, brand, serving_size, serving_unit, serving_size_g, serving_label,
    calories, calories_kcal, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg,
    is_custom, verified, is_verified
) VALUES
-- Proteins
(gen_random_uuid(), 'Chicken Breast (Cooked)', 'Whole Foods', 100, 'g', 100, '100g', 165, 165, 31.0, 0.0, 3.6, 0.0, 0.0, 74, FALSE, TRUE, TRUE),
(gen_random_uuid(), 'Lean Ground Beef (90/10)', 'Butcher Choice', 100, 'g', 100, '100g', 217, 217, 26.0, 0.0, 12.0, 0.0, 0.0, 68, FALSE, TRUE, TRUE),
(gen_random_uuid(), 'Atlantic Salmon (Cooked)', 'Fresh Catch', 100, 'g', 100, '100g', 206, 206, 22.0, 0.0, 12.0, 0.0, 0.0, 59, FALSE, TRUE, TRUE),
(gen_random_uuid(), 'Whole Egg', 'Farm Fresh', 50, 'g', 50, '1 large egg', 72, 72, 6.3, 0.4, 4.8, 0.0, 0.2, 71, FALSE, TRUE, TRUE),
(gen_random_uuid(), 'Egg Whites', 'Liquid Whites', 100, 'g', 100, '100g', 52, 52, 11.0, 0.7, 0.2, 0.0, 0.7, 166, FALSE, TRUE, TRUE),
(gen_random_uuid(), 'Canned Tuna (in Water)', 'Ocean Catch', 100, 'g', 100, '100g drained', 116, 116, 26.0, 0.0, 1.0, 0.0, 0.0, 247, FALSE, TRUE, TRUE),
(gen_random_uuid(), 'Whey Protein Powder', 'Optimum Nutrition', 30, 'g', 30, '1 scoop (30g)', 120, 120, 24.0, 2.0, 1.5, 0.5, 1.0, 130, FALSE, TRUE, TRUE),
(gen_random_uuid(), 'Greek Yogurt (0% Plain)', 'Chobani', 170, 'g', 170, '1 container (170g)', 100, 100, 17.0, 6.0, 0.7, 0.0, 5.0, 60, FALSE, TRUE, TRUE),
(gen_random_uuid(), 'Cottage Cheese (1% Low Fat)', 'Good Culture', 113, 'g', 113, '1/2 cup (113g)', 82, 82, 14.0, 3.0, 1.2, 0.0, 2.5, 400, FALSE, TRUE, TRUE),
(gen_random_uuid(), 'Firm Tofu', 'Nasoya', 100, 'g', 100, '100g', 83, 83, 10.0, 2.0, 5.0, 1.0, 0.5, 10, FALSE, TRUE, TRUE),
(gen_random_uuid(), 'Roasted Turkey Breast', 'Deli Cut', 100, 'g', 100, '100g', 135, 135, 30.0, 0.0, 1.5, 0.0, 0.0, 680, FALSE, TRUE, TRUE),

-- Carbohydrates
(gen_random_uuid(), 'Jasmine White Rice (Cooked)', 'Hom Mali', 150, 'g', 150, '1 cup cooked (150g)', 195, 195, 4.2, 45.0, 0.4, 0.6, 0.1, 2, FALSE, TRUE, TRUE),
(gen_random_uuid(), 'Brown Rice (Cooked)', 'Lundberg', 150, 'g', 150, '1 cup cooked (150g)', 167, 167, 3.5, 35.0, 1.5, 2.5, 0.4, 5, FALSE, TRUE, TRUE),
(gen_random_uuid(), 'Rolled Oats', 'Quaker', 40, 'g', 40, '1/2 cup raw (40g)', 150, 150, 5.0, 27.0, 2.5, 4.0, 1.0, 0, FALSE, TRUE, TRUE),
(gen_random_uuid(), 'Sweet Potato (Baked)', 'Organic Produce', 130, 'g', 130, '1 medium (130g)', 112, 112, 2.0, 26.0, 0.1, 3.9, 5.4, 72, FALSE, TRUE, TRUE),
(gen_random_uuid(), 'Russet Potato (Baked)', 'Produce', 150, 'g', 150, '1 medium (150g)', 140, 140, 3.5, 32.0, 0.2, 2.5, 1.0, 10, FALSE, TRUE, TRUE),
(gen_random_uuid(), 'Whole Wheat Bread', 'Ezekiel 4:9', 35, 'g', 35, '1 slice (35g)', 80, 80, 5.0, 15.0, 0.5, 3.0, 0.0, 75, FALSE, TRUE, TRUE),
(gen_random_uuid(), 'Plain Bagel', 'Bakery Fresh', 95, 'g', 95, '1 bagel (95g)', 260, 260, 10.0, 52.0, 1.5, 2.0, 5.0, 450, FALSE, TRUE, TRUE),
(gen_random_uuid(), 'Quinoa (Cooked)', 'Ancient Harvest', 185, 'g', 185, '1 cup cooked (185g)', 222, 222, 8.0, 39.0, 3.5, 5.0, 1.6, 13, FALSE, TRUE, TRUE),
(gen_random_uuid(), 'Whole Wheat Pasta (Cooked)', 'Barilla', 140, 'g', 140, '1 cup cooked (140g)', 174, 174, 7.5, 37.0, 0.8, 4.5, 1.0, 4, FALSE, TRUE, TRUE),
(gen_random_uuid(), 'Banana', 'Fresh Produce', 118, 'g', 118, '1 medium (118g)', 105, 105, 1.3, 27.0, 0.3, 3.1, 14.4, 1, FALSE, TRUE, TRUE),
(gen_random_uuid(), 'Apple (Honeycrisp)', 'Fresh Produce', 180, 'g', 180, '1 medium (180g)', 95, 95, 0.5, 25.0, 0.3, 4.4, 19.0, 2, FALSE, TRUE, TRUE),
(gen_random_uuid(), 'Blueberries', 'Fresh Produce', 100, 'g', 100, '1 cup (100g)', 57, 57, 0.7, 14.0, 0.3, 2.4, 10.0, 1, FALSE, TRUE, TRUE),

-- Healthy Fats
(gen_random_uuid(), 'Natural Peanut Butter', 'Smucker Natural', 32, 'g', 32, '2 tbsp (32g)', 190, 190, 8.0, 7.0, 16.0, 2.0, 2.0, 105, FALSE, TRUE, TRUE),
(gen_random_uuid(), 'Raw Almonds', 'Blue Diamond', 28, 'g', 28, '1 oz / ~23 nuts (28g)', 164, 164, 6.0, 6.0, 14.0, 3.5, 1.2, 1, FALSE, TRUE, TRUE),
(gen_random_uuid(), 'Extra Virgin Olive Oil', 'Pompeian', 14, 'g', 14, '1 tbsp (14g)', 120, 120, 0.0, 0.0, 14.0, 0.0, 0.0, 0, FALSE, TRUE, TRUE),
(gen_random_uuid(), 'Hass Avocado', 'Produce', 100, 'g', 100, '1/2 medium avocado (100g)', 160, 160, 2.0, 8.5, 14.7, 6.7, 0.7, 7, FALSE, TRUE, TRUE),
(gen_random_uuid(), 'Whole Milk (3.25%)', 'Dairy Pure', 244, 'g', 244, '1 cup (244g)', 149, 149, 8.0, 12.0, 8.0, 0.0, 12.0, 105, FALSE, TRUE, TRUE),
(gen_random_uuid(), 'Unsweetened Almond Milk', 'Silk', 240, 'g', 240, '1 cup (240g)', 30, 30, 1.0, 1.0, 2.5, 1.0, 0.0, 170, FALSE, TRUE, TRUE),

-- Vegetables & Fiber
(gen_random_uuid(), 'Broccoli (Steamed)', 'Produce', 100, 'g', 100, '1 cup chopped (100g)', 35, 35, 2.4, 7.0, 0.4, 2.6, 1.4, 40, FALSE, TRUE, TRUE),
(gen_random_uuid(), 'Baby Spinach (Raw)', 'Produce', 100, 'g', 100, '3 cups raw (100g)', 23, 23, 2.9, 3.6, 0.4, 2.2, 0.4, 79, FALSE, TRUE, TRUE),
(gen_random_uuid(), 'Mixed Steamed Veggies', 'Green Giant', 100, 'g', 100, '100g', 65, 65, 2.6, 13.0, 0.5, 3.0, 3.5, 35, FALSE, TRUE, TRUE),

-- Snacks & Supplements
(gen_random_uuid(), 'Quest Protein Bar', 'Quest Nutrition', 60, 'g', 60, '1 bar (60g)', 200, 200, 21.0, 22.0, 7.0, 14.0, 1.0, 220, FALSE, TRUE, TRUE),
(gen_random_uuid(), 'Plain Rice Cakes', 'Quaker', 18, 'g', 18, '2 cakes (18g)', 70, 70, 1.5, 15.0, 0.5, 0.5, 0.0, 30, FALSE, TRUE, TRUE),
(gen_random_uuid(), 'Dark Chocolate 85%', 'Lindt', 30, 'g', 30, '3 squares (30g)', 180, 180, 3.0, 11.0, 14.0, 3.0, 4.5, 10, FALSE, TRUE, TRUE)
ON CONFLICT DO NOTHING;

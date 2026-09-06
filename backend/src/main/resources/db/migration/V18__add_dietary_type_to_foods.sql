-- V18: Add dietary_type to foods (VEG, EGG, NON_VEG)
ALTER TABLE foods ADD COLUMN IF NOT EXISTS dietary_type VARCHAR(20) NOT NULL DEFAULT 'VEG';

-- Update seeded meat & fish to NON_VEG
UPDATE foods 
SET dietary_type = 'NON_VEG' 
WHERE LOWER(name) LIKE '%chicken%'
   OR LOWER(name) LIKE '%beef%'
   OR LOWER(name) LIKE '%salmon%'
   OR LOWER(name) LIKE '%tuna%'
   OR LOWER(name) LIKE '%turkey%'
   OR LOWER(name) LIKE '%pork%'
   OR LOWER(name) LIKE '%fish%'
   OR LOWER(name) LIKE '%meat%'
   OR LOWER(name) LIKE '%steak%';

-- Update seeded egg foods to EGG (excluding veggies / eggplant)
UPDATE foods 
SET dietary_type = 'EGG' 
WHERE (LOWER(name) LIKE '%egg%' AND LOWER(name) NOT LIKE '%veggie%' AND LOWER(name) NOT LIKE '%eggplant%');

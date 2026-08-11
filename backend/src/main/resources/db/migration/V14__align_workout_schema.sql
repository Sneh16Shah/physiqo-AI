-- V14: Align all workout-related tables with current JPA entity definitions.
-- Handles the fact that some columns may have been partially added by a previous
-- Hibernate ddl-auto:update pass, so we clean up duplicates and ensure correct state.

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. muscles — add muscle_group column
-- ═══════════════════════════════════════════════════════════════════════════════
ALTER TABLE muscles ADD COLUMN IF NOT EXISTS muscle_group VARCHAR(50);
UPDATE muscles SET muscle_group = 'UPPER_BODY' WHERE muscle_group IS NULL
  AND name IN ('Pectoralis Major', 'Latissimus Dorsi', 'Deltoid', 'Biceps Brachii',
               'Triceps Brachii', 'Trapezius', 'Forearms');
UPDATE muscles SET muscle_group = 'LOWER_BODY' WHERE muscle_group IS NULL
  AND name IN ('Quadriceps', 'Hamstrings', 'Gluteus Maximus', 'Calves', 'Adductors');
UPDATE muscles SET muscle_group = 'CORE' WHERE muscle_group IS NULL
  AND name IN ('Abs', 'Obliques', 'Erector Spinae');
UPDATE muscles SET muscle_group = 'OTHER' WHERE muscle_group IS NULL;
ALTER TABLE muscles ALTER COLUMN muscle_group SET NOT NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. exercises — add category, difficulty, instructions, is_custom, created_by
--    Note: category, is_custom may not exist yet. difficulty, instructions,
--    created_by may have been added by ddl-auto.
-- ═══════════════════════════════════════════════════════════════════════════════
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS category VARCHAR(50);
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50);
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS instructions TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT FALSE;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS created_by UUID;

-- Backfill category from existing type column
UPDATE exercises SET category = type WHERE category IS NULL AND type IS NOT NULL;
UPDATE exercises SET category = 'COMPOUND' WHERE category IS NULL;
ALTER TABLE exercises ALTER COLUMN category SET NOT NULL;

-- Mark all existing seeded exercises as not custom
UPDATE exercises SET is_custom = FALSE WHERE is_custom IS NULL;
ALTER TABLE exercises ALTER COLUMN is_custom SET NOT NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. exercise_muscles — add involvement column (composite PK left for later
--    since the id column is harmless and avoids complex PK migration)
-- ═══════════════════════════════════════════════════════════════════════════════
ALTER TABLE exercise_muscles ADD COLUMN IF NOT EXISTS involvement VARCHAR(50) DEFAULT 'PRIMARY';
UPDATE exercise_muscles SET involvement = 'PRIMARY' WHERE involvement IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. workout_plans — add goal, difficulty columns
-- ═══════════════════════════════════════════════════════════════════════════════
ALTER TABLE workout_plans ADD COLUMN IF NOT EXISTS goal VARCHAR(100);
ALTER TABLE workout_plans ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. workout_days — copy data from day_of_week to day_number if both exist,
--    then drop day_of_week. Add notes column.
-- ═══════════════════════════════════════════════════════════════════════════════
ALTER TABLE workout_days ADD COLUMN IF NOT EXISTS day_number INTEGER;
ALTER TABLE workout_days ADD COLUMN IF NOT EXISTS notes TEXT;

-- Copy day_of_week values into day_number where day_number is null
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workout_days' AND column_name = 'day_of_week') THEN
    UPDATE workout_days SET day_number = day_of_week WHERE day_number IS NULL;
    -- Drop old unique constraint
    ALTER TABLE workout_days DROP CONSTRAINT IF EXISTS workout_days_plan_id_day_of_week_key;
    -- Drop old FK references from workout_sessions and workout_exercises pointing to this table via workout_day_id
    -- (handled in their respective sections)
    ALTER TABLE workout_days DROP COLUMN day_of_week;
  END IF;
END $$;

-- Make day_number NOT NULL after backfill, add new unique constraint
ALTER TABLE workout_days ALTER COLUMN day_number SET NOT NULL;
ALTER TABLE workout_days DROP CONSTRAINT IF EXISTS workout_days_plan_id_day_number_key;
ALTER TABLE workout_days ADD CONSTRAINT workout_days_plan_id_day_number_key UNIQUE (plan_id, day_number);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. workout_exercises — consolidate to day_id and order_index.
--    DB may have both workout_day_id and day_id, and both sort_order and order_index.
-- ═══════════════════════════════════════════════════════════════════════════════
ALTER TABLE workout_exercises ADD COLUMN IF NOT EXISTS day_id UUID;
ALTER TABLE workout_exercises ADD COLUMN IF NOT EXISTS order_index INTEGER;
ALTER TABLE workout_exercises ADD COLUMN IF NOT EXISTS target_weight_kg DECIMAL(6,2);

-- Backfill day_id from workout_day_id
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workout_exercises' AND column_name = 'workout_day_id') THEN
    UPDATE workout_exercises SET day_id = workout_day_id WHERE day_id IS NULL;
    -- Drop old FK
    ALTER TABLE workout_exercises DROP CONSTRAINT IF EXISTS workout_exercises_workout_day_id_fkey;
    ALTER TABLE workout_exercises DROP COLUMN workout_day_id;
  END IF;
END $$;

-- Backfill order_index from sort_order
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workout_exercises' AND column_name = 'sort_order') THEN
    UPDATE workout_exercises SET order_index = sort_order WHERE order_index IS NULL;
    ALTER TABLE workout_exercises DROP COLUMN sort_order;
  END IF;
END $$;

ALTER TABLE workout_exercises ALTER COLUMN day_id SET NOT NULL;
ALTER TABLE workout_exercises ALTER COLUMN order_index SET NOT NULL;

-- Convert target_reps from INT to VARCHAR if it's still INT
ALTER TABLE workout_exercises ALTER COLUMN target_reps TYPE VARCHAR(50) USING target_reps::VARCHAR;

-- Drop the old target_rpe column if not needed by entity (entity doesn't have it)
ALTER TABLE workout_exercises DROP COLUMN IF EXISTS target_rpe;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. workout_sessions — consolidate to day_id, add missing columns.
--    DB may have both workout_day_id and day_id.
-- ═══════════════════════════════════════════════════════════════════════════════
ALTER TABLE workout_sessions ADD COLUMN IF NOT EXISTS plan_id UUID;
ALTER TABLE workout_sessions ADD COLUMN IF NOT EXISTS day_id UUID;
ALTER TABLE workout_sessions ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE workout_sessions ADD COLUMN IF NOT EXISTS duration_minutes INT;
ALTER TABLE workout_sessions ADD COLUMN IF NOT EXISTS rating INT;

-- Backfill day_id from workout_day_id
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workout_sessions' AND column_name = 'workout_day_id') THEN
    UPDATE workout_sessions SET day_id = workout_day_id WHERE day_id IS NULL;
    ALTER TABLE workout_sessions DROP CONSTRAINT IF EXISTS workout_sessions_workout_day_id_fkey;
    ALTER TABLE workout_sessions DROP COLUMN workout_day_id;
  END IF;
END $$;

-- Drop ended_at if present (entity uses completed_at instead)
ALTER TABLE workout_sessions DROP COLUMN IF EXISTS ended_at;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. exercise_sets — add set_type, duration_seconds, notes;
--    consolidate is_completed → completed.
-- ═══════════════════════════════════════════════════════════════════════════════
ALTER TABLE exercise_sets ADD COLUMN IF NOT EXISTS set_type VARCHAR(50) DEFAULT 'WORKING';
ALTER TABLE exercise_sets ADD COLUMN IF NOT EXISTS duration_seconds INT;
ALTER TABLE exercise_sets ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE exercise_sets ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT TRUE;

-- Copy is_completed to completed where completed is null
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exercise_sets' AND column_name = 'is_completed') THEN
    UPDATE exercise_sets SET completed = is_completed WHERE is_completed IS NOT NULL;
    ALTER TABLE exercise_sets DROP COLUMN is_completed;
  END IF;
END $$;

ALTER TABLE exercise_sets ALTER COLUMN completed SET NOT NULL;
ALTER TABLE exercise_sets ALTER COLUMN set_type SET NOT NULL;

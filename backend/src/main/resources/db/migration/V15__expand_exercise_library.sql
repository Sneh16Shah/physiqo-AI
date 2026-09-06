-- V15: Expand exercise library with standard compound and isolation exercises
INSERT INTO exercises (id, name, description, category, equipment, difficulty, is_custom) VALUES
-- Chest
(gen_random_uuid(), 'Incline Dumbbell Press', 'Incline bench press with dumbbells for upper chest', 'COMPOUND', 'DUMBBELL', 'INTERMEDIATE', FALSE),
(gen_random_uuid(), 'Dumbbell Flyes', 'Chest fly movement focusing on chest stretch', 'ISOLATION', 'DUMBBELL', 'BEGINNER', FALSE),
(gen_random_uuid(), 'Cable Crossover', 'Cable chest fly for continuous tension', 'ISOLATION', 'CABLE', 'INTERMEDIATE', FALSE),
(gen_random_uuid(), 'Push-ups', 'Standard bodyweight push-up', 'COMPOUND', 'BODYWEIGHT', 'BEGINNER', FALSE),
(gen_random_uuid(), 'Chest Dips', 'Bodyweight dips with slight forward lean for chest emphasis', 'COMPOUND', 'BODYWEIGHT', 'INTERMEDIATE', FALSE),

-- Back
(gen_random_uuid(), 'Barbell Row', 'Bent-over barbell row for upper and middle back', 'COMPOUND', 'BARBELL', 'INTERMEDIATE', FALSE),
(gen_random_uuid(), 'Lat Pulldown', 'Wide grip cable lat pulldown', 'COMPOUND', 'CABLE', 'BEGINNER', FALSE),
(gen_random_uuid(), 'Seated Cable Row', 'Seated close-grip cable row for back thickness', 'COMPOUND', 'CABLE', 'BEGINNER', FALSE),
(gen_random_uuid(), 'T-Bar Row', 'Heavy compound row for back development', 'COMPOUND', 'BARBELL', 'INTERMEDIATE', FALSE),
(gen_random_uuid(), 'Face Pull', 'Cable rope face pull for rear deltoids and upper back health', 'ISOLATION', 'CABLE', 'BEGINNER', FALSE),

-- Shoulders
(gen_random_uuid(), 'Overhead Press', 'Standing military press with barbell', 'COMPOUND', 'BARBELL', 'INTERMEDIATE', FALSE),
(gen_random_uuid(), 'Dumbbell Shoulder Press', 'Seated or standing shoulder press with dumbbells', 'COMPOUND', 'DUMBBELL', 'BEGINNER', FALSE),
(gen_random_uuid(), 'Lateral Raise', 'Side dumbbell raises for lateral deltoids', 'ISOLATION', 'DUMBBELL', 'BEGINNER', FALSE),
(gen_random_uuid(), 'Front Raise', 'Dumbbell front raise for anterior deltoid', 'ISOLATION', 'DUMBBELL', 'BEGINNER', FALSE),
(gen_random_uuid(), 'Reverse Pec Deck', 'Machine rear delt fly for posterior deltoid', 'ISOLATION', 'MACHINE', 'BEGINNER', FALSE),

-- Legs
(gen_random_uuid(), 'Leg Press', 'Machine leg press for quad and glute development', 'COMPOUND', 'MACHINE', 'BEGINNER', FALSE),
(gen_random_uuid(), 'Romanian Deadlift', 'Barbell or dumbbell hinge movement focusing on hamstrings and glutes', 'COMPOUND', 'BARBELL', 'INTERMEDIATE', FALSE),
(gen_random_uuid(), 'Leg Extension', 'Machine leg extension for quadriceps isolation', 'ISOLATION', 'MACHINE', 'BEGINNER', FALSE),
(gen_random_uuid(), 'Hamstring Curl', 'Lying or seated leg curl for hamstrings', 'ISOLATION', 'MACHINE', 'BEGINNER', FALSE),
(gen_random_uuid(), 'Bulgarian Split Squat', 'Single leg squat with rear foot elevated', 'COMPOUND', 'DUMBBELL', 'ADVANCED', FALSE),
(gen_random_uuid(), 'Standing Calf Raise', 'Standing machine calf raise for gastrocnemius', 'ISOLATION', 'MACHINE', 'BEGINNER', FALSE),

-- Arms
(gen_random_uuid(), 'Barbell Bicep Curl', 'Standing barbell curl for overall bicep mass', 'ISOLATION', 'BARBELL', 'BEGINNER', FALSE),
(gen_random_uuid(), 'Dumbbell Hammer Curl', 'Neutral grip dumbbell curl for brachialis and forearms', 'ISOLATION', 'DUMBBELL', 'BEGINNER', FALSE),
(gen_random_uuid(), 'Tricep Pushdown', 'Cable triceps pushdown with rope or straight bar', 'ISOLATION', 'CABLE', 'BEGINNER', FALSE),
(gen_random_uuid(), 'Skull Crusher', 'Lying tricep extension with EZ-bar', 'ISOLATION', 'BARBELL', 'INTERMEDIATE', FALSE),
(gen_random_uuid(), 'Preacher Curl', 'Strict bicep curl on preacher bench', 'ISOLATION', 'BARBELL', 'BEGINNER', FALSE),

-- Core
(gen_random_uuid(), 'Plank', 'Isometric core hold', 'ISOLATION', 'BODYWEIGHT', 'BEGINNER', FALSE),
(gen_random_uuid(), 'Hanging Leg Raise', 'Hanging ab raise for lower abdominal development', 'ISOLATION', 'BODYWEIGHT', 'INTERMEDIATE', FALSE),
(gen_random_uuid(), 'Cable Crunch', 'Kneeling cable rope crunch for abdominal contraction', 'ISOLATION', 'CABLE', 'BEGINNER', FALSE)
ON CONFLICT (name) DO NOTHING;

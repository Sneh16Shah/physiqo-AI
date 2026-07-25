import os

migrations_dir = r"d:\Projects\physiqo-AI\backend\src\main\resources\db\migration"
os.makedirs(migrations_dir, exist_ok=True)

migrations = {
    "V2__create_uploaded_files.sql": """
CREATE TABLE uploaded_files (
    id UUID PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(100),
    file_size BIGINT,
    s3_key VARCHAR(500) NOT NULL,
    bucket VARCHAR(255) NOT NULL,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles ADD COLUMN avatar_file_id UUID REFERENCES uploaded_files(id);
""",
    "V3__create_body_composition.sql": """
CREATE TABLE body_composition_reports (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    report_date TIMESTAMPTZ NOT NULL,
    file_id UUID REFERENCES uploaded_files(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE body_composition_measurements (
    id UUID PRIMARY KEY,
    report_id UUID NOT NULL REFERENCES body_composition_reports(id),
    weight_kg DECIMAL(5,2),
    body_fat_percentage DECIMAL(5,2),
    skeletal_muscle_mass_kg DECIMAL(5,2),
    water_mass_kg DECIMAL(5,2),
    bone_mass_kg DECIMAL(5,2),
    visceral_fat_level INT,
    basal_metabolic_rate INT,
    metabolic_age INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE body_measurements (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    measurement_date TIMESTAMPTZ NOT NULL,
    neck_cm DECIMAL(5,2),
    chest_cm DECIMAL(5,2),
    waist_cm DECIMAL(5,2),
    hips_cm DECIMAL(5,2),
    biceps_cm DECIMAL(5,2),
    thighs_cm DECIMAL(5,2),
    calves_cm DECIMAL(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
""",
    "V4__create_exercises.sql": """
CREATE TABLE muscles (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE exercises (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    type VARCHAR(50), -- e.g., STRENGTH, CARDIO, STRETCHING
    equipment VARCHAR(50), -- e.g., BARBELL, DUMBBELL, MACHINE, BODYWEIGHT
    video_url VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE exercise_muscles (
    id UUID PRIMARY KEY,
    exercise_id UUID NOT NULL REFERENCES exercises(id),
    muscle_id UUID NOT NULL REFERENCES muscles(id),
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(exercise_id, muscle_id)
);
""",
    "V5__create_workouts.sql": """
CREATE TABLE workout_plans (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workout_days (
    id UUID PRIMARY KEY,
    plan_id UUID NOT NULL REFERENCES workout_plans(id),
    day_of_week INT NOT NULL, -- 1=Monday, 7=Sunday
    name VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(plan_id, day_of_week)
);

CREATE TABLE workout_exercises (
    id UUID PRIMARY KEY,
    workout_day_id UUID NOT NULL REFERENCES workout_days(id),
    exercise_id UUID NOT NULL REFERENCES exercises(id),
    sort_order INT NOT NULL,
    target_sets INT,
    target_reps INT,
    target_rpe DECIMAL(3,1),
    rest_seconds INT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workout_sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    workout_day_id UUID REFERENCES workout_days(id),
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE exercise_sets (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES workout_sessions(id),
    exercise_id UUID NOT NULL REFERENCES exercises(id),
    set_number INT NOT NULL,
    reps INT,
    weight_kg DECIMAL(6,2),
    rpe DECIMAL(3,1),
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
""",
    "V6__create_nutrition.sql": """
CREATE TABLE foods (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    serving_size DECIMAL(8,2) NOT NULL,
    serving_unit VARCHAR(50) NOT NULL,
    calories DECIMAL(8,2) NOT NULL,
    protein_g DECIMAL(8,2) NOT NULL,
    carbs_g DECIMAL(8,2) NOT NULL,
    fat_g DECIMAL(8,2) NOT NULL,
    fiber_g DECIMAL(8,2),
    sugar_g DECIMAL(8,2),
    sodium_mg DECIMAL(8,2),
    is_verified BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE nutrition_goals (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    target_calories INT NOT NULL,
    target_protein_g INT NOT NULL,
    target_carbs_g INT NOT NULL,
    target_fat_g INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE meals (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    meal_type VARCHAR(50) NOT NULL, -- BREAKFAST, LUNCH, DINNER, SNACK
    meal_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, meal_type, meal_date)
);

CREATE TABLE meal_items (
    id UUID PRIMARY KEY,
    meal_id UUID NOT NULL REFERENCES meals(id),
    food_id UUID NOT NULL REFERENCES foods(id),
    servings DECIMAL(6,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
""",
    "V7__create_products.sql": """
CREATE TABLE products (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    category VARCHAR(100),
    description TEXT,
    barcode VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE product_nutrition (
    id UUID PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id),
    serving_size DECIMAL(8,2) NOT NULL,
    serving_unit VARCHAR(50) NOT NULL,
    calories DECIMAL(8,2) NOT NULL,
    protein_g DECIMAL(8,2) NOT NULL,
    carbs_g DECIMAL(8,2) NOT NULL,
    fat_g DECIMAL(8,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id)
);

CREATE TABLE product_prices (
    id UUID PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id),
    store_name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    url VARCHAR(1000),
    last_checked_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE product_verifications (
    id UUID PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id),
    verified_by UUID REFERENCES users(id),
    is_verified BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE price_alerts (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    product_id UUID NOT NULL REFERENCES products(id),
    target_price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
""",
    "V8__create_notifications.sql": """
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_insights (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    category VARCHAR(50) NOT NULL, -- NUTRITION, WORKOUT, BODY_COMP
    insight_text TEXT NOT NULL,
    relevance_score DECIMAL(3,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
""",
    "V9__seed_muscles.sql": """
INSERT INTO muscles (id, name, description) VALUES
(gen_random_uuid(), 'Pectoralis Major', 'Chest muscle'),
(gen_random_uuid(), 'Latissimus Dorsi', 'Back muscle'),
(gen_random_uuid(), 'Deltoid', 'Shoulder muscle'),
(gen_random_uuid(), 'Biceps Brachii', 'Front upper arm'),
(gen_random_uuid(), 'Triceps Brachii', 'Back upper arm'),
(gen_random_uuid(), 'Quadriceps', 'Front thigh'),
(gen_random_uuid(), 'Hamstrings', 'Back thigh'),
(gen_random_uuid(), 'Gluteus Maximus', 'Buttocks'),
(gen_random_uuid(), 'Calves', 'Lower leg'),
(gen_random_uuid(), 'Abs', 'Abdominal muscles'),
(gen_random_uuid(), 'Obliques', 'Side abdominal muscles'),
(gen_random_uuid(), 'Trapezius', 'Upper back and neck'),
(gen_random_uuid(), 'Erector Spinae', 'Lower back'),
(gen_random_uuid(), 'Forearms', 'Lower arm'),
(gen_random_uuid(), 'Adductors', 'Inner thigh');
""",
    "V10__seed_exercises.sql": """
-- Just a placeholder for seeding exercises, will add a couple
INSERT INTO exercises (id, name, description, type, equipment) VALUES
(gen_random_uuid(), 'Bench Press', 'Barbell bench press', 'STRENGTH', 'BARBELL'),
(gen_random_uuid(), 'Squat', 'Barbell back squat', 'STRENGTH', 'BARBELL'),
(gen_random_uuid(), 'Deadlift', 'Conventional barbell deadlift', 'STRENGTH', 'BARBELL'),
(gen_random_uuid(), 'Pull-up', 'Bodyweight pull-up', 'STRENGTH', 'BODYWEIGHT');
"""
}

for filename, content in migrations.items():
    with open(os.path.join(migrations_dir, filename), "w", encoding="utf-8") as f:
        f.write(content.strip())
        print(f"Created {filename}")


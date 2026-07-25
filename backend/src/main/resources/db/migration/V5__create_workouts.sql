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
    day_of_week INT NOT NULL, 
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

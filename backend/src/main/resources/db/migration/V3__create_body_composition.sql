CREATE TABLE body_composition_reports (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    report_date DATE NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    source VARCHAR(50) NOT NULL,
    file_id UUID REFERENCES uploaded_files(id),
    ai_confidence DECIMAL(5,2),
    user_reviewed BOOLEAN NOT NULL DEFAULT FALSE,
    ai_raw_response JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE body_composition_measurements (
    id UUID PRIMARY KEY,
    report_id UUID NOT NULL REFERENCES body_composition_reports(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,2) NOT NULL,
    metric_unit VARCHAR(20) NOT NULL,
    confidence DECIMAL(5,2),
    user_corrected BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE body_measurements (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    measured_at TIMESTAMPTZ NOT NULL,
    weight_kg DECIMAL(5,2),
    neck_cm DECIMAL(5,2),
    chest_cm DECIMAL(5,2),
    waist_cm DECIMAL(5,2),
    hips_cm DECIMAL(5,2),
    left_bicep_cm DECIMAL(5,2),
    right_bicep_cm DECIMAL(5,2),
    left_forearm_cm DECIMAL(5,2),
    right_forearm_cm DECIMAL(5,2),
    left_thigh_cm DECIMAL(5,2),
    right_thigh_cm DECIMAL(5,2),
    left_calf_cm DECIMAL(5,2),
    right_calf_cm DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

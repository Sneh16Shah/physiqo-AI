DROP TABLE IF EXISTS ai_insights;

CREATE TABLE ai_insights (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    insight_type VARCHAR(50) NOT NULL,
    content VARCHAR(1000) NOT NULL,
    confidence DOUBLE PRECISION NOT NULL,
    is_dismissed BOOLEAN NOT NULL DEFAULT FALSE,
    source_data_ref VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_insights_user_id ON ai_insights(user_id);

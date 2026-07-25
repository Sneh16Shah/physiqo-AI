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

ALTER TABLE user_profiles ADD CONSTRAINT fk_user_profiles_avatar FOREIGN KEY (avatar_file_id) REFERENCES uploaded_files(id);

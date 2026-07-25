-- ─────────────────────────────────────────────────────────────────────────────
-- V1__create_users.sql
-- PhysiqO-AI — Initial schema: users + user_profiles
--
-- Spec: docs/DATABASE.md (tables `users`, `user_profiles`)
-- Task: P0-T03
--
-- Conventions (docs/DATABASE.md "Design Decisions"):
--   - UUID primary keys via gen_random_uuid()
--   - Metric units internally (height_cm in user_profiles)
--   - Soft deletes via deleted_at on user-facing data
--   - JPA auditing columns created_at / updated_at
--   - All timestamps TIMESTAMPTZ, UTC
-- ─────────────────────────────────────────────────────────────────────────────

-- gen_random_uuid() ships in the pgcrypto extension (core in PG13+, but we
-- create the extension explicitly so the migration is self-contained).
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─────────────────────────────────────────────────────────────────────────────
-- users
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE users
(
    id            UUID         NOT NULL DEFAULT gen_random_uuid(),
    email         VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN     NOT NULL DEFAULT FALSE,
    enabled       BOOLEAN      NOT NULL DEFAULT TRUE,
    role          VARCHAR(20)  NOT NULL DEFAULT 'USER',
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at    TIMESTAMPTZ  NULL,

    CONSTRAINT pk_users PRIMARY KEY (id),

    -- Lowercased email, unique across all rows (per spec).
    -- Note: soft-deleted rows (deleted_at IS NOT NULL) also count toward this
    -- constraint, so a deleted email cannot re-register until the row is purged.
    CONSTRAINT uq_users_email UNIQUE (email),

    -- docs/SECURITY.md: roles are USER and ADMIN
    CONSTRAINT ck_users_role CHECK (role IN ('USER', 'ADMIN'))
);

-- Spec index: idx_users_email UNIQUE on email.
-- The UNIQUE constraint above auto-creates a backing index; we name it
-- explicitly so the on-disk index matches docs/DATABASE.md's inventory.
ALTER TABLE users RENAME CONSTRAINT uq_users_email TO idx_users_email;

-- ─────────────────────────────────────────────────-schema──────────────────────
-- user_profiles
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE user_profiles
(
    id               UUID         NOT NULL DEFAULT gen_random_uuid(),
    user_id          UUID         NOT NULL,
    display_name     VARCHAR(100) NULL,
    date_of_birth    DATE         NULL,
    gender           VARCHAR(20)  NULL,
    height_cm        DECIMAL(5, 1) NULL,
    activity_level   VARCHAR(20)  NULL,
    fitness_goal     VARCHAR(30)  NULL,
    unit_preference  VARCHAR(10)  NOT NULL DEFAULT 'METRIC',
    avatar_file_id   UUID         NULL,   -- FK → uploaded_files added in V2 (table doesn't exist yet)
    timezone         VARCHAR(50)  NOT NULL DEFAULT 'UTC',
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT pk_user_profiles PRIMARY KEY (id),

    -- One profile per user
    CONSTRAINT uq_user_profiles_user_id UNIQUE (user_id),

    CONSTRAINT fk_user_profiles_user_id
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,

    -- Enumerated value domains (docs/DATABASE.md)
    CONSTRAINT ck_user_profiles_gender CHECK (
        gender IS NULL OR gender IN ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY')
    ),
    CONSTRAINT ck_user_profiles_activity_level CHECK (
        activity_level IS NULL OR activity_level IN ('SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE')
    ),
    CONSTRAINT ck_user_profiles_fitness_goal CHECK (
        fitness_goal IS NULL OR fitness_goal IN ('LOSE_FAT', 'MAINTAIN', 'BUILD_MUSCLE', 'RECOMP')
    ),
    CONSTRAINT ck_user_profiles_unit_preference CHECK (
        unit_preference IN ('METRIC', 'IMPERIAL')
    ),

    -- height_cm stored in centimeters; sane bounds (50 cm – 300 cm)
    CONSTRAINT ck_user_profiles_height_cm CHECK (
        height_cm IS NULL OR (height_cm >= 50 AND height_cm <= 300)
    )
);

-- Spec index: idx_user_profiles_user_id UNIQUE on user_id (one profile per user).
-- Rename the constraint-created index to match docs/DATABASE.md's inventory.
ALTER TABLE user_profiles RENAME CONSTRAINT uq_user_profiles_user_id TO idx_user_profiles_user_id;

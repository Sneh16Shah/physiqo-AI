-- Fix uploaded_files schema mismatch:
-- The original V2 migration created columns: file_name (NOT NULL), s3_key (NOT NULL), file_size, uploaded_by
-- Later, Hibernate ddl-auto:update added duplicate columns: original_filename, object_key, size_bytes, user_id
-- The JPA entity maps to the new columns but the old columns still have NOT NULL constraints,
-- causing ConstraintViolationException on insert.
--
-- Solution: Drop NOT NULL on legacy columns and backfill from new columns where possible.

-- 1. Drop NOT NULL constraints on legacy columns
ALTER TABLE uploaded_files ALTER COLUMN file_name DROP NOT NULL;
ALTER TABLE uploaded_files ALTER COLUMN s3_key DROP NOT NULL;

-- 2. Backfill legacy columns from new columns for any existing rows
UPDATE uploaded_files
SET file_name = original_filename
WHERE file_name IS NULL AND original_filename IS NOT NULL;

UPDATE uploaded_files
SET s3_key = object_key
WHERE s3_key IS NULL AND object_key IS NOT NULL;

UPDATE uploaded_files
SET file_size = size_bytes
WHERE file_size IS NULL AND size_bytes IS NOT NULL;

UPDATE uploaded_files
SET uploaded_by = user_id
WHERE uploaded_by IS NULL AND user_id IS NOT NULL;

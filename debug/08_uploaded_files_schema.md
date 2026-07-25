# Bug #8: DB Column NULL Constraint — Schema Mismatch

## Symptom
- File uploads to MinIO successfully ✅
- Then the database INSERT fails → HTTP 500
- Browser Console: `AxiosError: Request failed with status code 500`

## How to Investigate

### Step 1: Backend Logs
```powershell
docker logs physiqo-backend --tail 50
```
Look for `ConstraintViolationException`:
```
ERROR: null value in column "file_name" of relation "uploaded_files" violates not-null constraint
  Detail: Failing row contains (uuid, null, image/jpeg, null, null, physiqo-uploads, null, ...)
```

### Step 2: Compare JPA Entity vs DB Schema
```powershell
# Check the actual DB schema
docker exec physiqo-postgres psql -U physiqo -d physiqo -c "\d uploaded_files"
```

```powershell
# Check the JPA entity
Get-ChildItem -Path backend/src -Recurse -Include *.java | Select-String "class UploadedFile"
# Open the file and compare @Column names
```

### Step 3: Check Flyway Migrations
```powershell
# See what Flyway created
Get-ChildItem -Path backend/src/main/resources/db/migration -Filter "*.sql" | Sort-Object Name
# Open V2__create_uploaded_files.sql — these are the ORIGINAL column names
```

### Step 4: Compare Column Names Side-by-Side

```
Flyway V2 Migration (DB):          JPA Entity (Java):
─────────────────────────           ─────────────────────
file_name  (NOT NULL)               → NOT mapped (null on insert!)
s3_key     (NOT NULL)               → NOT mapped (null on insert!)
file_size                           → NOT mapped
uploaded_by                         → NOT mapped
                                    original_filename  (NOT NULL) ← added by Hibernate
                                    object_key         (NOT NULL) ← added by Hibernate
                                    size_bytes         (NOT NULL) ← added by Hibernate
                                    user_id            (NOT NULL) ← added by Hibernate
```

## Root Cause
**Schema drift** between Flyway and Hibernate:

1. **V2 migration** created `uploaded_files` with columns: `file_name`, `s3_key`, `file_size`, `uploaded_by`
2. Later, `hibernate.ddl-auto: update` was enabled, and the JPA entity used **different** column names
3. Hibernate **added** new columns (`original_filename`, `object_key`, etc.) but did NOT remove or modify old ones
4. Result: table had **both** old and new columns. Old columns still had `NOT NULL` constraints
5. JPA entity only populated new columns → old columns got NULL → constraint violation

## Fix Applied
- **File**: `backend/src/main/resources/db/migration/V12__fix_uploaded_files_schema.sql`
- **Change**: Dropped NOT NULL on legacy columns:
  ```sql
  ALTER TABLE uploaded_files ALTER COLUMN file_name DROP NOT NULL;
  ALTER TABLE uploaded_files ALTER COLUMN s3_key DROP NOT NULL;
  ```

## How to Prevent This
```yaml
# application.yml — NEVER use "update" in production
spring:
  jpa:
    hibernate:
      ddl-auto: none    # Let Flyway manage schema, not Hibernate
```

## Lesson Learned
> `hibernate.ddl-auto: update` is dangerous — it ADDS columns but never removes or renames them.
> If you rename a column in your entity, Hibernate creates a NEW column and the OLD one stays with its constraints.
> **Always use Flyway/Liquibase** for schema changes and set `ddl-auto: none`.
> When debugging INSERT failures, always run `\d table_name` in psql to see the REAL schema.

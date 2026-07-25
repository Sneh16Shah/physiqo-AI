# PhysiqO-AI Debug Guide 🔍

This folder documents every production bug encountered during development, the root cause analysis, and the fix applied. Use this as a reference when debugging similar issues.

## Quick Debugging Workflow

```
Browser DevTools (F12)          →  docker logs physiqo-backend --tail 100
   ↓ Network tab                      ↓ Find "Caused by:" chain
   ↓ Status code + URL                ↓ Identify exception class
   ↓ Request/Response body            ↓ Trace to Service → Entity → DB
```

## Error Index

| # | Error | Status Code | Root Cause | File |
|---|-------|-------------|------------|------|
| 1 | [Registration Failed](#) | 400 | Validation error | [01_registration_failed.md](./01_registration_failed.md) |
| 2 | [Report Type Not Visible](#) | UI | Dark mode styling | [02_report_type_not_visible.md](./02_report_type_not_visible.md) |
| 3 | [Black Screen on Load](#) | UI Crash | localStorage JSON parse | [03_black_screen_crash.md](./03_black_screen_crash.md) |
| 4 | [Upload MIME Type Rejection](#) | 500 | MIME type whitelist too strict | [04_upload_mime_type.md](./04_upload_mime_type.md) |
| 5 | [403 Forbidden on Upload](#) | 403 | SecurityConfig + Axios interceptor | [05_forbidden_403.md](./05_forbidden_403.md) |
| 6 | [Session Expired in 1 Second](#) | Auth | Wrong token field name | [06_session_expired_loop.md](./06_session_expired_loop.md) |
| 7 | [MinIO Bucket Not Found](#) | 500 | Bucket never created | [07_minio_bucket_missing.md](./07_minio_bucket_missing.md) |
| 8 | [DB Column NULL Constraint](#) | 500 | Schema mismatch (Flyway vs JPA) | [08_uploaded_files_schema.md](./08_uploaded_files_schema.md) |
| 9 | [JSONB Type Mismatch](#) | 500 | Hibernate varchar → PostgreSQL jsonb | [09_jsonb_type_mismatch.md](./09_jsonb_type_mismatch.md) |

## Useful Commands

```powershell
# Backend logs (last N lines)
docker logs physiqo-backend --tail 50

# Follow logs in real-time
docker logs physiqo-backend -f

# Search for errors
docker logs physiqo-backend 2>&1 | Select-String -Pattern "ERROR|Exception"

# Health check
Invoke-RestMethod http://localhost:8080/actuator/health

# Check DB table schema
docker exec physiqo-postgres psql -U physiqo -d physiqo -c "\d table_name"

# Check Flyway migration history
docker exec physiqo-postgres psql -U physiqo -d physiqo -c "SELECT version, description, success FROM flyway_schema_history ORDER BY installed_rank"

# Rebuild backend
docker compose --profile app up -d --build backend

# Rebuild frontend
docker compose --profile app up -d --build frontend
```

# backend/

Spring Boot 3 modular monolith — the system of record for PhysiqO-AI.

> **Status:** Scaffold complete (task **P0-T02** ✅). Health endpoint live, context-load test passing.

## Stack

- **Spring Boot 3.4.3**, **Java 21**, **Maven 3.9** (wrapper included)
- Spring Web, Spring Security, Spring Data JPA, Flyway, Validation, Actuator
- PostgreSQL 16 driver (JDBC / Hikari)
- Redis (Lettuce)
- AWS S3 SDK v2 (for MinIO)
- Lombok, Testcontainers (test scope)

## Layout

```
backend/
├── .mvn/wrapper/                              # Maven wrapper
├── mvnw, mvnw.cmd                             # Wrapper scripts (use these, no local Maven needed)
├── pom.xml                                    # All dependencies
├── Dockerfile                                 # Multi-stage build (maven → jre-alpine)
└── src/
    ├── main/
    │   ├── java/com/physiqo/
    │   │   ├── PhysiqoApplication.java        # @SpringBootApplication entry point
    │   │   └── common/config/SecurityConfig.java
    │   └── resources/
    │       ├── application.yml                # Common defaults
    │       ├── application-dev.yml            # Docker Compose infra (PG, Redis, MinIO)
    │       ├── application-prod.yml           # Production overrides
    │       └── db/migration/                  # Flyway migrations (V1+ added in P0-T03)
    └── test/
        ├── java/com/physiqo/PhysiqoApplicationTests.java   # Context-load smoke test
        └── resources/application-test.yml      # Test profile (real PG via Docker)
```

## Run (development)

### Option A — Run on the host with Java 21 + Maven

```bash
# 1. Start infra (from repo root)
docker compose up -d postgres redis minio

# 2. Run Spring Boot with hot reload
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

The `dev` profile connects to `localhost:5433` (Postgres), `localhost:6379` (Redis), `http://localhost:9000` (MinIO). See root `README.md` for the host port table.

### Option B — Run fully containerized

```bash
# From repo root
docker compose --profile app up -d --build backend
```

The backend joins the `physiqo-net` Docker network and connects to infra services by name (`postgres:5432`, `redis:6379`, `minio:9000`).

## Verify it's up

```bash
curl http://localhost:8080/actuator/health
# → {"status":"UP"}
```

## Tests

```bash
# Context-load smoke test (needs Postgres on localhost:5433 or pass --network physiqo-net)
./mvnw test

# Or in Docker (no local Java required):
docker run --rm -v "$PWD:/app" -w /app --network physiqo-net \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/physiqo \
  -e POSTGRES_USER=physiqo -e POSTGRES_PASSWORD=physiqo_dev \
  -e REDIS_HOST=redis -e REDIS_PORT=6379 \
  maven:3.9-eclipse-temurin-21 mvn test -B
```

## Configuration profiles

| Profile | When | Database | Notes |
|---|---|---|---|
| `dev` (default) | Local development | `postgres:5432` (container) / `localhost:5433` (host) | Hot reload via DevTools |
| `test` | `mvn test` | Same as dev, smaller pool | Context-load smoke test |
| `prod` | Production | Set via env | JSON logs, warn level |

All secrets come from environment variables — never from config files (docs/SECURITY.md §4).

## Golden rules (from docs/ARCHITECTURE.md)

- **DTOs at every boundary.** JPA entities never leak to the API.
- **Layer order:** Controller → Service → Repository, with Mappers for Entity↔DTO.
- **`@CurrentUser`** injects the authenticated principal; ownership enforced in services.
- **`@RestControllerAdvice`** produces the canonical error shape (added in P0-T06).
- **Never trust frontend input** — `@Valid` on all request DTOs.

## What's NOT here yet (deferred to later tasks)

| Capability | Task |
|---|---|
| Flyway migrations (users, body comp, workouts, etc.) | P0-T03 |
| Global exception handler + `ErrorResponse` DTO | P0-T06 |
| Request ID filter + JSON log format | P0-T07 |
| JWT auth filter, refresh tokens | P1-T01 |
| Storage service (MinIO upload endpoint) | P1-T05 |
| Feature modules (auth, user, bodycomp, …) | P1-T03 onwards |

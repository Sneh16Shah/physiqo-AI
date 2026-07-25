# PhysiqO-AI — Implementation Tasks

---

## PHASE 0 — Foundation

### P0-T01: Repository Structure & Docker Compose

- **Owner:** Full-Stack
- **Dependencies:** None
- **Files:** `docker-compose.yml`, `.env.example`, `.gitignore`, `README.md`
- **Requirements:**
  - Create monorepo layout: `frontend/`, `backend/`, `ai-service/`, `docs/`
  - Docker Compose with PostgreSQL 16, Redis 7, MinIO
  - `.env.example` with all required variables
  - `.gitignore` for Java, Node, Python
- **Acceptance:** `docker compose up` starts PG, Redis, MinIO successfully
- **Tests:** Verify connectivity to all services

### P0-T02: Spring Boot Scaffold

- **Owner:** Backend
- **Dependencies:** P0-T01
- **Files:** `backend/pom.xml`, `backend/src/main/java/com/physiqo/PhysiqoApplication.java`, `backend/src/main/resources/application*.yml`, `backend/Dockerfile`
- **Requirements:**
  - Spring Boot 3 with Java 21, Maven
  - Dependencies: Web, Security, Data JPA, PostgreSQL, Redis, Flyway, Validation, Actuator
  - Profiles: dev, test, prod
  - `application-dev.yml` configured for Docker Compose services
  - Dockerfile (multi-stage build)
  - `/actuator/health` endpoint working
- **Acceptance:** `./mvnw spring-boot:run` starts and connects to PG
- **Tests:** Application context loads

### P0-T03: Flyway Setup & Initial Migration

- **Owner:** Backend
- **Dependencies:** P0-T02
- **Files:** `backend/src/main/resources/db/migration/V1__create_users.sql`
- **Requirements:**
  - Flyway configured in Spring Boot
  - V1 migration: `users` table and `user_profiles` table per DATABASE.md
  - UUID primary keys, TIMESTAMPTZ, all constraints and indexes
- **Acceptance:** Migration runs on startup, tables exist in PG
- **Tests:** Flyway migration succeeds, schema matches spec

### P0-T04: Frontend Scaffold

- **Owner:** Frontend
- **Dependencies:** P0-T01
- **Files:** `frontend/` (Vite project), `package.json`, `tailwind.config.ts`, `tsconfig.json`, `vite.config.ts`
- **Requirements:**
  - Vite + React 18 + TypeScript 5
  - Tailwind CSS 3 configured
  - TanStack Query v5, React Router v6, Zustand, Axios, React Hook Form, Zod
  - Proxy `/api` to `localhost:8080` in Vite dev config
  - Base layout component (Shell with sidebar placeholder)
  - Dockerfile for production build
- **Acceptance:** `npm run dev` shows a styled welcome page
- **Tests:** Build succeeds without errors

### P0-T05: Python AI Service Scaffold

- **Owner:** AI/Backend
- **Dependencies:** P0-T01
- **Files:** `ai-service/app/main.py`, `ai-service/app/config.py`, `ai-service/requirements.txt`, `ai-service/Dockerfile`
- **Requirements:**
  - FastAPI with Pydantic v2
  - `pydantic-settings` for config with `.env`
  - `GET /api/v1/health` endpoint
  - `X-Service-Key` header validation dependency
  - Dockerfile
  - CORS middleware (allow Spring Boot origin)
- **Acceptance:** `uvicorn app.main:app` starts, health endpoint responds
- **Tests:** Health endpoint returns 200

### P0-T06: Global Error Handling (Backend)

- **Owner:** Backend
- **Dependencies:** P0-T02
- **Files:** `common/exception/GlobalExceptionHandler.java`, `common/exception/ApiException.java`, `common/exception/ErrorCode.java`, `common/exception/ErrorResponse.java`
- **Requirements:**
  - `ErrorResponse` DTO: status, error, message, details[], timestamp, path
  - `ApiException` abstract base with subclasses: `AuthenticationException`, `ResourceNotFoundException`, `ValidationException`, `AiServiceException`, `StorageException`, `BusinessRuleException`
  - `@RestControllerAdvice` handler mapping each exception type
  - Handle Jakarta validation errors, Spring exceptions
- **Acceptance:** All exceptions produce consistent JSON error responses
- **Tests:** Unit tests for each exception type mapping

### P0-T07: Logging & Request ID Correlation

- **Owner:** Backend
- **Dependencies:** P0-T02, P0-T05
- **Files:** `backend/common/config/RequestIdFilter.java`, `backend/src/main/resources/logback-spring.xml`, `ai-service/app/middleware.py`
- **Requirements:**
  - Spring Boot: Generate `X-Request-Id` UUID per request, add to MDC
  - Logback: JSON format in prod, readable in dev, include request_id
  - Python: Extract `X-Request-Id` from header, add to structlog context
- **Acceptance:** Request ID appears in both service logs for same request
- **Tests:** Filter adds header, MDC populated correctly

---

## PHASE 1 — MVP

### P1-T01: JWT Authentication Backend

- **Owner:** Backend
- **Dependencies:** P0-T03, P0-T06
- **Files:** `common/security/JwtTokenProvider.java`, `common/security/JwtAuthenticationFilter.java`, `common/security/UserPrincipal.java`, `common/security/CurrentUser.java`, `common/config/SecurityConfig.java`, `auth/controller/AuthController.java`, `auth/dto/`, `auth/service/AuthService.java`
- **Requirements:**
  - `JwtTokenProvider`: generate/validate access tokens (HS256, 15min)
  - Refresh tokens: opaque UUID stored in Redis (7-day expiry)
  - `JwtAuthenticationFilter`: extract JWT from Authorization header
  - `@CurrentUser` annotation to inject authenticated user ID
  - `SecurityConfig`: permit `/auth/**`, `/actuator/health`; authenticate all else
  - Endpoints: POST `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/change-password`
  - Password: bcrypt cost 12
  - Refresh token rotation on use
- **Acceptance:** Full auth flow works via API (register → login → access protected → refresh → logout)
- **Tests:** Unit tests for JWT provider; integration tests for auth endpoints

### P1-T02: Authentication Frontend

- **Owner:** Frontend
- **Dependencies:** P0-T04, P1-T01
- **Files:** `src/api/client.ts`, `src/api/auth.api.ts`, `src/features/auth/pages/LoginPage.tsx`, `src/features/auth/pages/RegisterPage.tsx`, `src/features/auth/hooks/useAuth.ts`, `src/stores/authStore.ts`, `src/routes.tsx`
- **Requirements:**
  - Axios instance with JWT interceptor (attach token, handle 401 refresh)
  - Login page with email/password form (React Hook Form + Zod)
  - Register page
  - Auth store (Zustand): token, user, isAuthenticated
  - Protected route wrapper component
  - Redirect unauthenticated users to login
  - Premium dark-themed UI with modern typography
- **Acceptance:** User can register, login, see protected dashboard placeholder, logout
- **Tests:** Auth flow works end-to-end in browser

### P1-T03: User Profile Backend

- **Owner:** Backend
- **Dependencies:** P1-T01
- **Files:** `user/entity/User.java`, `user/entity/UserProfile.java`, `user/dto/`, `user/mapper/`, `user/service/UserProfileService.java`, `user/controller/ProfileController.java`, `user/repository/`
- **Requirements:**
  - `User` and `UserProfile` JPA entities per DATABASE.md
  - `AuditableEntity` base class with `createdAt`, `updatedAt`
  - GET `/profile`, PUT `/profile` endpoints
  - Profile fields: displayName, dateOfBirth, gender, heightCm, activityLevel, fitnessGoal, unitPreference, timezone
  - Ownership enforced via `@CurrentUser`
- **Acceptance:** Authenticated user can create/update/get their profile
- **Tests:** Service unit tests, controller integration tests

### P1-T04: User Profile Frontend

- **Owner:** Frontend
- **Dependencies:** P1-T02, P1-T03
- **Files:** `src/api/profile.api.ts`, `src/features/auth/pages/ProfilePage.tsx`, `src/features/auth/hooks/useProfile.ts`
- **Requirements:**
  - Profile page with form for all profile fields
  - Unit preference selector (Metric/Imperial)
  - TanStack Query for fetching/updating profile
  - Form validation with Zod
- **Acceptance:** User can view and edit their profile
- **Tests:** Form validation works, API integration works

### P1-T05: Object Storage Setup

- **Owner:** Backend
- **Dependencies:** P0-T02
- **Files:** `common/storage/StorageService.java`, `common/storage/MinioStorageService.java`, `common/config/ObjectStorageConfig.java`, `db/migration/V2__create_uploaded_files.sql`, upload DTOs and controller
- **Requirements:**
  - `StorageService` interface: upload, getPresignedUrl, delete
  - MinIO implementation using S3 SDK
  - `uploaded_files` table migration
  - POST `/files/upload` endpoint (multipart, max 10MB)
  - File type validation: JPEG, PNG, WebP only
  - Bucket path: `physiqo-uploads/{userId}/{category}/{uuid}.{ext}`
  - Auto-create bucket on startup
- **Acceptance:** Upload an image via API, retrieve it via presigned URL
- **Tests:** Upload/download integration test

### P1-T06: Body Composition Backend

- **Owner:** Backend
- **Dependencies:** P1-T01, P0-T03
- **Files:** `db/migration/V3__create_body_composition.sql`, `bodycomp/entity/`, `bodycomp/dto/`, `bodycomp/mapper/`, `bodycomp/service/BodyCompositionService.java`, `bodycomp/controller/BodyCompositionController.java`, `bodycomp/repository/`
- **Requirements:**
  - Migration: `body_composition_reports`, `body_composition_measurements`, `body_measurements` tables
  - Manual entry CRUD for reports with measurements
  - Body measurements CRUD (tape measurements)
  - Trend data endpoint: query by metric and date range
  - Pagination support
  - Ownership enforcement
- **Acceptance:** CRUD operations for body comp reports and measurements work via API
- **Tests:** Service tests, controller integration tests with pagination

### P1-T07: Body Composition Frontend

- **Owner:** Frontend
- **Dependencies:** P1-T02, P1-T06
- **Files:** `src/api/bodycomp.api.ts`, `src/features/body-composition/pages/`, `src/features/body-composition/components/`, `src/features/body-composition/hooks/`
- **Requirements:**
  - Body comp report list page with pagination
  - Manual entry form for body comp report (with measurements)
  - Body measurements entry form
  - Report detail view
  - Trend chart (Recharts line chart) for selected metrics over time
  - Unit conversion display based on user preference
- **Acceptance:** User can log body comp data and view trends
- **Tests:** Forms validate correctly, charts render with data

### P1-T08: Muscles & Exercises Seed Data

- **Owner:** Backend
- **Dependencies:** P0-T03
- **Files:** `db/migration/V4__create_exercises.sql`, `db/migration/V9__seed_muscles.sql`, `db/migration/V10__seed_exercises.sql`
- **Requirements:**
  - Migration: `muscles`, `exercises`, `exercise_muscles` tables
  - Seed ~15 muscle groups (Pectoralis Major, Latissimus Dorsi, etc.)
  - Seed ~40 common exercises with muscle mappings (Bench Press, Squat, Deadlift, etc.)
  - Include compound and isolation exercises across all muscle groups
- **Acceptance:** Muscles and exercises exist in database after migration
- **Tests:** Seed data present, foreign keys valid

### P1-T09: Exercises API

- **Owner:** Backend
- **Dependencies:** P1-T08, P1-T01
- **Files:** `workout/entity/Muscle.java`, `workout/entity/Exercise.java`, `workout/entity/ExerciseMuscle.java`, `workout/dto/`, `workout/controller/ExerciseController.java`, `workout/controller/MuscleController.java`, `workout/service/ExerciseService.java`, `workout/repository/`
- **Requirements:**
  - GET `/muscles` with optional group filter
  - GET `/exercises` with search, category, equipment, muscle filters
  - GET `/exercises/{id}` with muscle details
  - POST `/exercises` — create custom exercise (owned by user)
  - PUT/DELETE custom exercises (ownership check)
  - System exercises are read-only
- **Acceptance:** Exercises queryable with all filters, custom exercises CRUD works
- **Tests:** Filter combinations, ownership enforcement

### P1-T10: Workout Plans Backend

- **Owner:** Backend
- **Dependencies:** P1-T09
- **Files:** `db/migration/V5__create_workouts.sql`, `workout/entity/WorkoutPlan.java`, `workout/entity/WorkoutDay.java`, `workout/entity/WorkoutExercise.java`, `workout/dto/`, `workout/service/WorkoutPlanService.java`, `workout/controller/WorkoutPlanController.java`, `workout/repository/`
- **Requirements:**
  - Migration: `workout_plans`, `workout_days`, `workout_exercises` tables
  - POST `/workout-plans` — create plan with nested days and exercises
  - GET `/workout-plans` — list user's plans (pagination, active filter)
  - GET `/workout-plans/{id}` — full plan with days and exercises
  - PUT `/workout-plans/{id}` — update plan metadata
  - DELETE `/workout-plans/{id}` — cascade delete
- **Acceptance:** Full CRUD for workout plans with nested structure
- **Tests:** Nested creation, cascade delete, ownership

### P1-T11: Workout Sessions Backend

- **Owner:** Backend
- **Dependencies:** P1-T10
- **Files:** `workout/entity/WorkoutSession.java`, `workout/entity/ExerciseSet.java`, `workout/dto/`, `workout/service/WorkoutSessionService.java`, `workout/controller/WorkoutSessionController.java`, `workout/repository/`
- **Requirements:**
  - Migration: `workout_sessions`, `exercise_sets` tables (in V5)
  - POST `/workout-sessions` — start session
  - PUT `/workout-sessions/{id}` — complete session
  - POST `/workout-sessions/{id}/sets` — log a set
  - PUT `/workout-sessions/{sessionId}/sets/{setId}` — update a set
  - GET `/workout-sessions` — list with date range, plan filter
  - GET `/workout-sessions/{id}` — detail with all sets
  - Duration auto-calculated on completion
- **Acceptance:** Full workout logging flow works
- **Tests:** Session lifecycle, set CRUD, duration calculation

### P1-T12: Workouts Frontend

- **Owner:** Frontend
- **Dependencies:** P1-T02, P1-T10, P1-T11
- **Files:** `src/api/workout.api.ts`, `src/features/workouts/pages/`, `src/features/workouts/components/`, `src/features/workouts/hooks/`
- **Requirements:**
  - Workout plans list page
  - Plan builder: add days, search/add exercises, set targets
  - Active workout session page: log sets with weight/reps
  - Session history list with filters
  - Session detail view
  - Exercise browser with search and filters
- **Acceptance:** User can create a plan, start a session, log sets, complete session
- **Tests:** Plan builder form, session logging flow

### P1-T13: Nutrition Backend

- **Owner:** Backend
- **Dependencies:** P1-T01, P0-T03
- **Files:** `db/migration/V6__create_nutrition.sql`, `nutrition/entity/`, `nutrition/dto/`, `nutrition/service/`, `nutrition/controller/`, `nutrition/repository/`
- **Requirements:**
  - Migration: `foods`, `meals`, `meal_items`, `nutrition_goals` tables
  - GET `/foods` — search with pagination
  - POST `/foods` — create custom food
  - POST `/meals` — log meal with items, return computed totals
  - GET `/meals` — list by date/range
  - GET `/meals/daily-summary` — aggregated daily nutrition
  - Nutrition goals CRUD (GET current, POST new)
  - Totals computed server-side (calories, protein, carbs, fat)
- **Acceptance:** Full nutrition logging and daily summary works
- **Tests:** Total computation accuracy, date filtering, goal overlap prevention

### P1-T14: Nutrition Frontend

- **Owner:** Frontend
- **Dependencies:** P1-T02, P1-T13
- **Files:** `src/api/nutrition.api.ts`, `src/features/nutrition/pages/`, `src/features/nutrition/components/`, `src/features/nutrition/hooks/`
- **Requirements:**
  - Daily nutrition view with meal breakdown
  - Meal logging form with food search and quantity
  - Custom food entry form
  - Progress bars for daily goals (calories, protein, carbs, fat)
  - Nutrition goals settings page
  - Date picker for viewing different days
- **Acceptance:** User can log meals, view daily summary with goal progress
- **Tests:** Total display matches API, goal progress bars correct

### P1-T15: Dashboard Page

- **Owner:** Frontend
- **Dependencies:** P1-T07, P1-T12, P1-T14
- **Files:** `src/features/dashboard/pages/DashboardPage.tsx`, `src/features/dashboard/components/`
- **Requirements:**
  - Summary cards: latest weight, body fat %, today's calories/protein
  - Recent workout sessions list (last 5)
  - Today's nutrition summary
  - Quick-action buttons (log workout, log meal, add measurement)
  - Responsive grid layout
  - Premium dark theme with glassmorphism cards
- **Acceptance:** Dashboard shows aggregated data from all modules
- **Tests:** Renders correctly with and without data

### P1-T16: Navigation & Layout

- **Owner:** Frontend
- **Dependencies:** P1-T02
- **Files:** `src/components/layout/AppShell.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/layout/Navbar.tsx`, `src/routes.tsx`
- **Requirements:**
  - App shell with collapsible sidebar
  - Navigation links: Dashboard, Body Comp, Workouts, Nutrition, Products (disabled), Profile
  - Mobile-responsive: sidebar becomes bottom nav or hamburger menu
  - User avatar and name in sidebar
  - Active route highlighting
  - Smooth transitions
- **Acceptance:** Navigation works across all pages, responsive on mobile
- **Tests:** All routes accessible, active state correct

---

## PHASE 2 — AI Features

### P2-T01: AI Provider Interface (Python)

- **Owner:** AI/Backend
- **Dependencies:** P0-T05
- **Files:** `ai-service/app/core/ai_provider.py`, `ai-service/app/core/openai_provider.py`, `ai-service/app/core/confidence.py`, `ai-service/app/schemas/common.py`
- **Requirements:**
  - `AIProvider` Protocol with `extract_structured()` and `analyze()` methods
  - `OpenAIProvider` implementation using GPT-4o
  - Structured output via OpenAI's response_format or function calling
  - `ConfidenceCalculator` with thresholds per AI_ARCHITECTURE.md
  - Pydantic schemas for `StructuredResponse`
  - Retry logic with exponential backoff
  - Error handling: `AIProviderError`, `AIExtractionError`, `AIRateLimitError`
- **Acceptance:** OpenAI provider can extract structured data from text prompt
- **Tests:** Provider returns validated Pydantic models, retries work

### P2-T02: Gemini Provider

- **Owner:** AI/Backend
- **Dependencies:** P2-T01
- **Files:** `ai-service/app/core/gemini_provider.py`
- **Requirements:**
  - `GeminiProvider` implementing `AIProvider` Protocol
  - Uses Gemini 2.0 Flash for cost-effective extraction
  - Same interface as OpenAI provider — swappable via config
- **Acceptance:** Gemini provider passes same test suite as OpenAI
- **Tests:** Structured extraction, error handling

### P2-T03: OCR Pipeline — Body Composition

- **Owner:** AI/Backend
- **Dependencies:** P2-T01, P0-T05
- **Files:** `ai-service/app/pipelines/ocr/preprocessor.py`, `ai-service/app/pipelines/ocr/extractor.py`, `ai-service/app/pipelines/ocr/body_comp.py`, `ai-service/app/schemas/ocr.py`, `ai-service/app/api/v1/ocr.py`
- **Requirements:**
  - Image preprocessing: auto-rotate, resize, contrast enhance
  - OCR via LLM vision (GPT-4o / Gemini)
  - `BodyCompositionExtraction` Pydantic schema with per-field confidence
  - Value range validation (reject impossible values)
  - POST `/api/v1/ocr/body-composition` endpoint
  - Return structured measurements with confidence scores
  - Log raw AI response for audit
- **Acceptance:** Extracts body comp data from InBody/DEXA scan image with ≥80% accuracy
- **Tests:** Test with sample scan images, validation rejects bad values

### P2-T04: AI Service Client (Spring Boot)

- **Owner:** Backend
- **Dependencies:** P2-T03, P1-T05
- **Files:** `ai/client/AiServiceClient.java`, `ai/client/dto/`, `ai/validation/AiResponseValidator.java`, `ai/service/AiOrchestrationService.java`
- **Requirements:**
  - `AiServiceClient` using Spring `RestClient` to call Python AI service
  - `X-Service-Key` header on all requests
  - `X-Request-Id` forwarded for log correlation
  - `AiResponseValidator`: validate response schema, check confidence thresholds
  - Timeout: 30 seconds for OCR, 15 seconds for analysis
  - Graceful error handling: wrap AI errors in `AiServiceException`
- **Acceptance:** Spring Boot successfully calls Python AI and validates response
- **Tests:** Integration test with mock AI service, error handling tests

### P2-T05: Body Comp Upload & Review Flow (Backend)

- **Owner:** Backend
- **Dependencies:** P2-T04, P1-T06
- **Files:** `bodycomp/controller/BodyCompositionController.java` (add upload endpoint), `bodycomp/service/BodyCompositionService.java` (add OCR flow)
- **Requirements:**
  - POST `/body-composition/reports/upload` — accept image, store in MinIO, call AI service
  - Return extracted data with confidence scores, status `PENDING_REVIEW`
  - PUT `/body-composition/reports/{id}/confirm` — user confirms/corrects data
  - Store `ai_raw_response` in report for audit
  - Store `ai_confidence` and `user_reviewed` flags
  - Mark individual measurements as `user_corrected` if changed
- **Acceptance:** Full upload → extract → review → confirm → persist flow works
- **Tests:** Integration test for full flow, confidence threshold handling

### P2-T06: Body Comp OCR Frontend

- **Owner:** Frontend
- **Dependencies:** P1-T07, P2-T05
- **Files:** `src/features/body-composition/components/ScanUpload.tsx`, `src/features/body-composition/components/ExtractionReview.tsx`, `src/features/body-composition/pages/UploadReportPage.tsx`
- **Requirements:**
  - Image upload with drag-and-drop
  - Loading state during AI processing
  - Review screen showing extracted values with confidence indicators (green/yellow/red)
  - Editable fields for user correction
  - Confirm button to persist
  - Low-confidence warning banner
  - Manual entry fallback if AI fails
- **Acceptance:** User uploads scan, reviews extraction, corrects if needed, confirms
- **Tests:** UI states for all confidence levels, edit and confirm flow

### P2-T07: Progress Analysis

- **Owner:** AI/Backend
- **Dependencies:** P2-T01, P2-T04
- **Files:** `ai-service/app/pipelines/analysis/progress.py`, `ai-service/app/api/v1/analysis.py`, `ai-service/app/schemas/analysis.py`, backend `ai/service/` additions
- **Requirements:**
  - POST `/api/v1/analysis/progress` (Python) — analyze body comp + workout + nutrition trends
  - Spring Boot endpoint POST `/ai/analyze-progress` — gather user data, call AI, return insights
  - Response: summary, insights with confidence, recommendations with priority
  - Include `data_quality_note` if insufficient data
  - Persist insights to `ai_insights` table
- **Acceptance:** Returns meaningful analysis given sufficient user data
- **Tests:** Handles insufficient data gracefully, insights are actionable

### P2-T08: Meal Photo Estimation

- **Owner:** AI/Backend
- **Dependencies:** P2-T01, P1-T05
- **Files:** `ai-service/app/pipelines/nutrition/meal_estimator.py`, `ai-service/app/api/v1/estimation.py`, `ai-service/app/schemas/nutrition.py`, backend additions
- **Requirements:**
  - POST `/api/v1/estimation/meal` (Python) — estimate nutrition from food photo
  - Spring Boot endpoint POST `/ai/estimate-meal`
  - Return estimated items with per-item confidence
  - Always include disclaimer
  - Never auto-log — user must confirm
- **Acceptance:** Returns reasonable estimates for common meals
- **Tests:** Disclaimer always present, confidence scores included

### P2-T09: AI Insights Frontend

- **Owner:** Frontend
- **Dependencies:** P2-T07, P2-T08
- **Files:** `src/features/dashboard/components/AIInsights.tsx`, `src/api/ai.api.ts`, `src/features/nutrition/components/MealPhotoEstimate.tsx`
- **Requirements:**
  - AI insights card on dashboard
  - Dismiss insight action
  - Meal photo upload with estimation results display
  - "Add to meal log" action from estimation results
  - Disclaimer display on all AI-generated content
- **Acceptance:** User can view insights, dismiss them, estimate meal from photo
- **Tests:** Insight display, dismiss action, estimation flow

---

## PHASE 3 — Product Intelligence

### P3-T01: Products Backend

- **Owner:** Backend
- **Dependencies:** P1-T01, P0-T03
- **Files:** `db/migration/V7__create_products.sql`, `product/entity/`, `product/dto/`, `product/service/ProductService.java`, `product/controller/ProductController.java`, `product/repository/`
- **Requirements:**
  - Migration: `products`, `product_nutrition`, `product_prices`, `product_verifications`, `price_alerts` tables
  - Products CRUD with nutrition data
  - Price entry and history query
  - Product comparison endpoint (GET `/products/compare?ids=...`)
  - Product search with category, brand, verified filters
- **Acceptance:** Products CRUD, price history, and comparison work
- **Tests:** CRUD operations, comparison with multiple products

### P3-T02: Product Verification & Price Alerts Backend

- **Owner:** Backend
- **Dependencies:** P3-T01
- **Files:** `product/service/VerificationService.java`, `product/service/PriceAlertService.java`, `product/controller/` additions
- **Requirements:**
  - POST `/products/{id}/verify` — submit verification with optional evidence file
  - Price alerts CRUD (POST, GET, PUT, DELETE `/price-alerts`)
  - Unique constraint: one alert per user per product
  - Alert trigger check (service method, not automated yet)
- **Acceptance:** Verification and alert CRUD works
- **Tests:** Unique constraint, alert trigger logic

### P3-T03: Notifications Backend

- **Owner:** Backend
- **Dependencies:** P0-T03, P1-T01
- **Files:** `db/migration/V8__create_notifications.sql`, `notification/entity/`, `notification/dto/`, `notification/service/NotificationService.java`, `notification/controller/NotificationController.java`, `notification/repository/`
- **Requirements:**
  - Migration: `notifications`, `ai_insights` tables
  - GET `/notifications` with read/type filter, pagination, unread count
  - PUT `/notifications/{id}/read`, PUT `/notifications/read-all`
  - `NotificationService.create()` — used internally by other services
- **Acceptance:** Notification CRUD and unread count work
- **Tests:** Filtering, mark-as-read, unread count

### P3-T04: Products Frontend

- **Owner:** Frontend
- **Dependencies:** P1-T02, P3-T01, P3-T02
- **Files:** `src/api/product.api.ts`, `src/features/products/pages/`, `src/features/products/components/`, `src/features/products/hooks/`
- **Requirements:**
  - Product catalog page with search, category filter, verified filter
  - Product detail page with nutrition info and price history chart
  - Product comparison page (side-by-side, up to 4)
  - Price alert creation and management
  - Product submission form
- **Acceptance:** User can browse, compare products, and set price alerts
- **Tests:** Comparison renders correctly, alert CRUD works

### P3-T05: Notifications Frontend

- **Owner:** Frontend
- **Dependencies:** P1-T16, P3-T03
- **Files:** `src/features/notifications/`, `src/components/layout/NotificationBell.tsx`
- **Requirements:**
  - Notification bell icon in navbar with unread count badge
  - Notification dropdown/panel with list
  - Mark as read on click
  - Mark all as read button
  - Poll for new notifications (TanStack Query refetchInterval)
- **Acceptance:** Notifications display, unread count updates, mark-as-read works
- **Tests:** Badge count, mark-as-read updates UI

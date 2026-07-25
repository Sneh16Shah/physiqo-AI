# PhysiqO-AI — Roadmap

> **Version:** 1.0.0 · **Status:** Design Phase

---

## Phase 0 — Foundation (Week 1–2)

**Goal:** Project scaffolding, CI, infrastructure, and shared tooling.

- [ ] Repository structure (monorepo layout)
- [ ] Docker Compose with PostgreSQL, Redis, MinIO
- [ ] Spring Boot project scaffold (Maven, dependencies, config)
- [ ] Flyway setup with initial migration
- [ ] Frontend project scaffold (Vite + React + TypeScript + Tailwind)
- [ ] Python AI service scaffold (FastAPI + Pydantic)
- [ ] Shared error handling (Spring Boot + Python)
- [ ] Logging setup with request ID correlation
- [ ] `.env.example`, `docker-compose.yml`
- [ ] Health check endpoints

---

## Phase 1 — MVP (Week 3–6)

**Goal:** Core features — auth, profiles, body composition, workouts, basic nutrition.

### Authentication & Users
- [ ] JWT authentication (register, login, refresh, logout)
- [ ] Spring Security configuration
- [ ] User profile CRUD
- [ ] Frontend auth flow (login, register, protected routes)
- [ ] Auth state management (TanStack Query + Zustand)

### Body Composition
- [ ] Body composition reports — manual entry CRUD
- [ ] Body measurements CRUD
- [ ] Trend visualization (line charts)
- [ ] Frontend body composition pages

### Workouts
- [ ] Muscles & exercises reference data + CRUD
- [ ] Workout plans CRUD (with days & exercises)
- [ ] Workout session logging (sets, reps, weight)
- [ ] Frontend workout pages

### Nutrition
- [ ] Foods database + custom food entry
- [ ] Meal logging CRUD
- [ ] Daily nutrition summary
- [ ] Nutrition goals CRUD
- [ ] Frontend nutrition pages

### Dashboard
- [ ] Dashboard page with key metrics
- [ ] Recent activity feed
- [ ] Quick-entry widgets

---

## Phase 2 — AI Features (Week 7–10)

**Goal:** AI-powered OCR, analysis, and estimation.

### AI Infrastructure
- [ ] AIProvider interface with OpenAI implementation
- [ ] Gemini provider (secondary)
- [ ] Confidence scoring framework
- [ ] AI response validation

### Body Composition OCR
- [ ] Image upload pipeline (Spring Boot → MinIO → Python)
- [ ] OCR preprocessing pipeline
- [ ] Body composition extraction with structured output
- [ ] User review & correction UI
- [ ] Confidence-based UX (green/yellow/red indicators)

### Analysis & Estimation
- [ ] Progress analysis endpoint
- [ ] Workout analysis endpoint
- [ ] Meal photo estimation
- [ ] Diet plan suggestions
- [ ] AI insights persistence & notification

---

## Phase 3 — Product Intelligence (Week 11–14)

**Goal:** Protein/supplement product catalog, price tracking, and comparison.

- [ ] Products CRUD
- [ ] Product nutrition data
- [ ] Price tracking & history
- [ ] Product verification flow
- [ ] Price alerts (create, manage, trigger)
- [ ] Product comparison view
- [ ] Notification system
- [ ] Frontend product pages

---

## Phase 4 — Polish & Production (Week 15+)

**Goal:** Production hardening, UX polish, and advanced features.

- [ ] Email verification
- [ ] Password reset flow
- [ ] Account deletion (GDPR)
- [ ] Rate limiting (production tuning)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Production deployment (VPS + Nginx + TLS)
- [ ] Performance optimization
- [ ] Mobile-responsive polish
- [ ] PWA support
- [ ] Advanced analytics & charts
- [ ] Data export (CSV/PDF)

---

## Success Metrics

| Phase | Metric | Target |
|---|---|---|
| Phase 0 | All services start with `docker compose up` | Pass |
| Phase 1 | User can register, log workouts, track nutrition | Pass |
| Phase 2 | OCR extracts body comp from InBody scan | ≥ 80% accuracy |
| Phase 3 | User can compare 3+ products with price history | Pass |
| Phase 4 | Production deployment with TLS and monitoring | Pass |

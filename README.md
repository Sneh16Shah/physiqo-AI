# PhysiqO-AI

A modular monolith for body-composition tracking, workout planning, nutrition logging, and protein/supplement product discovery — augmented by AI-driven OCR and insights.

> **Status:** Production-Ready MVP (Phase 0–3 Complete)

## Architecture (one-line)

```
React + TypeScript  →  Spring Boot 3  →  PostgreSQL 16
                          ↓ (internal)
                  Python FastAPI (AI/OCR only)  →  OpenAI / Gemini
```

Supporting services: **Redis** (sessions, rate limit, refresh tokens), **MinIO** (S3 file storage).

---

## 🚀 Quickstart & Setup

### Prerequisites
- [Docker Desktop](https://www.docker.com/) (or Docker Engine + Docker Compose v2)

### 1-Command Startup (Full Stack in Docker)
```bash
# 1. Create environment configuration
cp .env.example .env

# 2. Build & start all services (Frontend, Backend, AI Service, Postgres, Redis, MinIO)
docker compose --profile app up -d --build
```

### 📍 Access Points

| Service | Access URL | Port |
|---|---|---|
| **React Frontend SPA** | [http://localhost:5173](http://localhost:5173) | `5173` |
| **Spring Boot Backend API** | [http://localhost:8080](http://localhost:8080) | `8080` |
| **FastAPI Python AI Service** | [http://localhost:8000](http://localhost:8000) | `8000` |
| **MinIO Storage Console** | [http://localhost:9001](http://localhost:9001) | `9001` |
| **PostgreSQL Database** | `localhost:5433` | `5433` |
| **Redis Cache** | `localhost:6379` | `6379` |

---

## 🛠️ Useful Commands

```bash
# Check service health
docker compose ps

# Tail live application logs
docker compose --profile app logs -f

# Stop all services
docker compose --profile app down

# Reset database and data volumes
docker compose --profile app down -v
```

---

## Repository Layout

```
physiqo-AI/
├── docs/            # Architecture, DB schema, API spec, security, deployment
├── frontend/        # React + TS + Vite SPA (Nginx containerized)
├── backend/         # Spring Boot 3, Java 21
├── ai-service/      # Python FastAPI AI/OCR service
├── docker-compose.yml
├── .env.example
└── TASKS.md
```

---

## Documentation

| Document | What it covers |
|---|---|
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | System overview, service boundaries, data ownership |
| [`docs/DATABASE.md`](./docs/DATABASE.md) | PostgreSQL schema, migrations, indexes |
| [`docs/API_SPEC.md`](./docs/API_SPEC.md) | REST API contract (`/api/v1`) |
| [`docs/AI_ARCHITECTURE.md`](./docs/AI_ARCHITECTURE.md) | AI provider interface, OCR pipeline, confidence rules |
| [`docs/SECURITY.md`](./docs/SECURITY.md) | JWT, RBAC, rate limiting, prompt injection |
| [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) | Docker Compose, Dockerfiles, prod VPS layout |
| [`TASKS.md`](./TASKS.md) | Implementation task breakdown & phase status |

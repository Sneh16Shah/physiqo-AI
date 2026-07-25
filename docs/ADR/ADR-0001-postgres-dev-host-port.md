# ADR-0001: Remap PostgreSQL host port to 5433 for local development

- **Status:** Accepted
- **Date:** 2026-07-19
- **Decision owner:** Lead Full-Stack Implementation Engineer
- **Supersedes / amends:** Amends `docs/DEPLOYMENT.md` §1 (Docker Compose) and §3
  (port mapping) **for local development only**
- **Architect review requested:** No — local-dev-only; production path unchanged.
  Flag for Principal Architect awareness at next review.

---

## Context

`docs/DEPLOYMENT.md` specifies the PostgreSQL container with a `5432:5432` host
port binding. During P0-T01 (Repository Structure & Docker Compose) acceptance
testing on the developer's machine, `docker compose up` failed with:

```
Bind for 0.0.0.0:5432 failed: port is already allocated
```

Investigation showed an unrelated project (`askmypdf-postgres`, a
`postgres:15-alpine` container from a separate repository) was already bound to
host port 5432 and could not be displaced without disrupting that project.

The PhysiqO backend, AI service, and other Compose services communicate with
PostgreSQL over the internal Docker network (`physiqo-net`), where the container
continues to listen on the canonical port 5432. **Only the host-side publish
binding** — used when running Spring Boot / `psql` directly on the host during
development — is in conflict.

## Problem

We need every developer to be able to run `docker compose up` successfully even
when another local project already occupies host port 5432, while:

1. Keeping the production deployment path identical to `docs/DEPLOYMENT.md`
   (container-to-container traffic on 5432).
2. Avoiding a hard requirement that developers stop other projects.
3. Making the override discoverable and documented, not silent.

## Options considered

| # | Option | Verdict |
|---|---|---|
| 1 | Override host port via a local `.env` (`POSTGRES_PORT=5433`), compose file stays `5432:5432` by default. | Rejected by the implementer's direction — wanted the project default itself to avoid the conflict so a fresh clone works without per-developer `.env` editing. |
| 2 | Stop the other project's Postgres whenever working on PhysiqO. | Rejected — fragile, disrupts unrelated work, easy to forget. |
| 3 | **Permanently remap the host-side publish port to `5433` in `docker-compose.yml`. Container-internal port stays 5432.** | **Chosen.** |
| 4 | Run all infra on the host (no Docker). | Rejected — contradicts the architecture and P0-T01 acceptance criteria. |

## Decision

**The host-side published port for PostgreSQL is `5433`. The container-internal
port remains `5432`.**

Concretely, in `docker-compose.yml`:

```yaml
postgres:
  ports:
    - "${POSTGRES_HOST_PORT:-5433}:5432"   # host:container
```

- Inside the Docker network, services connect to `postgres:5432` (unchanged).
- From the host (e.g. Spring Boot run via `./mvnw spring-boot:run`, or `psql`),
  the database is reachable at `localhost:5433`.
- The default `SPRING_DATASOURCE_URL` in `.env.example` and `README.md` is
  `jdbc:postgresql://localhost:5433/physiqo`.
- The mapping is overridable per environment via `POSTGRES_HOST_PORT`.

**Production is unaffected.** This ADR concerns only the developer's host port
binding. In production, Spring Boot runs inside the Compose network and connects
to `postgres:5432` directly (no host publish required); the production nginx/VPS
topology in `docs/DEPLOYMENT.md` §3 does not expose Postgres to the host at all.

## Consequences

**Positive:**
- Fresh clones of the repo can `docker compose up` even when another local
  Postgres occupies 5432.
- No disruption to other projects on the developer's machine.
- Override remains possible via `POSTGRES_HOST_PORT` for environments that prefer
  5432 or any other port.

**Negative:**
- `docs/DEPLOYMENT.md` §1 must be updated to reflect the host port change (done
  alongside this ADR).
- Developers must remember to connect host-side tooling to **5433**, not 5432.
  This is called out in the root `README.md`, `.env.example`, and
  `backend/README.md`.
- Anyone whose workflow assumes 5432 will need to adjust their `SPRING_DATASOURCE_URL`.

## Verification

- `docker compose up -d` succeeds with no port conflict on this machine.
- All three infra containers reach `healthy`.
- `psql -h localhost -p 5433 -U physiqo` connects; inter-container traffic still
  uses 5432.

# ai-service/

Python FastAPI companion service — AI/OCR only.

> **Status:** Scaffold pending (task **P0-T05**). This directory is a placeholder.

## Scope (per `docs/ARCHITECTURE.md` §6, `docs/AI_ARCHITECTURE.md`)

This service **only** does AI/OCR work. It:

- Receives requests from Spring Boot over the internal Docker network.
- Calls OpenAI / Gemini for vision OCR, analysis, and estimation.
- Returns **structured, schema-validated** Pydantic responses with confidence scores.

It **never** writes to PostgreSQL. Spring Boot validates and persists everything.

## Layout (target)

```
ai-service/app/
├── main.py                 # FastAPI app
├── config.py               # pydantic-settings
├── api/v1/
│   ├── ocr.py              # OCR endpoints
│   ├── analysis.py         # Analysis endpoints
│   └── estimation.py       # Meal/diet estimation
├── core/
│   ├── ai_provider.py      # AIProvider Protocol
│   ├── openai_provider.py
│   ├── gemini_provider.py
│   └── confidence.py       # Confidence scoring
├── pipelines/
│   ├── ocr/                # preprocessor, extractor, body_comp
│   ├── analysis/           # progress, workout
│   └── nutrition/          # meal_estimator, diet_planner
├── schemas/                # Pydantic models
└── utils/                  # image.py, storage.py
```

## AI safety rules (from `docs/AI_ARCHITECTURE.md` §8)

```
NEVER  auto-persist uncertain health measurements
NEVER  fabricate values for missing fields
NEVER  present estimates as facts
ALWAYS return confidence scores with every extraction
ALWAYS include disclaimers on AI-generated content
ALWAYS allow the user to override/correct every AI output
ALWAYS log raw AI responses for audit
```

## Dev (once scaffolded)

```bash
cd ai-service
python -m venv .venv && source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000            # http://localhost:8000
```

`OPENAI_API_KEY` (or `GEMINI_API_KEY`) must be set in `.env` — see `../.env.example`.

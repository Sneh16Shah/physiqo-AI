# frontend/

React + TypeScript single-page application — the presentation layer.

> **Status:** Scaffold pending (task **P0-T04**). This directory is a placeholder.

## Target stack (per `docs/ARCHITECTURE.md` §4)

- **React 18** + **TypeScript 5** + **Vite 5**
- **Tailwind CSS 3** for styling
- **TanStack Query v5** for all server state
- **React Router v6** for routing
- **Zustand** for client-only UI state
- **React Hook Form + Zod** for forms & validation
- **Recharts** for visualization
- **Axios** for HTTP

## Layout (target)

```
frontend/
├── src/
│   ├── api/           # Axios instance + endpoint modules
│   ├── components/
│   │   ├── ui/        # Button, Input, Card, Modal
│   │   ├── layout/    # Shell, Sidebar, Navbar
│   │   └── charts/    # Recharts wrappers
│   ├── features/      # Feature modules (co-located)
│   │   ├── auth/      # components/ hooks/ pages/ types.ts
│   │   ├── dashboard/
│   │   ├── body-composition/
│   │   ├── workouts/
│   │   ├── nutrition/
│   │   └── products/
│   ├── hooks/         # Global hooks
│   ├── lib/           # units.ts, validation.ts, constants
│   ├── stores/        # Zustand (theme, UI state)
│   ├── types/         # Shared TS types
│   ├── App.tsx
│   └── routes.tsx
├── tailwind.config.ts
└── vite.config.ts
```

**Frontend rules** (from `docs/ARCHITECTURE.md`):
- TanStack Query for **all** server state.
- Zero backend business logic in React.
- Unit conversion happens at the display boundary, never in stored data.

## Dev (once scaffolded)

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173  (proxies /api → :8080)
```

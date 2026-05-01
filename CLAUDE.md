# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Downhill Radar** — a full-stack web app for downhill longboarding race history and community engagement. Monorepo with three main parts: a Python/FastAPI backend, a Next.js 15 frontend, and a PostGIS PostgreSQL database.

## Development Commands

### Local Setup (3 terminals)

```bash
# Terminal 1: Database
cd infra && docker compose up -d

# Terminal 2: Backend
cd backend && uvicorn app.main:app --reload

# Terminal 3: Frontend
cd frontend && npm run dev
```

### Frontend (`frontend/`)

```bash
npm run dev      # Dev server with Turbopack
npm run build    # Production build
npm run lint     # ESLint
```

### Backend (`backend/`)

```bash
uvicorn app.main:app --reload          # Dev server
uvicorn app.main:app --host 0.0.0.0 --port $PORT  # Production
```

### Database

SQL dumps in repo root for fast setup:
- `database_schema.sql` — tables, indexes, PostGIS extensions
- `database_data.sql` — sample race data
- `database_full.sql` — complete schema + data

Alembic is configured for schema migrations.

## Architecture

### Backend (`backend/app/`)

FastAPI app with modular routers registered in `main.py`:

- `core/config.py` — Settings via `pydantic-settings` (DATABASE_URL, JWT_SECRET, CORS_ORIGINS)
- `core/db.py` — SQLAlchemy session management (FastAPI `Depends` injection)
- `core/security.py` — JWT creation/validation, role-based access (OWNER, ADMIN, USER)
- `core/norm.py` — String normalization for case-insensitive search/comparison
- `models/models.py` — SQLAlchemy ORM: `User`, `RaceEvent`, `Person`, `Result`, `Submission`, `Video`, `VideoLike`, `Bio`
- `api/` — Route modules: `auth`, `races`, `bio`, `submissions`, `videos`, `uploads`, `admin_races`, `admin_users`, `events`

Race locations use PostGIS `Geography(Point, 4326)`; GeoJSON responses use `[lng, lat]` coordinate order.

User submissions go through an admin approval workflow before appearing publicly.

### Frontend (`frontend/src/`)

Next.js 15 App Router with TypeScript. Path alias `@/*` → `./src/*`.

- `app/` — Pages and Next.js API route proxies to the backend
- `app/api/` — Proxy routes (races, auth, submit, admin, bio, videos)
- `components/` — Reusable components including `Map.tsx` (MapLibre GL), `Header.tsx`, `YearBar.tsx`
- `lib/api.ts` — All fetch functions (`fetchRaces`, `fetchVideos`, etc.)
- `lib/map-config.ts`, `lib/event-filters.ts`, `lib/rider-utils.ts` — Shared utilities

The home page (`app/page.tsx`) drives the main UX: year selector → GeoJSON map → top riders + event list.

### Infrastructure & Deployment

- **Local DB**: Docker Compose (`infra/docker-compose.yml`) runs `postgis/postgis:16-3.4`
- **Production**: Railway (backend) + Vercel (frontend) + Supabase (managed PostGIS)
- See `MIGRATION_GUIDE.md` for the 6-phase production deployment process
- Backend env vars template: `backend/.env.example` and `railway_env_vars.txt`

## Key Configuration

Backend defaults (override via environment or `.env`):
```
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/longboard
JWT_SECRET=change-me
CORS_ORIGINS=http://localhost:3000
```

Frontend requires `NEXT_PUBLIC_API_BASE` pointing to the backend URL in production.

`next.config.ts` allows YouTube image hostnames and disables ESLint/TypeScript build errors (don't rely on build-time checks).

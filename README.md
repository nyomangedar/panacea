# Panacea

A modular single-tenant web application. The backbone is a lean **core** — a Fastify API gateway plus a React shell — and features are added as self-contained full-stack **modules** that plug into the core without modifying it. Each module is its own repository (own routes, UI, database schema, and event contracts) and communicates only via the event bus or HTTP.

This repo (`panacea/`) is the **core**: the shell backend, the shell frontend, and the shared packages.

> **Status:** core backend (auth, module loader, event bus) and core frontend shell (tabs, module registry/picker, login) are in place. Feature modules (admin, ticketing) are placeholders until their milestones.

## Tech stack

TypeScript 5 · Fastify · React + Vite + React Router v7 + TanStack Query · Tailwind + custom `@panacea/ui` · PostgreSQL (postgres.js) + Drizzle migrations · hand-rolled JWT + bcrypt · Turborepo + pnpm workspaces.

## Layout

```
apps/shell/backend     Fastify server: auth, module loader, event bus, health
apps/shell/frontend    React + Vite shell: tabs, module registry/picker, login
packages/ui            @panacea/ui — shared components (Button, Input, Modal, …)
packages/shared        shared types/utilities
```

## Prerequisites

- Node.js >= 20, pnpm >= 9 (`corepack enable`)
- Docker Desktop (for Postgres/Redis) — must be running
- Windows + PowerShell (the start script is PowerShell)

```powershell
pnpm install
```

## Quick start (one command)

Starts Postgres, the backend (auto-migrates), seeds a login user, and the frontend — in the right order:

```powershell
.\scripts\dev-up.ps1
# if blocked by execution policy:
powershell -ExecutionPolicy Bypass -File .\scripts\dev-up.ps1
```

Then open **http://localhost:5173** and sign in with:

```
admin@panacea.dev / password123
```

The backend and frontend each open in their own window (so you see their logs). To stop:

```powershell
# close the backend/frontend windows, then:
docker compose stop postgres redis
```

URLs: frontend `http://localhost:5173` · backend health `http://localhost:3000/health`.

## Common commands

```powershell
pnpm turbo test         # run all tests (backend tests need Docker running)
pnpm turbo typecheck    # type-check all packages
pnpm turbo build        # build all packages

# a single package
pnpm --filter @panacea/shell test
pnpm --filter @panacea/shell-frontend dev
```

## Notes

- The backend reads its config from environment variables (no `.env` loader). `dev-up.ps1` sets sensible dev defaults; see `.env.example` for the full list.
- `apps/shell/backend/dev-seed.ts` creates/updates the login user (override with `$env:SEED_EMAIL` / `$env:SEED_PASSWORD`).
- Architecture, milestones, and development rules live in the `claude/` docs folder (outside this repo).

# TuneTrack

A personal music tracking app, styled as a dim, warm used-record shop you dig through rather than a streaming dashboard. Browse a catalog of artists/albums/tracks, log plays, and check your own listening stats.

## Stack

- **API**: ElysiaJS (Bun runtime) + Drizzle ORM (Postgres) + JWT auth + Swagger/OpenAPI docs
- **Web**: React 19 + Vite + Tailwind v4 + shadcn (migrating Radix → Base UI)
- **Auth**: JWT bearer tokens, 3-role RBAC — `ADMIN`, `CURATOR`, `LISTENER`
- **Package manager**: pnpm workspace (`api` + `web`)

### Roles

| Role | Can do |
|---|---|
| `LISTENER` | Browse artists/albums/tracks, scrobble (log plays), view own recent plays + top-artists stats |
| `CURATOR` | Everything `LISTENER` can, plus create/edit/delete artists, albums, and tracks |
| `ADMIN` | Everything `CURATOR` can, plus change any (non-admin) user's role (`PATCH /users/:id/role`) |

## Quickstart (Docker)

No Bun/pnpm/Node needed on the host — just Docker:

```bash
docker compose up --build
```

Brings up Postgres, applies migrations (one-shot `migrate` service), then starts the API (`http://localhost:3000`) and web app (`http://localhost:5173`). First run seeds no data — see [Logging in](#logging-in) below for the seed script if you want the three test accounts; run it against the containerized DB with:

```bash
docker compose run --rm --entrypoint bun migrate src/db/seed.ts
```

Override any of `POSTGRES_PASSWORD`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `WEB_ORIGIN`, `VITE_API_URL` via a root `.env` file — see `docker-compose.yml` for defaults. Image build details, non-root/multi-stage conventions, and production deployment notes (secrets, CORS, migrations-per-deploy, reverse proxy, etc.) live in [`docs/deploy.md`](docs/deploy.md).

## Local dev (no Docker)

Prefer running things directly for tighter iteration? You'll need:

- **Bun** (runs the API) — https://bun.sh
- **Node.js 20+** (tested on 22) and **pnpm** — `corepack enable pnpm` if you don't have pnpm yet, or `npm i -g pnpm`
- **PostgreSQL** — a local instance, `docker compose up postgres` from this repo, or a free hosted Postgres DB (prints a connection string you paste into `DATABASE_URL`)

### Setup (from a fresh clone)

```bash
pnpm install
```

Installs both `api` and `web` from the workspace root — one `pnpm-lock.yaml` is produced, no per-package lockfiles.

### 1. API

```bash
cp api/.env.example api/.env
```

Edit `api/.env`:

| Var | Meaning |
|---|---|
| `PORT` | Port the API listens on (default `3000`) |
| `JWT_SECRET` | Secret used to sign/verify auth tokens — any random string works for local dev (`openssl rand -hex 32` to generate one); it just needs to **stay the same** across restarts or existing tokens stop verifying |
| `JWT_EXPIRES_IN` | How long a login token stays valid (e.g. `1d`) |
| `WEB_ORIGIN` | The frontend's URL, for CORS — must match wherever the frontend actually runs (default `http://localhost:5173`) |
| `DATABASE_URL` | Postgres connection string (local, Docker, or hosted — see Prerequisites) |

Apply migrations and seed test data:

```bash
pnpm --filter api run db:migrate
pnpm --filter api run db:seed
```

Start the API:

```bash
pnpm --filter api run start:dev
```

API is now on `http://localhost:3000`. Interactive API docs (Swagger) are at `http://localhost:3000/api/docs` — click **Authorize** and paste a bearer token (from `POST /auth/login`) to call protected routes directly from the docs UI.

### 2. Web

In a separate terminal:

```bash
cp web/.env.example web/.env
pnpm --filter web run dev
```

Frontend is now on `http://localhost:5173`. `VITE_API_URL` in `web/.env` already points at `http://localhost:3000` by default — only change it if your API runs somewhere else, and keep it in sync with the API's `WEB_ORIGIN`.

## Logging in

The seed script creates three test accounts, all with password `password123`:

| Email | Role |
|---|---|
| `admin@test.com` | ADMIN |
| `curator@test.com` | CURATOR |
| `listener@test.com` | LISTENER |

Log in as `admin@test.com` to see curator controls (shelving/editing/deleting records) and role management. New signups via the app's register form default to `LISTENER` — promote one via `PATCH /users/:id/role` (as an admin) if you need another privileged account. An admin can't demote themselves or another admin.

# TuneTrack

A personal music tracking app, styled as a dim, warm used-record shop you dig through rather than a streaming dashboard. Browse a catalog of artists/albums/tracks, log plays, and check your own listening stats.

## Stack

- **Backend**: NestJS 10 + Prisma 7 (Postgres) + Passport/JWT auth + Swagger/OpenAPI docs
- **Frontend**: React 19 + Vite + Tailwind v4 + shadcn/Radix components
- **Auth**: JWT bearer tokens, 3-role RBAC — `ADMIN`, `CURATOR`, `LISTENER`

### Roles

| Role | Can do |
|---|---|
| `LISTENER` | Browse artists/albums/tracks, scrobble (log plays), view own recent plays + top-artists stats |
| `CURATOR` | Everything `LISTENER` can, plus create/edit/delete artists, albums, and tracks |
| `ADMIN` | Everything `CURATOR` can, plus change any user's role (`PATCH /users/:id/role`) |

## Prerequisites

- **Node.js 20+** (tested on 22)
- **npm** (repo uses npm, not pnpm/yarn — `package-lock.json` is committed)
- **PostgreSQL** — any of:
  - a local Postgres instance
  - a Postgres container (`docker run -d -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=tunetrack -p 5432:5432 postgres`)
  - a free hosted Prisma Postgres DB via `npx create-db` (run from `backend/`) — prints a connection string you paste into `DATABASE_URL`

## Setup (from a fresh clone)

### 1. Backend

```bash
cd backend
npm install
cp ../.env.example .env
```

Edit `backend/.env`:

| Var | Meaning |
|---|---|
| `PORT` | Port the API listens on (default `3000`) |
| `JWT_SECRET` | Secret used to sign/verify auth tokens — any random string works for local dev (`openssl rand -hex 32` to generate one); it just needs to **stay the same** across restarts or existing tokens stop verifying |
| `JWT_EXPIRES_IN` | How long a login token stays valid (e.g. `1d`) |
| `WEB_ORIGIN` | The frontend's URL, for CORS — must match wherever the frontend actually runs (default `http://localhost:5173`) |
| `DATABASE_URL` | Postgres connection string (local, Docker, or hosted — see Prerequisites) |

Then generate the Prisma client, apply migrations, and seed test data:

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

Start the API:

```bash
npm run start:dev
```

Backend is now on `http://localhost:3000`. Interactive API docs (Swagger) are at `http://localhost:3000/api/docs` — click **Authorize** and paste a bearer token (from `POST /auth/login`) to call protected routes directly from the docs UI.

### 2. Frontend

In a separate terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend is now on `http://localhost:5173`. `VITE_API_URL` in `frontend/.env` already points at `http://localhost:3000` by default — only change it if your backend runs somewhere else, and keep it in sync with backend's `WEB_ORIGIN`.

## Logging in

The seed script creates three test accounts, all with password `password123`:

| Email | Role |
|---|---|
| `admin@test.com` | ADMIN |
| `curator@test.com` | CURATOR |
| `listener@test.com` | LISTENER |

Log in as `admin@test.com` to see curator controls (shelving/editing/deleting records) and role management. New signups via the app's register form default to `LISTENER` — promote one via `PATCH /users/:id/role` (as an admin) if you need another privileged account.


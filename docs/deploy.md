# Pre-deploy notes

Answers for *this* app, not generic Docker advice. Nothing here is wired up — no CI/CD, no registry push, no TLS. That's #49 and beyond. This is the checklist to work through before any of that happens.

## Secrets

`JWT_SECRET` ships in `docker-compose.yml` with a `change-me` default so a fresh clone works with zero setup — that default is fine for local dev and nowhere else. A real deploy needs it (and `POSTGRES_PASSWORD`) sourced from whatever the target platform's secret store is — a hosted Postgres provider's connection string for `DATABASE_URL`, and the orchestrator's secret mechanism (e.g. a Fly.io/Render/ECS secret, a Kubernetes `Secret`, Docker Swarm secrets) for `JWT_SECRET`. Never bake either into an image layer or commit them — `docker-compose.yml` already keeps them as `environment:` values sourced from the shell/`.env`, not `ARG`/`ENV` in the Dockerfiles, specifically so they never end up in image history.

Rotating `JWT_SECRET` invalidates every outstanding token (everyone gets logged out) — that's a real user-facing event, not just a config change.

## `WEB_ORIGIN` / CORS

`WEB_ORIGIN` has to be the exact origin the browser sends in its `Origin` header when calling the api — i.e. wherever `web` is actually served from publicly (`https://app.example.com`), not an internal service name and not the build-time `VITE_API_URL`. If the frontend is served from more than one origin (a staging domain and a prod domain), the api's CORS handling (`@elysiajs/cors` in `api/src/index.ts`) currently takes a single origin — that'd need to become a list before a multi-environment deploy, not something to paper over with a wildcard.

## Should postgres's port be published?

No. `docker-compose.yml` intentionally doesn't publish it — only `api` and `migrate` need to reach it, and both do so over the compose network by service name (`postgres:5432`). In a real deploy, postgres should be even more locked down: a managed DB with no public endpoint, or a security-group/firewall rule restricting inbound 5432 to the api's own network. Publishing 5432 to the internet has no upside here and is a straightforward attack surface.

## Migrations per deploy

The `migrate` service is the one-shot mechanism — build it, run it to completion against the target DB, *then* roll out the new `api` image. That ordering matters: never start new `api` replicas before migrations finish, or they'll boot against a schema they don't expect. In an orchestrator this is typically a pre-deploy hook / init job (e.g. a Kubernetes `Job` or an ECS one-off task) rather than a long-running service — `docker-compose.yml`'s `depends_on: condition: service_completed_successfully` is the local-dev equivalent of that same gate.

Drizzle migrations here are additive-by-default (`drizzle-kit generate` produces new files, never edits old ones), so this is safe to run before every deploy without a rollback story for the migration step itself — but a migration that drops/renames a column used by the *currently running* (pre-deploy) api version would break it during the rollout window. None of the current migrations do that; if one ever needs to, it has to be split into an expand/contract pair across two deploys.

## Logs

Both `api` and `web` (nginx) log to stdout/stderr — never to a file in the container. That's deliberate: containers are ephemeral, a log written to disk inside one is gone the moment it's replaced, and every container platform (Docker, Kubernetes, ECS, Fly) already captures a container's stdout/stderr and ships it to whatever log sink is configured (CloudWatch, Loki, Datadog, `docker logs`) — writing to a file just means reimplementing that plumbing badly. Elysia's default logging already goes to stdout; nginx's `access_log`/`error_log` default to stdout/stderr in the official images.

## api container healthcheck

There's no dedicated `/health` route today. Cheapest real check: `GET /api/docs/json` (the OpenAPI spec, served by `@elysiajs/swagger`) — it requires the whole Elysia app + route tree to be up, costs nothing (a static in-memory response), and touches no external dependency (so it doesn't false-negative just because postgres is slow, which a DB-touching healthcheck would). A `docker-compose.yml`/orchestrator healthcheck would be `curl -f http://localhost:3000/api/docs/json` on an interval. A dedicated `/health` endpoint would be worth adding before this matters for real (e.g. if the orchestrator's readiness/liveness distinction needs different signals), but isn't needed to answer this checklist item.

## What sits in front of this

Nothing does yet. A real deploy needs a reverse proxy in front of both `api` and `web` (or a platform that provides one — a cloud load balancer, Fly's/Render's built-in proxy, an nginx/Caddy/Traefik box) to terminate TLS and route `/` → `web`, everything else (or a `/api` prefix) → `api`. Neither `api`'s Elysia server nor `web`'s nginx are configured to speak TLS themselves — that's intentionally out of scope for the app images; TLS termination belongs at the edge, not baked into every service.

## Image versioning

Not yet wired up (that's #49's job — CI + registry push), but the intended scheme: tag images with the git commit SHA (`ghcr.io/.../api:<sha>`), not `latest` — `latest` gives you no way to know what's actually running or to roll back to a specific previous build. A floating `:latest` (or branch-name) tag can additionally point at the newest commit on `master` for convenience, but the SHA tag is what a deploy should actually reference.

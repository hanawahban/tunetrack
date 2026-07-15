# syntax=docker/dockerfile:1.7

# Base runtime image, no build tooling -- reused by the final `runtime` stage
# so pnpm/dev deps never end up in what ships. `bunx pnpm@<pin>` (rather than
# a global `bun install -g`) runs pnpm on demand without needing it on PATH.
FROM oven/bun:1.3.14-slim AS base
WORKDIR /workspace

# Install layer: only the workspace manifests + lockfile, so a source-only
# edit below never invalidates this (and re-triggers a registry install).
# web/package.json still has to be present (it's a workspace member in
# pnpm-lock.yaml), but --filter keeps pnpm from installing its deps here.
FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY api/package.json ./api/package.json
COPY web/package.json ./web/package.json
RUN bunx pnpm@11.13.0 install --frozen-lockfile --filter api...

# Now bring in the actual api source.
FROM deps AS source
COPY api ./api

# Prod-only deploy: a self-contained copy of api/ (own node_modules, not
# hoisted-workspace symlinks) with just its production dependencies --
# exactly what the runtime image needs, nothing else.
FROM source AS deploy-prod
RUN bunx pnpm@11.13.0 --filter api deploy --prod --legacy /deploy

# Full deploy (prod + dev deps, so drizzle-kit is present) for the one-shot
# migration step -- never used by the runtime image, only the `migrate` target.
FROM source AS deploy-full
RUN bunx pnpm@11.13.0 --filter api deploy --legacy /deploy

FROM base AS migrate
COPY --from=deploy-full /deploy /app
WORKDIR /app
# invoke drizzle-kit's entry file directly with bun -- no pnpm/node needed at
# runtime just to run one CLI command
ENTRYPOINT ["bun", "node_modules/drizzle-kit/bin.cjs", "migrate"]

FROM base AS runtime
RUN groupadd --system --gid 1001 tunetrack \
  && useradd --system --uid 1001 --gid tunetrack --home-dir /app tunetrack
COPY --from=deploy-prod --chown=tunetrack:tunetrack /deploy /app
WORKDIR /app
USER tunetrack
EXPOSE 3000
CMD ["bun", "src/index.ts"]

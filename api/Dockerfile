# syntax=docker/dockerfile:1.7

# pnpm itself needs real Node (bun 1.3.14 can run pnpm's CLI but pnpm's
# install step hits `node:sqlite`, which bun doesn't implement) -- so deps/
# build stages run on node, and only the final images switch to bun, purely
# to run the already-resolved app with `bun src/index.ts`.
FROM node:24-slim AS base
RUN npm install -g pnpm@11.13.0
WORKDIR /workspace

# Install layer: only the workspace manifests + lockfile, so a source-only
# edit below never invalidates this (and re-triggers a registry install).
# web/package.json still has to be present (it's a workspace member in
# pnpm-lock.yaml), but --filter keeps pnpm from installing its deps here.
FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY api/package.json ./api/package.json
COPY web/package.json ./web/package.json
RUN pnpm install --frozen-lockfile --filter api...

# Now bring in the actual api source.
FROM deps AS source
COPY api ./api

# Prod-only deploy: a self-contained copy of api/ (own node_modules, not
# hoisted-workspace symlinks) with just its production dependencies --
# exactly what the runtime image needs, nothing else.
FROM source AS deploy-prod
RUN pnpm --filter api deploy --prod --legacy /deploy

# Full deploy (prod + dev deps, so drizzle-kit is present) for the one-shot
# migration step -- never used by the runtime image, only the `migrate` target.
FROM source AS deploy-full
RUN pnpm --filter api deploy --legacy /deploy

FROM oven/bun:1.3.14-slim AS migrate
COPY --from=deploy-full /deploy /app
WORKDIR /app
# invoke drizzle-kit's entry file directly with bun -- no pnpm/node needed at
# runtime just to run one CLI command
ENTRYPOINT ["bun", "node_modules/drizzle-kit/bin.cjs", "migrate"]

FROM oven/bun:1.3.14-slim AS runtime
RUN groupadd --gid 1001 tunetrack \
  && useradd --uid 1001 --gid tunetrack --home-dir /app tunetrack
COPY --from=deploy-prod --chown=tunetrack:tunetrack /deploy /app
WORKDIR /app
USER tunetrack
EXPOSE 3000
CMD ["bun", "src/index.ts"]

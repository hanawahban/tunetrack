# syntax=docker/dockerfile:1.7

FROM node:24-slim AS base
RUN npm install -g pnpm@11.13.0
WORKDIR /workspace

# Install layer: only the workspace manifests + lockfile, so a source-only
# edit below never invalidates this (and re-triggers a registry install).
# api/package.json still has to be present (it's a workspace member in
# pnpm-lock.yaml), but --filter keeps pnpm from installing its deps here.
FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY web/package.json ./web/package.json
COPY api/package.json ./api/package.json
RUN pnpm install --frozen-lockfile --filter web...

# orval's prebuild reads the committed api/docs/openapi.json (no running
# backend needed) -- bring in just that file, not the whole api/ tree.
FROM deps AS source
COPY api/docs/openapi.json ./api/docs/openapi.json
COPY web ./web

# VITE_API_URL is baked into the static bundle at build time (Vite inlines
# import.meta.env.VITE_* during `vite build`) -- there's no runtime env step
# for a static SPA, so it has to be supplied here.
FROM source AS build
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm --filter web run build

# nginxinc/nginx-unprivileged: same nginx image, pre-configured to run as a
# non-root user on port 8080 (plain nginx:alpine binds :80, which needs root).
FROM nginxinc/nginx-unprivileged:1.29-alpine AS runtime
COPY web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/web/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

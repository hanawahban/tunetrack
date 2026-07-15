import { defineConfig } from "orval"

export default defineConfig({
  tunetrack: {
    input: {
      target: "../api/docs/openapi.json",
    },
    output: {
      mode: "tags-split",
      target: "src/lib/api/generated/endpoints.ts",
      schemas: "src/lib/api/generated/model",
      client: "react-query",
      httpClient: "fetch",
      override: {
        contentType: {
          include: ["application/json"],
        },
        mutator: {
          path: "src/lib/custom-fetch.ts",
          name: "customFetch",
        },
        fetch: {
          includeHttpResponseReturnType: false,
        },
        query: {
          // with a custom mutator, the generated queryFn calls the request fn with a bare
          // AbortSignal as its `options` (typed RequestInit) — doesn't type-check. Disabling
          // signal-based cancellation avoids fighting the codegen for a minor perf nicety.
          signal: false,
          useInfinite: true,
          useInfiniteQueryParam: "cursor",
        },
      },
    },
  },
})

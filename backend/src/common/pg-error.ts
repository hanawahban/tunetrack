/** Drizzle wraps driver errors in DrizzleQueryError; the real Postgres error (with its SQLSTATE code under `.errno`) lives on `.cause`. */
export function pgErrorCode(err: unknown): string | undefined {
  const cause = err instanceof Error ? (err.cause ?? err) : err;
  if (typeof cause !== 'object' || cause === null) return undefined;
  return (cause as { errno?: string }).errno;
}

export const PG_UNIQUE_VIOLATION = '23505';
export const PG_FOREIGN_KEY_VIOLATION = '23503';

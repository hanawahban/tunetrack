/**
 * Drizzle wraps driver errors in DrizzleQueryError; the real Postgres error lives on `.cause`.
 * The SQLSTATE code lands on different properties depending on the driver: bun-sql's
 * PostgresError uses `.errno` (`.code` there is just a generic Bun marker); pglite's driver
 * (used in tests) uses `.code` directly. Check both so this works under either.
 */
export function pgErrorCode(err: unknown): string | undefined {
  const cause = err instanceof Error ? (err.cause ?? err) : err;
  if (typeof cause !== 'object' || cause === null) return undefined;
  const { errno, code } = cause as { errno?: string; code?: string };
  return errno ?? code;
}

export const PG_UNIQUE_VIOLATION = '23505';
export const PG_FOREIGN_KEY_VIOLATION = '23503';

import { describe, expect, test } from 'bun:test';
import { pgErrorCode, PG_UNIQUE_VIOLATION, PG_FOREIGN_KEY_VIOLATION } from './pg-error';

describe('pgErrorCode', () => {
  test('reads the SQLSTATE code off .cause of a DrizzleQueryError-shaped error', () => {
    const err = new Error('insert failed');
    (err as unknown as { cause: unknown }).cause = { errno: PG_UNIQUE_VIOLATION };
    expect(pgErrorCode(err)).toBe(PG_UNIQUE_VIOLATION);
  });

  test('reads the code directly off a plain object with no .cause', () => {
    expect(pgErrorCode({ errno: PG_FOREIGN_KEY_VIOLATION })).toBe(PG_FOREIGN_KEY_VIOLATION);
  });

  test('falls back to .code when .errno is absent (pglite driver shape)', () => {
    const err = new Error('insert failed');
    (err as unknown as { cause: unknown }).cause = { code: PG_UNIQUE_VIOLATION };
    expect(pgErrorCode(err)).toBe(PG_UNIQUE_VIOLATION);
  });

  test('prefers .errno over .code when both are present (bun-sql driver shape)', () => {
    const err = new Error('insert failed');
    (err as unknown as { cause: unknown }).cause = {
      errno: PG_UNIQUE_VIOLATION,
      code: 'ERR_POSTGRES_SERVER_ERROR',
    };
    expect(pgErrorCode(err)).toBe(PG_UNIQUE_VIOLATION);
  });

  test('returns undefined for an Error with no matching cause', () => {
    expect(pgErrorCode(new Error('boom'))).toBeUndefined();
  });

  test('returns undefined for non-object input', () => {
    expect(pgErrorCode('boom')).toBeUndefined();
    expect(pgErrorCode(null)).toBeUndefined();
    expect(pgErrorCode(undefined)).toBeUndefined();
  });
});

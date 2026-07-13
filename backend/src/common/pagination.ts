import { t, type TSchema } from 'elysia';

export type Cursor = { sortValue: Date; id: number };

/** Opaque cursor encoding a (sortValue, id) keyset position. Base64url so it round-trips safely in a URL. */
export function encodeCursor(sortValue: Date, id: number): string {
  return Buffer.from(JSON.stringify({ sortValue: sortValue.toISOString(), id })).toString('base64url');
}

/** Malformed/foreign cursors are treated as "start from the beginning" rather than a validation error. */
export function decodeCursor(cursor: string | undefined): Cursor | undefined {
  if (!cursor) return undefined;
  try {
    const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
    if (typeof parsed.sortValue !== 'string' || typeof parsed.id !== 'number') return undefined;
    const sortValue = new Date(parsed.sortValue);
    if (Number.isNaN(sortValue.getTime())) return undefined;
    return { sortValue, id: parsed.id };
  } catch {
    return undefined;
  }
}

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/** Clamps a caller-supplied limit into [1, MAX_PAGE_SIZE] so a huge or missing limit can't force a fetch-all. */
export function resolveLimit(raw?: number): number {
  return Math.min(Math.max(1, Math.trunc(raw ?? DEFAULT_PAGE_SIZE)), MAX_PAGE_SIZE);
}

export const paginationQuery = t.Object({
  cursor: t.Optional(t.String()),
  limit: t.Optional(t.Numeric({ minimum: 1 })),
});

export function paginatedResponse<T extends TSchema>(itemSchema: T) {
  return t.Object({
    items: t.Array(itemSchema),
    nextCursor: t.Nullable(t.String()),
  });
}

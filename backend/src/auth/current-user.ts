import { eq } from 'drizzle-orm';
import { t } from 'elysia';
import { db } from '../db';
import { users } from '../db/schema';

export const SAFE_SELECT = {
  id: users.id,
  email: users.email,
  role: users.role,
  createdAt: users.createdAt,
};

export const userResponse = t.Object({
  id: t.Number(),
  email: t.String(),
  role: t.Union([t.Literal('ADMIN'), t.Literal('CURATOR'), t.Literal('LISTENER')]),
  createdAt: t.String({ format: 'date-time' }),
});

type SafeUser = { id: number; email: string; role: string; createdAt: Date };

/** Maps a DB row's Date column to the ISO string the response schema (and Orval) expect on the wire. */
export function toUserResponse(user: SafeUser) {
  return { ...user, createdAt: user.createdAt.toISOString() };
}

export async function findSafeUserById(id: number) {
  const [user] = await db.select(SAFE_SELECT).from(users).where(eq(users.id, id));
  return user ?? null;
}

/** Includes the password hash -- only for verifying credentials at login, never returned as a response body. */
export async function findUserWithPasswordByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user ?? null;
}

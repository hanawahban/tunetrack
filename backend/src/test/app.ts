import { Elysia } from 'elysia';
import { eq } from 'drizzle-orm';
import { authRoutes } from '../auth/routes';
import { artistsRoutes } from '../artists';
import { albumsRoutes } from '../albums';
import { tracksRoutes } from '../tracks';
import { scrobblesRoutes } from '../scrobbles';
import { usersRoutes } from '../users';
import { statsRoutes } from '../stats';
import { users, type Role } from '../db/schema';
import { testDb } from './db';

/** Route modules composed without swagger/cors/listen -- for in-process request testing via .handle(). */
export const testApp = new Elysia()
  .use(authRoutes)
  .use(artistsRoutes)
  .use(albumsRoutes)
  .use(tracksRoutes)
  .use(scrobblesRoutes)
  .use(usersRoutes)
  .use(statsRoutes);

export async function login(email: string, password: string) {
  const res = await testApp.handle(
    new Request('http://localhost/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }),
  );
  const { access_token } = (await res.json()) as { access_token: string };
  return access_token;
}

export function authed(token: string) {
  return { Authorization: `Bearer ${token}` };
}

/** Registers a user via the real /auth/register flow, then promotes their role directly in the DB
 *  (registration always defaults to LISTENER -- there's no signup-time role param). */
export async function registerAs(email: string, role: Role, password = 'password123') {
  await testApp.handle(
    new Request('http://localhost/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }),
  );
  if (role !== 'LISTENER') {
    await testDb.update(users).set({ role }).where(eq(users.email, email));
  }
  const [user] = await testDb.select().from(users).where(eq(users.email, email));
  return user!;
}

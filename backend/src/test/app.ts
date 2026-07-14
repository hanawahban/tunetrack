import { Elysia } from 'elysia';
import { eq } from 'drizzle-orm';
import { sharedModels } from '../common/models';
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
  .use(sharedModels)
  .use(authRoutes)
  .use(artistsRoutes)
  .use(albumsRoutes)
  .use(tracksRoutes)
  .use(scrobblesRoutes)
  .use(usersRoutes)
  .use(statsRoutes);

export function authed(token: string) {
  return { Authorization: `Bearer ${token}` };
}

type ReqOpts = { token?: string; body?: unknown };

function api(method: string, path: string, { token, body }: ReqOpts = {}) {
  return testApp.handle(
    new Request(`http://localhost${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? authed(token) : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  );
}

export const get = (path: string, opts?: ReqOpts) => api('GET', path, opts);
export const post = (path: string, opts?: ReqOpts) => api('POST', path, opts);
export const patch = (path: string, opts?: ReqOpts) => api('PATCH', path, opts);
export const del = (path: string, opts?: ReqOpts) => api('DELETE', path, opts);

export async function json<T>(res: Response): Promise<T> {
  return res.json() as Promise<T>;
}

export async function login(email: string, password: string) {
  const res = await post('/auth/login', { body: { email, password } });
  const { access_token } = await json<{ access_token: string }>(res);
  return access_token;
}

/** Registers a user via the real /auth/register flow, then promotes their role directly in the DB
 *  (registration always defaults to LISTENER -- there's no signup-time role param). */
export async function registerAs(email: string, role: Role, password = 'password123') {
  await post('/auth/register', { body: { email, password } });
  if (role !== 'LISTENER') {
    await testDb.update(users).set({ role }).where(eq(users.email, email));
  }
  const [user] = await testDb.select().from(users).where(eq(users.email, email));
  return user!;
}

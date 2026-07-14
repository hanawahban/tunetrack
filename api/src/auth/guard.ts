import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { httpError } from '../common/http-error';
import { findSafeUserById } from './current-user';
import type { Role } from '../db/schema';

export const jwtPlugin = jwt({
  name: 'jwt',
  secret: process.env.JWT_SECRET!,
  exp: process.env.JWT_EXPIRES_IN,
});

async function resolveCurrentUser(
  verify: (token?: string) => Promise<Record<string, unknown> | false>,
  authorization?: string,
) {
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;
  if (!token) return null;

  const payload = await verify(token);
  if (!payload || (typeof payload.sub !== 'string' && typeof payload.sub !== 'number')) {
    return null;
  }
  return findSafeUserById(Number(payload.sub));
}

export const authGuard = new Elysia({ name: 'auth-guard' })
  .use(jwtPlugin)
  .macro({
    auth: {
      async resolve({ jwt, headers: { authorization } }) {
        const user = await resolveCurrentUser(jwt.verify, authorization);
        if (!user) return httpError(401, 'Unauthorized');
        return { user };
      },
    },
    roles(allowed: Role[]) {
      return {
        async resolve({ jwt, headers: { authorization } }) {
          const user = await resolveCurrentUser(jwt.verify, authorization);
          if (!user) return httpError(401, 'Unauthorized');
          if (!allowed.includes(user.role)) return httpError(403, 'Insufficient role');
          return { user };
        },
      };
    },
  });

import { Elysia, status, t } from 'elysia';
import { db } from '../db';
import { users } from '../db/schema';
import { httpError } from '../common/http-error';
import { pgErrorCode, PG_UNIQUE_VIOLATION } from '../common/pg-error';
import { jwtPlugin } from './guard';
import { SAFE_SELECT, userResponse, toUserResponse, findUserWithPasswordByEmail } from './current-user';

const authResponse = t.Object({
  access_token: t.String(),
});

export const authRoutes = new Elysia({ prefix: '/auth', tags: ['Auth'] })
  .use(jwtPlugin)
  .post(
    '/register',
    async ({ body }) => {
      const password = await Bun.password.hash(body.password, { algorithm: 'bcrypt', cost: 10 });
      try {
        const [user] = await db
          .insert(users)
          .values({ email: body.email, password })
          .returning(SAFE_SELECT);
        return status(201, toUserResponse(user!));
      } catch (err) {
        if (pgErrorCode(err) === PG_UNIQUE_VIOLATION) return httpError(409, 'Email already registered');
        throw err;
      }
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String({ minLength: 8 }),
      }),
      response: { 201: userResponse },
    },
  )
  .post(
    '/login',
    async ({ body, jwt }) => {
      const user = await findUserWithPasswordByEmail(body.email);
      const valid = user ? await Bun.password.verify(body.password, user.password) : false;
      if (!user || !valid) return httpError(401, 'Invalid credentials');

      const access_token = await jwt.sign({ sub: String(user.id), role: user.role });
      return status(201, { access_token });
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
      response: { 201: authResponse },
    },
  );

import { Elysia, status, t } from 'elysia';
import { httpError } from '../common/http-error';
import { notFoundResponse } from '../common/model';
import { pgErrorCode, PG_FOREIGN_KEY_VIOLATION } from '../common/pg-error';
import { authGuard } from '../auth/guard';
import { scrobblesService } from './service';
import { createScrobbleBody, scrobbleResponse } from './model';

export const scrobblesRoutes = new Elysia({ prefix: '/scrobbles', tags: ['Scrobbles'] })
  .use(authGuard)
  .post(
    '/',
    async ({ body, user }) => {
      try {
        return status(201, await scrobblesService.create(user.id, body.trackId));
      } catch (err) {
        if (pgErrorCode(err) === PG_FOREIGN_KEY_VIOLATION) {
          return httpError(404, `Track ${body.trackId} not found`);
        }
        throw err;
      }
    },
    {
      body: createScrobbleBody,
      response: { 201: scrobbleResponse, 404: notFoundResponse },
      auth: true,
    },
  )
  .get(
    '/recent',
    ({ user }) => scrobblesService.findRecent(user.id),
    { response: { 200: t.Array(scrobbleResponse) }, auth: true },
  );

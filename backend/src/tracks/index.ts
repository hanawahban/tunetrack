import { Elysia, status, t } from 'elysia';
import { httpError } from '../common/http-error';
import { notFoundResponse } from '../common/model';
import { pgErrorCode, PG_FOREIGN_KEY_VIOLATION } from '../common/pg-error';
import { authGuard } from '../auth/guard';
import { TracksService } from './service';
import { createTrackBody, trackIdParam, trackResponse, updateTrackBody } from './model';

export const tracksRoutes = new Elysia({ prefix: '/tracks', tags: ['Tracks'] })
  .use(authGuard)
  .post(
    '/',
    async ({ body }) => {
      try {
        return status(201, await TracksService.create(body));
      } catch (err) {
        if (pgErrorCode(err) === PG_FOREIGN_KEY_VIOLATION) {
          return httpError(404, `Album ${body.albumId} not found`);
        }
        throw err;
      }
    },
    {
      body: createTrackBody,
      response: { 201: trackResponse, 404: notFoundResponse },
      roles: ['ADMIN', 'CURATOR'],
    },
  )
  .get(
    '/',
    () => TracksService.findAll(),
    { response: { 200: t.Array(trackResponse) }, auth: true },
  )
  .get(
    '/:id',
    async ({ params }) => {
      const track = await TracksService.findById(params.id);
      if (!track) return httpError(404, `Track ${params.id} not found`);
      return status(200, track);
    },
    {
      params: trackIdParam,
      response: { 200: trackResponse, 404: notFoundResponse },
      auth: true,
    },
  )
  .patch(
    '/:id',
    async ({ params, body }) => {
      try {
        const updated = await TracksService.update(params.id, body);
        if (!updated) return httpError(404, `Track ${params.id} not found`);
        return status(200, updated);
      } catch (err) {
        if (pgErrorCode(err) === PG_FOREIGN_KEY_VIOLATION) {
          return httpError(404, `Album ${body.albumId} not found`);
        }
        throw err;
      }
    },
    {
      params: trackIdParam,
      body: updateTrackBody,
      response: { 200: trackResponse, 404: notFoundResponse },
      roles: ['ADMIN', 'CURATOR'],
    },
  )
  .delete(
    '/:id',
    async ({ params }) => {
      const deleted = await TracksService.remove(params.id);
      if (!deleted) return httpError(404, `Track ${params.id} not found`);
      return status(200, deleted);
    },
    {
      params: trackIdParam,
      response: { 200: trackResponse, 404: notFoundResponse },
      roles: ['ADMIN', 'CURATOR'],
    },
  );

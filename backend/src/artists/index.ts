import { Elysia, status, t } from 'elysia';
import { httpError } from '../common/http-error';
import { authGuard } from '../auth/guard';
import { artistsService } from './service';
import { artistBody, artistIdParam, artistResponse, notFoundResponse } from './model';

export const artistsRoutes = new Elysia({ prefix: '/artists', tags: ['Artists'] })
  .use(authGuard)
  .post(
    '/',
    async ({ body }) => status(201, await artistsService.create(body.name)),
    { body: artistBody, response: { 201: artistResponse }, roles: ['ADMIN', 'CURATOR'] },
  )
  .get(
    '/',
    () => artistsService.findAll(),
    { response: { 200: t.Array(artistResponse) }, auth: true },
  )
  .get(
    '/:id',
    async ({ params }) => {
      const artist = await artistsService.findById(params.id);
      if (!artist) return httpError(404, `Artist ${params.id} not found`);
      return status(200, artist);
    },
    {
      params: artistIdParam,
      response: { 200: artistResponse, 404: notFoundResponse },
      auth: true,
    },
  )
  .patch(
    '/:id',
    async ({ params, body }) => {
      const updated = await artistsService.update(params.id, body.name);
      if (!updated) return httpError(404, `Artist ${params.id} not found`);
      return status(200, updated);
    },
    {
      params: artistIdParam,
      body: t.Partial(artistBody),
      response: { 200: artistResponse, 404: notFoundResponse },
      roles: ['ADMIN', 'CURATOR'],
    },
  )
  .delete(
    '/:id',
    async ({ params }) => {
      const deleted = await artistsService.remove(params.id);
      if (!deleted) return httpError(404, `Artist ${params.id} not found`);
      return status(200, deleted);
    },
    {
      params: artistIdParam,
      response: { 200: artistResponse, 404: notFoundResponse },
      roles: ['ADMIN', 'CURATOR'],
    },
  );

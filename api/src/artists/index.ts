import { Elysia, status, t } from 'elysia';
import { httpError } from '../common/http-error';
import { authGuard } from '../auth/guard';
import { decodeCursor, paginationQuery } from '../common/pagination';
import { ArtistsService } from './service';
import { artistBody, artistIdParam, artistListResponse, artistResponse, notFoundResponse } from './model';

export const artistsRoutes = new Elysia({ prefix: '/artists', tags: ['Artists'] })
  .use(authGuard)
  .post(
    '/',
    async ({ body }) => status(201, await ArtistsService.create(body.name)),
    { body: artistBody, response: { 201: artistResponse }, roles: ['ADMIN', 'CURATOR'] },
  )
  .get(
    '/',
    ({ query }) => ArtistsService.findAll(decodeCursor(query.cursor), query.limit),
    { query: paginationQuery, response: { 200: artistListResponse }, auth: true },
  )
  .get(
    '/:id',
    async ({ params }) => {
      const artist = await ArtistsService.findById(params.id);
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
      const updated = await ArtistsService.update(params.id, body.name);
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
      const deleted = await ArtistsService.remove(params.id);
      if (!deleted) return httpError(404, `Artist ${params.id} not found`);
      return status(200, deleted);
    },
    {
      params: artistIdParam,
      response: { 200: artistResponse, 404: notFoundResponse },
      roles: ['ADMIN', 'CURATOR'],
    },
  );

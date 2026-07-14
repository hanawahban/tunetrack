import { Elysia, status } from 'elysia';
import { httpError } from '../common/http-error';
import { notFoundResponse } from '../common/model';
import { pgErrorCode, PG_FOREIGN_KEY_VIOLATION } from '../common/pg-error';
import { decodeCursor, paginationQuery } from '../common/pagination';
import { sharedModels } from '../common/models';
import { authGuard } from '../auth/guard';
import { AlbumsService } from './service';
import { albumIdParam, albumListResponse, createAlbumBody, updateAlbumBody } from './model';

export const albumsRoutes = new Elysia({ prefix: '/albums', tags: ['Albums'] })
  .use(sharedModels)
  .use(authGuard)
  .post(
    '/',
    async ({ body }) => {
      try {
        return status(201, await AlbumsService.create(body));
      } catch (err) {
        if (pgErrorCode(err) === PG_FOREIGN_KEY_VIOLATION) {
          return httpError(404, `Artist ${body.artistId} not found`);
        }
        throw err;
      }
    },
    {
      body: createAlbumBody,
      response: { 201: 'AlbumResponse', 404: notFoundResponse },
      roles: ['ADMIN', 'CURATOR'],
    },
  )
  .get(
    '/',
    ({ query }) => AlbumsService.findAll(decodeCursor(query.cursor), query.limit),
    { query: paginationQuery, response: { 200: albumListResponse }, auth: true },
  )
  .get(
    '/:id',
    async ({ params }) => {
      const album = await AlbumsService.findById(params.id);
      if (!album) return httpError(404, `Album ${params.id} not found`);
      return status(200, album);
    },
    {
      params: albumIdParam,
      response: { 200: 'AlbumResponse', 404: notFoundResponse },
      auth: true,
    },
  )
  .patch(
    '/:id',
    async ({ params, body }) => {
      try {
        const updated = await AlbumsService.update(params.id, body);
        if (!updated) return httpError(404, `Album ${params.id} not found`);
        return status(200, updated);
      } catch (err) {
        if (pgErrorCode(err) === PG_FOREIGN_KEY_VIOLATION) {
          return httpError(404, `Artist ${body.artistId} not found`);
        }
        throw err;
      }
    },
    {
      params: albumIdParam,
      body: updateAlbumBody,
      response: { 200: 'AlbumResponse', 404: notFoundResponse },
      roles: ['ADMIN', 'CURATOR'],
    },
  )
  .delete(
    '/:id',
    async ({ params }) => {
      const deleted = await AlbumsService.remove(params.id);
      if (!deleted) return httpError(404, `Album ${params.id} not found`);
      return status(200, deleted);
    },
    {
      params: albumIdParam,
      response: { 200: 'AlbumResponse', 404: notFoundResponse },
      roles: ['ADMIN', 'CURATOR'],
    },
  );

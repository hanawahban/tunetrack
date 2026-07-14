import { Elysia } from 'elysia';
import { albumResponse } from '../albums/model';
import { trackResponse } from '../tracks/model';
import { roleResponse } from '../auth/current-user';

/**
 * Registers shared response schemas as named Elysia models so @elysiajs/swagger emits them
 * as real components/schemas entries (instead of inlining a fresh copy at every usage site),
 * letting Orval generate proper named DTOs on the frontend.
 */
export const sharedModels = new Elysia({ name: 'shared-models' }).model({
  AlbumResponse: albumResponse,
  TrackResponse: trackResponse,
  Role: roleResponse,
});

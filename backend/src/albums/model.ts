import { t } from 'elysia';
import { paginatedResponse } from '../common/pagination';

export const artistSummary = t.Object({
  id: t.Number(),
  name: t.String(),
  createdAt: t.String({ format: 'date-time' }),
});

export const trackSummary = t.Object({
  id: t.Number(),
  title: t.String(),
  albumId: t.Number(),
  createdAt: t.String({ format: 'date-time' }),
});

export const albumResponse = t.Object({
  id: t.Number(),
  title: t.String(),
  releaseYear: t.Nullable(t.Number()),
  imageUrl: t.Nullable(t.String()),
  genre: t.Nullable(t.String()),
  artistId: t.Number(),
  createdAt: t.String({ format: 'date-time' }),
  artist: t.Optional(artistSummary),
  tracks: t.Optional(t.Array(trackSummary)),
});

export const createAlbumBody = t.Object({
  title: t.String(),
  releaseYear: t.Optional(t.Number()),
  imageUrl: t.Optional(t.String()),
  genre: t.Optional(t.String()),
  artistId: t.Number(),
});

export const updateAlbumBody = t.Partial(createAlbumBody);

export const albumIdParam = t.Object({
  id: t.Number(),
});

export const albumListResponse = paginatedResponse(albumResponse);

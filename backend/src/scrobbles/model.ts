import { t } from 'elysia';
import { paginatedResponse } from '../common/pagination';

export const artistSummary = t.Object({
  id: t.Number(),
  name: t.String(),
  createdAt: t.String({ format: 'date-time' }),
});

export const albumSummary = t.Object({
  id: t.Number(),
  title: t.String(),
  releaseYear: t.Nullable(t.Number()),
  imageUrl: t.Nullable(t.String()),
  artistId: t.Number(),
  createdAt: t.String({ format: 'date-time' }),
  artist: t.Optional(artistSummary),
});

export const trackSummary = t.Object({
  id: t.Number(),
  title: t.String(),
  albumId: t.Number(),
  createdAt: t.String({ format: 'date-time' }),
  album: t.Optional(albumSummary),
});

export const scrobbleResponse = t.Object({
  id: t.Number(),
  userId: t.Number(),
  trackId: t.Number(),
  playedAt: t.String({ format: 'date-time' }),
  track: t.Optional(trackSummary),
});

export const createScrobbleBody = t.Object({
  trackId: t.Number(),
});

export const scrobbleListResponse = paginatedResponse(scrobbleResponse);

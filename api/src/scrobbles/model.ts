import { t } from 'elysia';
import { paginatedResponse } from '../common/pagination';

export const trackSummary = t.Object({
  id: t.Number(),
  title: t.String(),
  albumId: t.Number(),
  createdAt: t.String({ format: 'date-time' }),
  album: t.Optional(t.Ref('AlbumSummary')),
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

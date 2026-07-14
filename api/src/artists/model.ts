import { t } from 'elysia';
import { paginatedResponse } from '../common/pagination';

export const artistsQuery = t.Object({
  cursor: t.Optional(t.String()),
  limit: t.Optional(t.Numeric({ minimum: 1 })),
  q: t.Optional(t.String()),
});

export const artistResponse = t.Object({
  id: t.Number(),
  name: t.String(),
  createdAt: t.String({ format: 'date-time' }),
  albums: t.Optional(t.Array(t.Ref('AlbumSummary'))),
});

export const artistBody = t.Object({
  name: t.String(),
});

export const artistIdParam = t.Object({
  id: t.Number(),
});

export const notFoundResponse = t.Object({
  statusCode: t.Number(),
  message: t.String(),
  error: t.String(),
});

export const artistListResponse = paginatedResponse(artistResponse);

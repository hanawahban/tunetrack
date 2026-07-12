import { t } from 'elysia';

export const albumSummary = t.Object({
  id: t.Number(),
  title: t.String(),
  releaseYear: t.Nullable(t.Number()),
  imageUrl: t.Nullable(t.String()),
  artistId: t.Number(),
  createdAt: t.String({ format: 'date-time' }),
});

export const artistResponse = t.Object({
  id: t.Number(),
  name: t.String(),
  createdAt: t.String({ format: 'date-time' }),
  albums: t.Optional(t.Array(albumSummary)),
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

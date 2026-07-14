import { t } from 'elysia';

export const albumSummary = t.Object({
  id: t.Number(),
  title: t.String(),
  releaseYear: t.Nullable(t.Number()),
  imageUrl: t.Nullable(t.String()),
  genre: t.Nullable(t.String()),
  artistId: t.Number(),
  createdAt: t.String({ format: 'date-time' }),
});

export const trackResponse = t.Object({
  id: t.Number(),
  title: t.String(),
  albumId: t.Number(),
  createdAt: t.String({ format: 'date-time' }),
  album: t.Optional(albumSummary),
});

export const createTrackBody = t.Object({
  title: t.String(),
  albumId: t.Number(),
});

export const updateTrackBody = t.Partial(createTrackBody);

export const trackIdParam = t.Object({
  id: t.Number(),
});

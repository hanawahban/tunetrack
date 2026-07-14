import { t } from 'elysia';
import { albumSummary } from '../albums/model';

export const trackResponse = t.Object({
  id: t.Number(),
  title: t.String(),
  albumId: t.Number(),
  createdAt: t.String({ format: 'date-time' }),
  // Not t.Ref('AlbumSummary') -- @elysiajs/swagger mis-serializes a nested ref to another
  // named model when the containing schema (trackResponse -> TrackResponse) is itself
  // registered as a named model, producing a malformed bare "$ref": "AlbumSummary" instead
  // of the full JSON pointer. Embedding the schema object directly sidesteps it; still one
  // source-of-truth definition of the shape, just inlined here instead of $ref'd. See #41.
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

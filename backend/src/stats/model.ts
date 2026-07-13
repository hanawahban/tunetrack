import { t } from 'elysia';

export const topArtistResponse = t.Object({
  artistId: t.Number(),
  name: t.String(),
  playCount: t.Number(),
});

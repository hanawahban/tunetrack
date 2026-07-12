import { Elysia, status, t } from 'elysia';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { artists } from '../db/schema';
import { httpError } from '../common/http-error';
import { authGuard } from '../auth/guard';

const albumSummary = t.Object({
  id: t.Number(),
  title: t.String(),
  releaseYear: t.Nullable(t.Number()),
  imageUrl: t.Nullable(t.String()),
  artistId: t.Number(),
  createdAt: t.String({ format: 'date-time' }),
});

const artistResponse = t.Object({
  id: t.Number(),
  name: t.String(),
  createdAt: t.String({ format: 'date-time' }),
  albums: t.Optional(t.Array(albumSummary)),
});

const artistBody = t.Object({
  name: t.String(),
});

const notFoundResponse = t.Object({
  statusCode: t.Number(),
  message: t.String(),
  error: t.String(),
});

type ArtistRow = { id: number; name: string; createdAt: Date };
type AlbumRow = {
  id: number;
  title: string;
  releaseYear: number | null;
  imageUrl: string | null;
  artistId: number;
  createdAt: Date;
};

function serializeArtist(artist: ArtistRow, albums?: AlbumRow[]) {
  const base = { id: artist.id, name: artist.name, createdAt: artist.createdAt.toISOString() };
  if (!albums) return base;
  return { ...base, albums: albums.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() })) };
}

export const artistsRoutes = new Elysia({ prefix: '/artists', tags: ['Artists'] })
  .use(authGuard)
  .post(
    '/',
    async ({ body }) => {
      const [artist] = await db.insert(artists).values({ name: body.name }).returning();
      return status(201, serializeArtist(artist!));
    },
    { body: artistBody, response: { 201: artistResponse }, roles: ['ADMIN', 'CURATOR'] },
  )
  .get(
    '/',
    async () => {
      const rows = await db.query.artists.findMany({ with: { albums: true } });
      return rows.map((row) => serializeArtist(row, row.albums));
    },
    { response: { 200: t.Array(artistResponse) }, auth: true },
  )
  .get(
    '/:id',
    async ({ params }) => {
      const artist = await db.query.artists.findFirst({
        where: eq(artists.id, params.id),
        with: { albums: true },
      });
      if (!artist) return httpError(404, `Artist ${params.id} not found`);
      return status(200, serializeArtist(artist, artist.albums));
    },
    {
      params: t.Object({ id: t.Number() }),
      response: { 200: artistResponse, 404: notFoundResponse },
      auth: true,
    },
  )
  .patch(
    '/:id',
    async ({ params, body }) => {
      const [updated] = await db
        .update(artists)
        .set({ name: body.name })
        .where(eq(artists.id, params.id))
        .returning();
      if (!updated) return httpError(404, `Artist ${params.id} not found`);
      return status(200, serializeArtist(updated));
    },
    {
      params: t.Object({ id: t.Number() }),
      body: t.Partial(artistBody),
      response: { 200: artistResponse, 404: notFoundResponse },
      roles: ['ADMIN', 'CURATOR'],
    },
  )
  .delete(
    '/:id',
    async ({ params }) => {
      const [deleted] = await db.delete(artists).where(eq(artists.id, params.id)).returning();
      if (!deleted) return httpError(404, `Artist ${params.id} not found`);
      return status(200, serializeArtist(deleted));
    },
    {
      params: t.Object({ id: t.Number() }),
      response: { 200: artistResponse, 404: notFoundResponse },
      roles: ['ADMIN', 'CURATOR'],
    },
  );

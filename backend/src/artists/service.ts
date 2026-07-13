import { and, desc, eq, lt, or } from 'drizzle-orm';
import { db } from '../db';
import { artists } from '../db/schema';
import { DEFAULT_PAGE_SIZE, encodeCursor, type Cursor } from '../common/pagination';

type ArtistRow = { id: number; name: string; createdAt: Date };
type AlbumRow = {
  id: number;
  title: string;
  releaseYear: number | null;
  imageUrl: string | null;
  artistId: number;
  createdAt: Date;
};

class ArtistsService {
  async create(name: string) {
    const [artist] = await db.insert(artists).values({ name }).returning();
    return this.serialize(artist!);
  }

  async findAll(cursor?: Cursor, limit = DEFAULT_PAGE_SIZE) {
    const cursorWhere = cursor
      ? or(lt(artists.createdAt, cursor.sortValue), and(eq(artists.createdAt, cursor.sortValue), lt(artists.id, cursor.id)))
      : undefined;

    const rows = await db.query.artists.findMany({
      where: cursorWhere,
      orderBy: [desc(artists.createdAt), desc(artists.id)],
      limit: limit + 1,
      with: { albums: true },
    });

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    const last = page.at(-1);
    const nextCursor = hasMore && last ? encodeCursor(last.createdAt, last.id) : null;

    return { items: page.map((row) => this.serialize(row, row.albums)), nextCursor };
  }

  async findById(id: number) {
    const artist = await db.query.artists.findFirst({
      where: eq(artists.id, id),
      with: { albums: true },
    });
    if (!artist) return undefined;
    return this.serialize(artist, artist.albums);
  }

  async update(id: number, name: string | undefined) {
    const [updated] = await db.update(artists).set({ name }).where(eq(artists.id, id)).returning();
    if (!updated) return undefined;
    return this.serialize(updated);
  }

  async remove(id: number) {
    const [deleted] = await db.delete(artists).where(eq(artists.id, id)).returning();
    if (!deleted) return undefined;
    return this.serialize(deleted);
  }

  private serialize(artist: ArtistRow, albums?: AlbumRow[]) {
    const base = { id: artist.id, name: artist.name, createdAt: artist.createdAt.toISOString() };
    if (!albums) return base;
    return {
      ...base,
      albums: albums.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() })),
    };
  }
}

export const artistsService = new ArtistsService();

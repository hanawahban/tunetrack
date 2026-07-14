import { and, desc, eq, ilike, lt, or } from 'drizzle-orm';
import { db } from '../db';
import { artists, type Artist, type Album } from '../db/schema';
import { encodeCursor, resolveLimit, type Cursor } from '../common/pagination';

export abstract class ArtistsService {
  static async create(name: string) {
    const [artist] = await db.insert(artists).values({ name }).returning();
    return ArtistsService.serialize(artist!);
  }

  static async findAll(cursor?: Cursor, limit?: number, q?: string) {
    const pageSize = resolveLimit(limit);
    const cursorWhere = cursor
      ? or(lt(artists.createdAt, cursor.sortValue), and(eq(artists.createdAt, cursor.sortValue), lt(artists.id, cursor.id)))
      : undefined;
    const searchWhere = q?.trim() ? ilike(artists.name, `%${q.trim()}%`) : undefined;
    const where = cursorWhere && searchWhere ? and(cursorWhere, searchWhere) : (cursorWhere ?? searchWhere);

    const rows = await db.query.artists.findMany({
      where,
      orderBy: [desc(artists.createdAt), desc(artists.id)],
      limit: pageSize + 1,
      with: { albums: true },
    });

    const hasMore = rows.length > pageSize;
    const page = hasMore ? rows.slice(0, pageSize) : rows;
    const last = page.at(-1);
    const nextCursor = hasMore && last ? encodeCursor(last.createdAt, last.id) : null;

    return { items: page.map((row) => ArtistsService.serialize(row, row.albums)), nextCursor };
  }

  static async findById(id: number) {
    const artist = await db.query.artists.findFirst({
      where: eq(artists.id, id),
      with: { albums: true },
    });
    if (!artist) return undefined;
    return ArtistsService.serialize(artist, artist.albums);
  }

  static async update(id: number, name: string | undefined) {
    const [updated] = await db.update(artists).set({ name }).where(eq(artists.id, id)).returning();
    if (!updated) return undefined;
    return ArtistsService.serialize(updated);
  }

  static async remove(id: number) {
    const [deleted] = await db.delete(artists).where(eq(artists.id, id)).returning();
    if (!deleted) return undefined;
    return ArtistsService.serialize(deleted);
  }

  private static serialize(artist: Artist, albums?: Album[]) {
    const base = { id: artist.id, name: artist.name, createdAt: artist.createdAt.toISOString() };
    if (!albums) return base;
    return {
      ...base,
      albums: albums.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() })),
    };
  }
}

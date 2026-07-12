import { eq } from 'drizzle-orm';
import { db } from '../db';
import { artists } from '../db/schema';

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

  async findAll() {
    const rows = await db.query.artists.findMany({ with: { albums: true } });
    return rows.map((row) => this.serialize(row, row.albums));
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

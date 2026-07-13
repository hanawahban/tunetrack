import { eq } from 'drizzle-orm';
import { db } from '../db';
import { albums } from '../db/schema';

type AlbumRow = {
  id: number;
  title: string;
  releaseYear: number | null;
  imageUrl: string | null;
  artistId: number;
  createdAt: Date;
};
type ArtistRow = { id: number; name: string; createdAt: Date };
type TrackRow = { id: number; title: string; albumId: number; createdAt: Date };

type AlbumInput = {
  title: string;
  releaseYear?: number;
  imageUrl?: string;
  artistId: number;
};

class AlbumsService {
  async create(dto: AlbumInput) {
    const [album] = await db.insert(albums).values(dto).returning();
    return this.serialize(album!);
  }

  async findAll() {
    const rows = await db.query.albums.findMany({ with: { artist: true, tracks: true } });
    return rows.map((row) => this.serialize(row, row.artist, row.tracks));
  }

  async findById(id: number) {
    const album = await db.query.albums.findFirst({
      where: eq(albums.id, id),
      with: { artist: true, tracks: true },
    });
    if (!album) return undefined;
    return this.serialize(album, album.artist, album.tracks);
  }

  async update(id: number, dto: Partial<AlbumInput>) {
    const [updated] = await db.update(albums).set(dto).where(eq(albums.id, id)).returning();
    if (!updated) return undefined;
    return this.serialize(updated);
  }

  async remove(id: number) {
    const [deleted] = await db.delete(albums).where(eq(albums.id, id)).returning();
    if (!deleted) return undefined;
    return this.serialize(deleted);
  }

  private serialize(album: AlbumRow, artist?: ArtistRow, tracks?: TrackRow[]) {
    const base = {
      id: album.id,
      title: album.title,
      releaseYear: album.releaseYear,
      imageUrl: album.imageUrl,
      artistId: album.artistId,
      createdAt: album.createdAt.toISOString(),
    };
    return {
      ...base,
      ...(artist ? { artist: { ...artist, createdAt: artist.createdAt.toISOString() } } : {}),
      ...(tracks
        ? { tracks: tracks.map((t) => ({ ...t, createdAt: t.createdAt.toISOString() })) }
        : {}),
    };
  }
}

export const albumsService = new AlbumsService();

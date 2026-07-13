import { eq } from 'drizzle-orm';
import { db } from '../db';
import { albums, type Album, type Artist, type Track } from '../db/schema';

type AlbumInput = {
  title: string;
  releaseYear?: number;
  imageUrl?: string;
  artistId: number;
};

export abstract class AlbumsService {
  static async create(dto: AlbumInput) {
    const [album] = await db.insert(albums).values(dto).returning();
    return AlbumsService.serialize(album!);
  }

  static async findAll() {
    const rows = await db.query.albums.findMany({ with: { artist: true, tracks: true } });
    return rows.map((row) => AlbumsService.serialize(row, row.artist, row.tracks));
  }

  static async findById(id: number) {
    const album = await db.query.albums.findFirst({
      where: eq(albums.id, id),
      with: { artist: true, tracks: true },
    });
    if (!album) return undefined;
    return AlbumsService.serialize(album, album.artist, album.tracks);
  }

  static async update(id: number, dto: Partial<AlbumInput>) {
    const [updated] = await db.update(albums).set(dto).where(eq(albums.id, id)).returning();
    if (!updated) return undefined;
    return AlbumsService.serialize(updated);
  }

  static async remove(id: number) {
    const [deleted] = await db.delete(albums).where(eq(albums.id, id)).returning();
    if (!deleted) return undefined;
    return AlbumsService.serialize(deleted);
  }

  private static serialize(album: Album, artist?: Artist, tracks?: Track[]) {
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

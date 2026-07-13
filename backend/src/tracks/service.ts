import { eq } from 'drizzle-orm';
import { db } from '../db';
import { tracks } from '../db/schema';

type TrackRow = { id: number; title: string; albumId: number; createdAt: Date };
type AlbumRow = {
  id: number;
  title: string;
  releaseYear: number | null;
  imageUrl: string | null;
  artistId: number;
  createdAt: Date;
};

type TrackInput = { title: string; albumId: number };

class TracksService {
  async create(dto: TrackInput) {
    const [track] = await db.insert(tracks).values(dto).returning();
    return this.serialize(track!);
  }

  async findAll() {
    const rows = await db.query.tracks.findMany({ with: { album: true } });
    return rows.map((row) => this.serialize(row, row.album));
  }

  async findById(id: number) {
    const track = await db.query.tracks.findFirst({ where: eq(tracks.id, id), with: { album: true } });
    if (!track) return undefined;
    return this.serialize(track, track.album);
  }

  async update(id: number, dto: Partial<TrackInput>) {
    const [updated] = await db.update(tracks).set(dto).where(eq(tracks.id, id)).returning();
    if (!updated) return undefined;
    return this.serialize(updated);
  }

  async remove(id: number) {
    const [deleted] = await db.delete(tracks).where(eq(tracks.id, id)).returning();
    if (!deleted) return undefined;
    return this.serialize(deleted);
  }

  private serialize(track: TrackRow, album?: AlbumRow) {
    const base = {
      id: track.id,
      title: track.title,
      albumId: track.albumId,
      createdAt: track.createdAt.toISOString(),
    };
    return {
      ...base,
      ...(album ? { album: { ...album, createdAt: album.createdAt.toISOString() } } : {}),
    };
  }
}

export const tracksService = new TracksService();

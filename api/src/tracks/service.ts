import { eq } from 'drizzle-orm';
import { db } from '../db';
import { tracks, type Album, type Track } from '../db/schema';

type TrackInput = { title: string; albumId: number };

export abstract class TracksService {
  static async create(dto: TrackInput) {
    const [track] = await db.insert(tracks).values(dto).returning();
    return TracksService.serialize(track!);
  }

  static async findAll() {
    const rows = await db.query.tracks.findMany({ with: { album: true } });
    return rows.map((row) => TracksService.serialize(row, row.album));
  }

  static async findById(id: number) {
    const track = await db.query.tracks.findFirst({
      where: eq(tracks.id, id),
      with: { album: true },
    });
    if (!track) return undefined;
    return TracksService.serialize(track, track.album);
  }

  static async update(id: number, dto: Partial<TrackInput>) {
    const [updated] = await db.update(tracks).set(dto).where(eq(tracks.id, id)).returning();
    if (!updated) return undefined;
    return TracksService.serialize(updated);
  }

  static async remove(id: number) {
    const [deleted] = await db.delete(tracks).where(eq(tracks.id, id)).returning();
    if (!deleted) return undefined;
    return TracksService.serialize(deleted);
  }

  private static serialize(track: Track, album?: Album) {
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

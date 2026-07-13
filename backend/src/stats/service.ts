import { count, eq, inArray } from 'drizzle-orm';
import { db } from '../db';
import { scrobbles, tracks } from '../db/schema';

export abstract class StatsService {
  static async topArtists(userId: number, limit = 10) {
    const counts = await db
      .select({ trackId: scrobbles.trackId, playCount: count() })
      .from(scrobbles)
      .where(eq(scrobbles.userId, userId))
      .groupBy(scrobbles.trackId);

    if (counts.length === 0) return [];

    const trackRows = await db.query.tracks.findMany({
      where: inArray(
        tracks.id,
        counts.map((c) => c.trackId),
      ),
      with: { album: { with: { artist: true } } },
    });
    const trackToArtist = new Map(trackRows.map((t) => [t.id, t.album.artist]));

    const byArtist = new Map<number, { name: string; playCount: number }>();
    for (const { trackId, playCount } of counts) {
      const artist = trackToArtist.get(trackId);
      if (!artist) continue;
      const entry = byArtist.get(artist.id) ?? { name: artist.name, playCount: 0 };
      entry.playCount += playCount;
      byArtist.set(artist.id, entry);
    }

    return [...byArtist.entries()]
      .map(([artistId, entry]) => ({ artistId, ...entry }))
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, limit);
  }
}

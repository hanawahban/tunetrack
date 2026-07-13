import { desc, eq } from 'drizzle-orm';
import { db } from '../db';
import { scrobbles, type Album, type Artist, type Scrobble, type Track } from '../db/schema';

type TrackWithNesting = Track & { album?: Album & { artist?: Artist } };

export abstract class ScrobblesService {
  static async create(userId: number, trackId: number) {
    const [scrobble] = await db.insert(scrobbles).values({ userId, trackId }).returning();
    return ScrobblesService.serialize(scrobble!);
  }

  static async findRecent(userId: number, take = 20) {
    const rows = await db.query.scrobbles.findMany({
      where: eq(scrobbles.userId, userId),
      orderBy: [desc(scrobbles.playedAt)],
      limit: take,
      with: { track: { with: { album: { with: { artist: true } } } } },
    });
    return rows.map((row) => ScrobblesService.serialize(row, row.track));
  }

  private static serialize(scrobble: Scrobble, track?: TrackWithNesting) {
    const base = {
      id: scrobble.id,
      userId: scrobble.userId,
      trackId: scrobble.trackId,
      playedAt: scrobble.playedAt.toISOString(),
    };
    if (!track) return base;
    return { ...base, track: ScrobblesService.serializeTrack(track) };
  }

  private static serializeTrack(track: TrackWithNesting) {
    const base = {
      id: track.id,
      title: track.title,
      albumId: track.albumId,
      createdAt: track.createdAt.toISOString(),
    };
    if (!track.album) return base;
    return { ...base, album: ScrobblesService.serializeAlbum(track.album) };
  }

  private static serializeAlbum(album: Album & { artist?: Artist }) {
    const base = {
      id: album.id,
      title: album.title,
      releaseYear: album.releaseYear,
      imageUrl: album.imageUrl,
      artistId: album.artistId,
      createdAt: album.createdAt.toISOString(),
    };
    if (!album.artist) return base;
    return {
      ...base,
      artist: { ...album.artist, createdAt: album.artist.createdAt.toISOString() },
    };
  }
}

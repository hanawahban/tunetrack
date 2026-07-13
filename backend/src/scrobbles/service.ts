import { and, desc, eq, lt, or } from 'drizzle-orm';
import { db } from '../db';
import { scrobbles, type Album, type Artist, type Scrobble, type Track } from '../db/schema';
import { encodeCursor, resolveLimit, type Cursor } from '../common/pagination';

type TrackWithNesting = Track & { album?: Album & { artist?: Artist } };

export abstract class ScrobblesService {
  static async create(userId: number, trackId: number) {
    const [scrobble] = await db.insert(scrobbles).values({ userId, trackId }).returning();
    return ScrobblesService.serialize(scrobble!);
  }

  static async findRecent(userId: number, cursor?: Cursor, limit?: number) {
    const pageSize = resolveLimit(limit);
    const cursorWhere = cursor
      ? or(
          lt(scrobbles.playedAt, cursor.sortValue),
          and(eq(scrobbles.playedAt, cursor.sortValue), lt(scrobbles.id, cursor.id)),
        )
      : undefined;
    const where = cursorWhere ? and(eq(scrobbles.userId, userId), cursorWhere) : eq(scrobbles.userId, userId);

    const rows = await db.query.scrobbles.findMany({
      where,
      orderBy: [desc(scrobbles.playedAt), desc(scrobbles.id)],
      limit: pageSize + 1,
      with: { track: { with: { album: { with: { artist: true } } } } },
    });

    const hasMore = rows.length > pageSize;
    const page = hasMore ? rows.slice(0, pageSize) : rows;
    const last = page.at(-1);
    const nextCursor = hasMore && last ? encodeCursor(last.playedAt, last.id) : null;

    return { items: page.map((row) => ScrobblesService.serialize(row, row.track)), nextCursor };
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

import { desc, eq } from 'drizzle-orm';
import { db } from '../db';
import { scrobbles } from '../db/schema';

type ScrobbleRow = { id: number; userId: number; trackId: number; playedAt: Date };
type TrackRow = { id: number; title: string; albumId: number; createdAt: Date };
type AlbumRow = {
  id: number;
  title: string;
  releaseYear: number | null;
  imageUrl: string | null;
  artistId: number;
  createdAt: Date;
};
type ArtistRow = { id: number; name: string; createdAt: Date };

type TrackWithNesting = TrackRow & { album?: AlbumRow & { artist?: ArtistRow } };

class ScrobblesService {
  async create(userId: number, trackId: number) {
    const [scrobble] = await db.insert(scrobbles).values({ userId, trackId }).returning();
    return this.serialize(scrobble!);
  }

  async findRecent(userId: number, take = 20) {
    const rows = await db.query.scrobbles.findMany({
      where: eq(scrobbles.userId, userId),
      orderBy: [desc(scrobbles.playedAt)],
      limit: take,
      with: { track: { with: { album: { with: { artist: true } } } } },
    });
    return rows.map((row) => this.serialize(row, row.track));
  }

  private serialize(scrobble: ScrobbleRow, track?: TrackWithNesting) {
    const base = {
      id: scrobble.id,
      userId: scrobble.userId,
      trackId: scrobble.trackId,
      playedAt: scrobble.playedAt.toISOString(),
    };
    if (!track) return base;
    return { ...base, track: this.serializeTrack(track) };
  }

  private serializeTrack(track: TrackWithNesting) {
    const base = {
      id: track.id,
      title: track.title,
      albumId: track.albumId,
      createdAt: track.createdAt.toISOString(),
    };
    if (!track.album) return base;
    return { ...base, album: this.serializeAlbum(track.album) };
  }

  private serializeAlbum(album: AlbumRow & { artist?: ArtistRow }) {
    const base = {
      id: album.id,
      title: album.title,
      releaseYear: album.releaseYear,
      imageUrl: album.imageUrl,
      artistId: album.artistId,
      createdAt: album.createdAt.toISOString(),
    };
    if (!album.artist) return base;
    return { ...base, artist: { ...album.artist, createdAt: album.artist.createdAt.toISOString() } };
  }
}

export const scrobblesService = new ScrobblesService();

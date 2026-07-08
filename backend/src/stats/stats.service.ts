import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async topArtists(userId: number, limit = 10) {
    const counts = await this.prisma.scrobble.groupBy({
      by: ['trackId'],
      where: { userId },
      _count: { trackId: true },
    });
    if (counts.length === 0) {
      return [];
    }

    const tracks = await this.prisma.track.findMany({
      where: { id: { in: counts.map((c) => c.trackId) } },
      include: { album: { include: { artist: true } } },
    });
    const trackToArtist = new Map(
      tracks.map((t) => [t.id, t.album.artist]),
    );

    const byArtist = new Map<number, { name: string; playCount: number }>();
    for (const { trackId, _count } of counts) {
      const artist = trackToArtist.get(trackId);
      if (!artist) continue;
      const entry = byArtist.get(artist.id) ?? { name: artist.name, playCount: 0 };
      entry.playCount += _count.trackId;
      byArtist.set(artist.id, entry);
    }

    return [...byArtist.entries()]
      .map(([artistId, entry]) => ({ artistId, ...entry }))
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, limit);
  }
}
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScrobblesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, trackId: number) {
    const track = await this.prisma.track.findUnique({ where: { id: trackId } });
    if (!track) throw new NotFoundException(`Track ${trackId} not found`);
    return this.prisma.scrobble.create({ data: { userId, trackId } });
  }

  findRecent(userId: number, take = 20) {
    return this.prisma.scrobble.findMany({
      where: { userId },
      orderBy: { playedAt: 'desc' },
      take,
      include: { track: { include: { album: { include: { artist: true } } } } },
    });
  }
}

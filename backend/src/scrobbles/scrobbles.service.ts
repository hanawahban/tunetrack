import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScrobblesService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: number, trackId: number) {
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

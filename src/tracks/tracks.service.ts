import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';

@Injectable()
export class TracksService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateTrackDto) {
    return this.prisma.track.create({
      data: { title: dto.title, albumId: dto.albumId },
    });
  }

  findAll() {
    return this.prisma.track.findMany({ include: { album: true } });
  }

  async findOne(id: number) {
    const track = await this.prisma.track.findUnique({
      where: { id },
      include: { album: true },
    });
    if (!track) {
      throw new NotFoundException(`Track ${id} not found`);
    }
    return track;
  }

  async update(id: number, dto: UpdateTrackDto) {
    await this.findOne(id);
    return this.prisma.track.update({
      where: { id },
      data: { title: dto.title, albumId: dto.albumId },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.track.delete({ where: { id } });
  }
}

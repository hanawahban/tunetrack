import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';

@Injectable()
export class ArtistsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateArtistDto) {
    return this.prisma.artist.create({ data: { name: dto.name } });
  }

  findAll() {
    return this.prisma.artist.findMany({ include: { albums: true } });
  }

  async findOne(id: number) {
    const artist = await this.prisma.artist.findUnique({
      where: { id },
      include: { albums: true },
    });
    if (!artist) {
      throw new NotFoundException(`Artist ${id} not found`);
    }
    return artist;
  }

  async update(id: number, dto: UpdateArtistDto) {
    await this.findOne(id);
    return this.prisma.artist.update({
      where: { id },
      data: { name: dto.name },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.artist.delete({ where: { id } });
  }
}

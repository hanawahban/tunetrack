import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';

@Injectable()
export class AlbumsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateAlbumDto) {
    return this.prisma.album.create({
      data: {
        title: dto.title,
        releaseYear: dto.releaseYear,
        imageUrl: dto.imageUrl,
        artistId: dto.artistId,
      },
    });
  }

  findAll() {
    return this.prisma.album.findMany({ include: { artist: true, tracks: true } });
  }

  async findOne(id: number) {
    const album = await this.prisma.album.findUnique({
      where: { id },
      include: { artist: true, tracks: true },
    });
    if (!album) throw new NotFoundException(`Album ${id} not found`);
    return album;
  }

  update(id: number, dto: UpdateAlbumDto) {
    return this.prisma.album.update({
      where: { id },
      data: {
        title: dto.title,
        releaseYear: dto.releaseYear,
        imageUrl: dto.imageUrl,
        artistId: dto.artistId,
      },
    });
  }

  remove(id: number) {
    return this.prisma.album.delete({ where: { id } });
  }
}
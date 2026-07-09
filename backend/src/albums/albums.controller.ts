import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AlbumsService } from './albums.service';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../generated/prisma/enums';

@Controller('albums')
@UseGuards(JwtAuthGuard)
export class AlbumsController {
  constructor(private albumsService: AlbumsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.CURATOR)
  create(@Body() dto: CreateAlbumDto) {
    return this.albumsService.create(dto);
  }

  @Get()
  findAll() {
    return this.albumsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.albumsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.CURATOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAlbumDto,
  ) {
    return this.albumsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.CURATOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.albumsService.remove(id);
  }
}

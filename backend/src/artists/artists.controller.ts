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
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { ArtistsService } from './artists.service';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { ArtistResponseDto } from './dto/artist-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../generated/prisma/enums';

@Controller('artists')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ArtistsController {
  constructor(private artistsService: ArtistsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.CURATOR)
  @ApiCreatedResponse({ type: ArtistResponseDto })
  create(@Body() dto: CreateArtistDto) {
    return this.artistsService.create(dto);
  }

  @Get()
  @ApiOkResponse({ type: ArtistResponseDto, isArray: true })
  findAll() {
    return this.artistsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: ArtistResponseDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.artistsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.CURATOR)
  @ApiOkResponse({ type: ArtistResponseDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateArtistDto) {
    return this.artistsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.CURATOR)
  @ApiOkResponse({ type: ArtistResponseDto })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.artistsService.remove(id);
  }
}

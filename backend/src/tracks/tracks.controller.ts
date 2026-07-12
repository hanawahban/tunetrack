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
import { TracksService } from './tracks.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { TrackResponseDto } from './dto/track-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../generated/prisma/enums';

@Controller('tracks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TracksController {
  constructor(private tracksService: TracksService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.CURATOR)
  @ApiCreatedResponse({ type: TrackResponseDto })
  create(@Body() dto: CreateTrackDto) {
    return this.tracksService.create(dto);
  }

  @Get()
  @ApiOkResponse({ type: TrackResponseDto, isArray: true })
  findAll() {
    return this.tracksService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: TrackResponseDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tracksService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.CURATOR)
  @ApiOkResponse({ type: TrackResponseDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTrackDto) {
    return this.tracksService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.CURATOR)
  @ApiOkResponse({ type: TrackResponseDto })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tracksService.remove(id);
  }
}

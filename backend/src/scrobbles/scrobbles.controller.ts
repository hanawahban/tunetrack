import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { ScrobblesService } from './scrobbles.service';
import { CreateScrobbleDto } from './dto/create-scrobble.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ScrobbleResponseDto } from './dto/scrobble-response.dto';

@Controller('scrobbles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ScrobblesController {
  constructor(private scrobblesService: ScrobblesService) {}

  @Post()
  @ApiCreatedResponse({ type: ScrobbleResponseDto })
  create(@CurrentUser() user: { id: number }, @Body() dto: CreateScrobbleDto) {
    return this.scrobblesService.create(user.id, dto.trackId);
  }

  @Get('recent')
  @ApiOkResponse({ type: ScrobbleResponseDto, isArray: true })
  findRecent(@CurrentUser() user: { id: number }) {
    return this.scrobblesService.findRecent(user.id);
  }
}

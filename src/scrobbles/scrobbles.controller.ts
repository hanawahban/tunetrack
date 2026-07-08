import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ScrobblesService } from './scrobbles.service';
import { CreateScrobbleDto } from './dto/create-scrobble.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('scrobbles')
@UseGuards(JwtAuthGuard)
export class ScrobblesController {
  constructor(private scrobblesService: ScrobblesService) {}

  @Post()
  create(@CurrentUser() user: { id: number }, @Body() dto: CreateScrobbleDto) {
    return this.scrobblesService.create(user.id, dto.trackId);
  }

  @Get('recent')
  findRecent(@CurrentUser() user: { id: number }) {
    return this.scrobblesService.findRecent(user.id);
  }
}

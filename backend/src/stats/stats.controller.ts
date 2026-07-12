import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TopArtistDto } from './dto/top-artist.dto';

@Controller('stats')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StatsController {
  constructor(private statsService: StatsService) {}

  @Get('top-artists')
  @ApiOkResponse({ type: TopArtistDto, isArray: true })
  topArtists(@CurrentUser() user: { id: number }) {
    return this.statsService.topArtists(user.id);
  }
}
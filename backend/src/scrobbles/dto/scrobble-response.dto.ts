import { ApiProperty } from '@nestjs/swagger';
import { TrackResponseDto } from '../../tracks/dto/track-response.dto';

export class ScrobbleResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  trackId: number;

  @ApiProperty()
  playedAt: Date;

  @ApiProperty({ type: () => TrackResponseDto, required: false })
  track?: TrackResponseDto;
}

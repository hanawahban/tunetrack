import { ApiProperty } from '@nestjs/swagger';
import { ArtistResponseDto } from '../../artists/dto/artist-response.dto';
import { TrackResponseDto } from '../../tracks/dto/track-response.dto';

export class AlbumResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false, nullable: true })
  releaseYear?: number | null;

  @ApiProperty({ required: false, nullable: true })
  imageUrl?: string | null;

  @ApiProperty()
  artistId: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: () => ArtistResponseDto, required: false })
  artist?: ArtistResponseDto;

  @ApiProperty({ type: () => TrackResponseDto, isArray: true, required: false })
  tracks?: TrackResponseDto[];
}

import { ApiProperty } from '@nestjs/swagger';
import { AlbumResponseDto } from '../../albums/dto/album-response.dto';

export class TrackResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  albumId: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: () => AlbumResponseDto, required: false })
  album?: AlbumResponseDto;
}

import { ApiProperty } from '@nestjs/swagger';
import { AlbumResponseDto } from '../../albums/dto/album-response.dto';

export class ArtistResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: () => AlbumResponseDto, isArray: true, required: false })
  albums?: AlbumResponseDto[];
}

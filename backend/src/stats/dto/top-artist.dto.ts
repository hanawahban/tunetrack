import { ApiProperty } from '@nestjs/swagger';

export class TopArtistDto {
  @ApiProperty()
  artistId: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  playCount: number;
}

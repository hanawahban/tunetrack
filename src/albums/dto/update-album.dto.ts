import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateAlbumDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsInt()
  releaseYear?: number;

  @IsOptional()
  @IsInt()
  artistId?: number;
}

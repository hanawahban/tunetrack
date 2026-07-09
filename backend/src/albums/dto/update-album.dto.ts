import { IsInt, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateAlbumDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsInt()
  releaseYear?: number;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsInt()
  artistId?: number;
}

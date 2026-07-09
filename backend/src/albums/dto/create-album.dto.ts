import { IsInt, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateAlbumDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsInt()
  releaseYear?: number;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsInt()
  artistId: number;
}

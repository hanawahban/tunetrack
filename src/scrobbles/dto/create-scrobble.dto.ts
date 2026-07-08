import { IsInt } from 'class-validator';

export class CreateScrobbleDto {
  @IsInt()
  trackId!: number;
}

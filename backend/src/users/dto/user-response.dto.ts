import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../generated/prisma/enums';

export class UserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: Role })
  role: Role;

  @ApiProperty()
  createdAt: Date;
}

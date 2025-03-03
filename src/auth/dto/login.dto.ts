//src\auth\dto\login.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class LoginAuthDto {
  @ApiProperty()
  email: string;
  @ApiProperty()
  password: string;
}

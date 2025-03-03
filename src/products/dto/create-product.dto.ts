//src\products\dto\create-product.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(15)
  @ApiProperty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(100)
  @ApiProperty()
  description: string;
}

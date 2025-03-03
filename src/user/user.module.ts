//src\user\user.module.ts

import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  imports: [],
  providers: [PrismaService, UserService],
})
export class UserModule {}

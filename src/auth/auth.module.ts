// src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtService } from '@nestjs/jwt';
import { CognitoModule } from 'src/cognito/cognito.module';
import { CognitoService } from 'src/cognito/cognito.service';

@Module({
  imports: [CognitoModule],
  controllers: [AuthController],
  providers: [AuthService, CognitoService, JwtService],
})
export class AuthModule {}
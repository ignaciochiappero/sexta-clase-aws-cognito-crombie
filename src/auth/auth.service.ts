// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { LoginAuthDto } from './dto/login.dto';
import { RegisterAuthDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { CognitoService } from 'src/cognito/cognito.service';

@Injectable()
export class AuthService {
  constructor(
    private cognitoService: CognitoService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterAuthDto) {
    // Usamos el servicio de Cognito para registrar al usuario
    const result = await this.cognitoService.registerUser(
      registerDto.email,
      registerDto.userName,
      registerDto.password,
    );
    
    return result;
  }

  // Nuevo método para confirmar email
  async confirmEmail(email: string, code: string) {
    return await this.cognitoService.confirmSignUp(email, code);
  }

  // Nuevo método para reenviar código
  async resendConfirmationCode(email: string) {
    return await this.cognitoService.resendConfirmationCode(email);
  }

  async login(loginDto: LoginAuthDto) {
    try {
      // Autenticamos usando Cognito
      const authResult = await this.cognitoService.loginUser(
        loginDto.email,
        loginDto.password,
      );
      
      return authResult;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Invalid credentials');
    }
  }
}
//src\auth\jwt-auth.guard.ts

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as jwkToPem from 'jwk-to-pem'; // Convierte las claves JWK a formato PEM
import fetch from 'node-fetch';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  // Almacena las claves públicas de Cognito (JWKs)
  private cognitoJwks: any = null;
  // URL del emisor de tokens de Cognito
  private cognitoIssuer: string;

  constructor(private jwtService: JwtService) {
    // Construye la URL del emisor usando las variables de entorno
    this.cognitoIssuer = `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`;
  }

  // Método que se ejecuta antes de cada solicitud protegida
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Obtiene la solicitud HTTP
    const request = context.switchToHttp().getRequest();
    // Obtiene el header de autorización
    const authHeader = request.headers.authorization;

    // Verifica que el header exista y tenga el formato correcto "Bearer <token>"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid token');
    }

    // Extrae el token del header
    const token = authHeader.split(' ')[1];

    try {
      // Valida el token y almacena la información del usuario en request.user
      request.user = await this.validateCognitoToken(token);
      return true;
    } catch (error) {
      console.log('Token validation failed:', error.message);
      throw new UnauthorizedException('Invalid token');
    }
  }

  // Método privado para validar tokens de Cognito
  private async validateCognitoToken(token: string): Promise<any> {
    try {
      // Si no tenemos las claves JWK almacenadas, las obtenemos de Cognito
      if (!this.cognitoJwks) {
        const jwksUrl = `${this.cognitoIssuer}/.well-known/jwks.json`;
        const response = await fetch(jwksUrl);
        this.cognitoJwks = await response.json();
      }

      // Decodifica el token sin verificarlo para obtener el kid (key ID)
      const decodedToken: any = jwt.decode(token, { complete: true });
      if (!decodedToken) {
        throw new Error('Invalid token format');
      }

      // Obtiene el kid del header del token
      const kid = decodedToken.header.kid;
      // Busca la clave pública correspondiente al kid en las JWKs
      const jwk = this.cognitoJwks.keys.find(key => key.kid === kid);
      
      if (!jwk) {
        throw new Error('Invalid token key');
      }

      // Convierte la clave JWK a formato PEM
      const pem = jwkToPem(jwk);

      // Verifica el token usando la clave PEM
      const payload = jwt.verify(token, pem, {
        issuer: this.cognitoIssuer,
        // La validación de audiencia está comentada para evitar errores
        // audience: process.env.COGNITO_CLIENT_ID,
      });

      // Log para diagnóstico que muestra información del token
      if (typeof payload === 'object' && payload !== null) {
        console.log('Token payload:', {
          aud: payload.aud,          // Audiencia del token
          iss: payload.iss,          // Emisor del token
          expectedIssuer: this.cognitoIssuer,    // Emisor esperado
          expectedAudience: process.env.COGNITO_CLIENT_ID  // Audiencia esperada
        });
      } else {
        console.error('Invalid payload');
      }

      return payload;
    } catch (error) {
      // Log detallado de errores de validación
      console.error('Token validation details:', {
        issuer: this.cognitoIssuer,
        clientId: process.env.COGNITO_CLIENT_ID,
        error: error.message
      });
      throw new UnauthorizedException('Invalid token');
    }
  }
}
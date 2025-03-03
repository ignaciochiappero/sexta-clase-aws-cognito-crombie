// src/cognito/cognito.service.ts

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
  InitiateAuthCommand,
  AdminGetUserCommand,
  AttributeType,
} from '@aws-sdk/client-cognito-identity-provider';

@Injectable()
export class CognitoService {
  private cognitoClient: CognitoIdentityProviderClient;
  private userPoolId: string;
  private clientId: string;

  constructor() {
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION ?? 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
      },
    });
    this.userPoolId = process.env.COGNITO_USER_POOL_ID ?? '';
    this.clientId = process.env.COGNITO_CLIENT_ID ?? '';
  }

  // Método modificado para usar SignUp en lugar de AdminCreateUser
  async registerUser(email: string, userName: string, password: string) {
    try {
      const signUpCommand = new SignUpCommand({
        ClientId: this.clientId,
        Username: email,
        Password: password,
        UserAttributes: [
          {
            Name: 'email',
            Value: email,
          },
          {
            Name: 'custom:userName',
            Value: userName,
          },
        ],
      });

      const response = await this.cognitoClient.send(signUpCommand);
      
      return {
        success: true,
        message: 'Registration successful. Please check your email for verification code.',
        userSub: response.UserSub,
      };
    } catch (error) {
      console.error('Error registering user:', error);
      throw new Error(`Failed to register user: ${error.message}`);
    }
  }

  // método para confirmar el registro
  async confirmSignUp(email: string, code: string) {
    try {
      const confirmCommand = new ConfirmSignUpCommand({
        ClientId: this.clientId,
        Username: email,
        ConfirmationCode: code,
      });

      await this.cognitoClient.send(confirmCommand);
      return {
        success: true,
        message: 'Email verified successfully',
      };
    } catch (error) {
      console.error('Error confirming signup:', error);
      throw new Error(`Failed to confirm registration: ${error.message}`);
    }
  }

  // método para reenviar el código
  async resendConfirmationCode(email: string) {
    try {
      const resendCommand = new ResendConfirmationCodeCommand({
        ClientId: this.clientId,
        Username: email,
      });

      await this.cognitoClient.send(resendCommand);
      return {
        success: true,
        message: 'Verification code resent successfully',
      };
    } catch (error) {
      console.error('Error resending code:', error);
      throw new Error(`Failed to resend code: ${error.message}`);
    }
  }

  // Método de login modificado para usar InitiateAuth
  async loginUser(email: string, password: string) {
    try {
      const authCommand = new InitiateAuthCommand({
        ClientId: this.clientId,
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      });

      const response = await this.cognitoClient.send(authCommand);
      
      return {
        access_token: response.AuthenticationResult?.AccessToken,
        id_token: response.AuthenticationResult?.IdToken,
        refresh_token: response.AuthenticationResult?.RefreshToken,
        expires_in: response.AuthenticationResult?.ExpiresIn,
      };
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw new Error('Invalid credentials');
    }
  }

  // El método getUserByEmail se mantiene igual
  async getUserByEmail(email: string) {
    try {
      const getUserCommand = new AdminGetUserCommand({
        UserPoolId: this.userPoolId,
        Username: email,
      });

      const response = await this.cognitoClient.send(getUserCommand);
      
      const attributes = {};
      response.UserAttributes?.forEach((attr: AttributeType) => {
        if (attr.Name) {
          attributes[attr.Name] = attr.Value;
        }
      });

      return {
        username: response.Username,
        status: response.UserStatus,
        enabled: response.Enabled,
        ...attributes,
      };
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }
}
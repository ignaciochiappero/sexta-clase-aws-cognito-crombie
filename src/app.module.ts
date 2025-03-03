// src/app.module.ts

import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { ItemsModule } from './items/items.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CognitoModule } from './cognito/cognito.module';

@Module({
  imports: [
    PrismaModule, 
    ProductsModule, 
    ItemsModule, 
    UserModule, 
    AuthModule, 
    CognitoModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
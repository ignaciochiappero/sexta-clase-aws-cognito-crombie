//src\s3\s3.controller.ts

import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from './s3.service';

@Controller('s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    // eslint-disable-next-line no-useless-catch
    try {
      const result = await this.s3Service.uploadFile(file);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

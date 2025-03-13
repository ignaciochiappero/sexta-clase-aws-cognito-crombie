/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private s3: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.s3 = new S3Client({ 
      region: this.configService.get<string>('AWS_REGION') ?? 'us-east-1',
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') ?? '',
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') ?? '',
      }
    });
    this.bucketName = this.configService.get<string>('AWS_BUCKET_NAME') ?? '';
  }

  async uploadFile(file: Express.Multer.File) {
    const uploadParams = {
      Bucket: this.bucketName,
      Key: `${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    }
    
    try {
      await this.s3.send(new PutObjectCommand(uploadParams));
      const fileUrl = `https://${this.bucketName}.s3.${this.configService.get<string>('AWS_REGION')}.amazonaws.com/${uploadParams.Key}`;
      return {
        message: 'Archivo subido correctamente',
        key: uploadParams.Key,
        url: fileUrl
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error(`Error al subir archivo: ${error.message}`);
    }
  }
}
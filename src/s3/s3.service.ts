//src\s3\s3.service.ts

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

// Importamos las clases necesarias de AWS SDK para interactuar con S3
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

// Importamos el decorador Injectable de NestJS para poder inyectar este servicio
import { Injectable } from '@nestjs/common';

// Importamos ConfigService para acceder a las variables de entorno
import { ConfigService } from '@nestjs/config';


// Marcamos la clase como inyectable para que pueda ser utilizada por el sistema de inyección de dependencias de NestJS
@Injectable()
export class S3Service {
  // Declaramos una instancia privada del cliente S3
  private s3: S3Client;

  // Declaramos una variable privada para almacenar el nombre del bucket
  private bucketName: string;

  // El constructor recibe el ConfigService como dependencia inyectada
  constructor(private configService: ConfigService) {

    // Inicializamos el cliente S3 con la configuración necesaria
    this.s3 = new S3Client({ 

      // Obtenemos la región de AWS de las variables de entorno, si no existe usamos 'us-east-1' por defecto
      region: this.configService.get<string>('AWS_REGION') ?? 'us-east-1',

      // Configuramos las credenciales de AWS
      credentials: {

        // Obtenemos el ID de acceso de las variables de entorno
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') ?? '',

        // Obtenemos la clave secreta de las variables de entorno
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') ?? '',
      }
    });

    // Guardamos el nombre del bucket de las variables de entorno
    this.bucketName = this.configService.get<string>('AWS_BUCKET_NAME') ?? '';
  }

  // Método para subir archivos a S3
  async uploadFile(file: Express.Multer.File) {

    // Configuramos los parámetros para la subida del archivo
    const uploadParams = {

      Bucket: this.bucketName, // Nombre del bucket donde se subirá el archivo
      Key: `${Date.now()}-${file.originalname}`, // Nombre único del archivo usando timestamp
      Body: file.buffer, // Contenido del archivo
      ContentType: file.mimetype, // Tipo de contenido del archivo
    }
    
    try {

      // Intentamos subir el archivo a S3 usando el comando PutObject
      await this.s3.send(new PutObjectCommand(uploadParams));
      
      // Construimos la URL pública del archivo subido
      const fileUrl = `https://${this.bucketName}.s3.${this.configService.get<string>('AWS_REGION')}.amazonaws.com/${uploadParams.Key}`;
      
      // Retornamos un objeto con la información del archivo subido
      return {
        message: 'Archivo subido correctamente',
        key: uploadParams.Key, // Nombre del archivo en S3
        url: fileUrl // URL pública del archivo
      };
    } catch (error) {
      // Si ocurre un error, lo registramos en la consola
      console.error('Error uploading file:', error);
      // Y lanzamos una excepción con el mensaje de error
      throw new Error(`Error al subir archivo: ${error.message}`);
    }
  }
}